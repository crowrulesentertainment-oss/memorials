# Security review: RLS hardening v1

## Why this migration exists

The initial foundation used a broad `memorial_can_manage()` check for client updates. Because that helper treated the profile creator and every active family/organization member alike, a normal browser client could potentially change publication and visibility fields or alter content moderation state. The first migration is a foundation only; do not treat it as production-safe without this follow-up.

## What migration 002 changes

- Removes direct client update/delete policies for memorial profiles and moderation-controlled content.
- Keeps profile creation limited to the signed-in creator and draft/pending states.
- Makes published public and unlisted profiles readable; unlisted records remain excluded from directory/search queries in application code. A direct URL is shareable, not confidential.
- Restricts private profile reads to active family membership. Organization membership does not grant private family access.
- Removes client-side membership mutation and audit-log writes.
- Constrains client-created submission, stewardship-request, and report rows to the authenticated user and initial pending/open state.
- Leaves moderation, membership invitations, stewardship transfers, audit writes, and privileged profile edits for trusted Edge Functions.

## Important limitations before production

1. Review this migration against the exact deployed schema and Supabase grants in a disposable staging project. It is not safe to apply blindly to an existing CrowRules database.
2. The existing schema does not yet provide a secure invitation/acceptance flow for family or organization membership. Membership changes must remain server-side until that workflow exists.
3. Private profile access currently checks active family membership only. Private organization collections and per-member roles need a separately designed authorization model.
4. The public client should query unlisted profiles by their direct slug only; never include them in search, browse, related-profile, sitemap, or public API listing results.
5. Storage buckets are not provisioned by this migration. Do not upload private media to a public bucket. Add object-level policies and signed URL delivery before enabling uploads.
6. A trusted Edge Function must verify moderator identity from server-controlled configuration/claims, validate every requested transition, and append an audit record. Never trust a client-supplied role, reviewer ID, or approval flag.
7. Add automated tests for anon/authenticated access to public, unlisted, private, draft, pending, rejected, and archived profiles; test membership revocation and attempts to self-publish.
8. Add rate limits, bot protection, input validation, duplicate detection, consent/rights attestations, and retention/deletion procedures before opening submissions broadly.

## Manual verification matrix

| Scenario | Expected result |
|---|---|
| Anonymous visitor reads published public profile | Allowed |
| Anonymous visitor reads published unlisted profile using exact URL | Allowed |
| Anonymous visitor lists/searches unlisted profiles | Application must exclude them |
| Unrelated signed-in user reads private profile | Denied |
| Active family member reads private profile | Allowed |
| Organization member reads private family profile | Denied |
| Creator inserts draft/pending profile | Allowed |
| Creator attempts to insert published profile | Denied |
| Creator/member attempts to update profile visibility/status | Denied |
| Browser user changes membership or audit rows | Denied |
| Browser user sets a submission to approved | Denied |

## Deployment rule

Apply only to a dedicated staging Memorials project after reviewing the base migration, then run the matrix above. No service-role key belongs in browser code. This migration does not activate authentication, form persistence, storage, or moderation UI by itself.
