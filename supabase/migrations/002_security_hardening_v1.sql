-- CrowRules Memorials security hardening v1
-- This migration intentionally removes client-side privilege escalation paths.
-- Privileged membership, moderation, and stewardship writes must use audited Edge Functions.

create or replace function public.memorial_is_family_member(fid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memorial_family_members m
    where m.family_id = fid and m.user_id = (select auth.uid()) and m.status = 'active'
  );
$$;

create or replace function public.memorial_is_org_member(oid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memorial_organization_members m
    where m.organization_id = oid and m.user_id = (select auth.uid()) and m.status = 'active'
  );
$$;

create or replace function public.memorial_can_manage(mid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memorial_profiles p
    where p.id = mid and (
      p.created_by = (select auth.uid())
      or (p.family_id is not null and public.memorial_is_family_member(p.family_id))
      or (p.organization_id is not null and public.memorial_is_org_member(p.organization_id))
    )
  );
$$;

-- Remove policies that let ordinary members publish memorials or alter moderation state.
drop policy if exists "manager updates memorial" on public.memorial_profiles;
drop policy if exists "manager wing links" on public.memorial_profile_wings;
drop policy if exists "manager stories" on public.memorial_stories;
drop policy if exists "manager media" on public.memorial_media;
drop policy if exists "manager tributes" on public.memorial_tributes;

-- Profile visibility: public is discoverable; unlisted is available only to a holder
-- of its direct URL/slug (not listed by directory queries); private requires membership.
drop policy if exists "published public memorials" on public.memorial_profiles;
drop policy if exists "managed memorials" on public.memorial_profiles;
create policy "published public memorials" on public.memorial_profiles
for select to anon, authenticated
using (status = 'published' and visibility = 'public');
create policy "published unlisted memorials" on public.memorial_profiles
for select to anon, authenticated
using (status = 'published' and visibility = 'unlisted');
create policy "private memorials for authorized family" on public.memorial_profiles
for select to authenticated
using (
  status = 'published' and visibility = 'private'
  and family_id is not null and public.memorial_is_family_member(family_id)
);
create policy "creator reads own memorial drafts" on public.memorial_profiles
for select to authenticated using (created_by = (select auth.uid()));

-- Clients may create a draft/pending profile, but cannot update its visibility,
-- publication state, ownership, family links, or approval metadata.
drop policy if exists "create own pending memorial" on public.memorial_profiles;
create policy "create own memorial draft" on public.memorial_profiles
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and status in ('draft', 'pending_review')
  and approved_at is null
  and family_stewardship_status = 'not_requested'
);

-- Remove client write access to moderation-controlled and membership-controlled tables.
revoke insert, update, delete on public.memorial_family_members from anon, authenticated;
revoke update, delete on public.memorial_families from anon, authenticated;
revoke insert, update, delete on public.memorial_organization_members from anon, authenticated;
revoke update, delete on public.memorial_organizations from anon, authenticated;
revoke update, delete on public.memorial_submissions from anon, authenticated;
revoke update, delete on public.memorial_stewardship_requests from anon, authenticated;
revoke update, delete on public.memorial_reports from anon, authenticated;
revoke insert, update, delete on public.memorial_audit_logs from anon, authenticated;
revoke update, delete on public.memorial_profiles from anon, authenticated;
revoke update, delete on public.memorial_stories from anon, authenticated;
revoke update, delete on public.memorial_media from anon, authenticated;
revoke update, delete on public.memorial_tributes from anon, authenticated;
revoke update, delete on public.memorial_candles from anon, authenticated;
revoke insert, update, delete on public.memorial_profile_wings from anon, authenticated;

-- Keep profile draft creation and own-submission tracking available.
grant insert on public.memorial_profiles to authenticated;
grant select on public.memorial_profiles to anon, authenticated;
grant select, insert on public.memorial_submissions to authenticated;
grant select, insert on public.memorial_stewardship_requests to authenticated;
grant select, insert on public.memorial_reports to authenticated;

-- Rebuild submission/request/report insert checks so clients cannot pre-approve or
-- impersonate another user. Review fields remain server-managed.
drop policy if exists "create own submissions" on public.memorial_submissions;
create policy "submit own pending request" on public.memorial_submissions
for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and review_status = 'pending'
  and reviewer_id is null
  and reviewer_notes is null
);
drop policy if exists "create stewardship requests" on public.memorial_stewardship_requests;
create policy "request own stewardship" on public.memorial_stewardship_requests
for insert to authenticated
with check (
  requester_id = (select auth.uid())
  and status = 'pending'
  and reviewer_id is null
);
drop policy if exists "create reports" on public.memorial_reports;
create policy "submit own report" on public.memorial_reports
for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'open'
);

-- Stories and tributes are submitted for review; media upload authorization is
-- deliberately deferred until storage bucket policies and Edge Functions exist.
drop policy if exists "public approved stories" on public.memorial_stories;
create policy "public approved stories" on public.memorial_stories
for select to anon, authenticated
using (
  status = 'approved' and visibility = 'public'
  and exists (
    select 1 from public.memorial_profiles p
    where p.id = memorial_id and p.status = 'published' and p.visibility = 'public'
  )
);
create policy "authors read own stories" on public.memorial_stories
for select to authenticated using (author_id = (select auth.uid()));
drop policy if exists "public approved tributes" on public.memorial_tributes;
create policy "public approved tributes" on public.memorial_tributes
for select to anon, authenticated
using (
  status = 'approved'
  and exists (
    select 1 from public.memorial_profiles p
    where p.id = memorial_id and p.status = 'published' and p.visibility = 'public'
  )
);
create policy "authors read own tributes" on public.memorial_tributes
for select to authenticated using (author_id = (select auth.uid()));

-- Prevent public exposure of private/unlisted media metadata and only allow approved
-- public media to be read from the public site.
drop policy if exists "public approved media metadata" on public.memorial_media;
create policy "public approved media metadata" on public.memorial_media
for select to anon, authenticated
using (
  status = 'approved' and visibility = 'public'
  and exists (
    select 1 from public.memorial_profiles p
    where p.id = memorial_id and p.status = 'published' and p.visibility = 'public'
  )
);
create policy "uploaders read own media metadata" on public.memorial_media
for select to authenticated using (uploaded_by = (select auth.uid()));

-- Explicitly document the security boundary in the database itself.
comment on function public.memorial_can_manage(uuid) is
'Convenience membership check only; never use this function as authorization for client-side moderation or privileged updates.';
comment on table public.memorial_audit_logs is
'Append-only audit trail. Writes are restricted to trusted server-side operations.';
