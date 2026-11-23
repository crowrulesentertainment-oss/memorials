# Authentication foundation

## Included
- Email/password account creation and sign-in using the official Supabase JavaScript client v2.
- Email confirmation support through Supabase Auth settings.
- Password reset email flow.
- Persistent browser session and sign-out.
- A clear permission boundary: signing in does not make a user a family manager, organization manager, moderator, or administrator.

## Configure locally / for GitHub Pages
1. Copy `assets/js/config.example.js` to `assets/js/config.js`.
2. Set `supabaseUrl` to the project URL and `supabaseAnonKey` to the project's publishable/anon key.
3. Never put a service-role key in `config.js`, HTML, JavaScript, GitHub Pages, or any browser-delivered asset.
4. In Supabase Authentication > URL Configuration, set the production site URL and add the exact `auth.html` URL to allowed redirect URLs.
5. Enable email/password authentication and configure email templates / SMTP before public launch.
6. Test sign-up confirmation, sign-in, invalid credentials, reset email, expired links, refresh persistence, and sign-out.

## Security boundaries
- This page handles identity only. It does not create family memberships or grant privileged roles.
- Do not rely on hidden buttons or client-side state for authorization. Enforce every protected read/write with RLS and server-side Edge Functions.
- Do not enable memorial submission persistence until the submission Edge Function / policy flow is implemented and tested against migration 002.
- Configure rate limits, CAPTCHA or equivalent abuse controls, and production SMTP before opening registration.
- Keep the public anon key in the browser only with correct RLS. Never expose the service-role secret.

## Known limitations
- OAuth providers are not configured by this page.
- No profile table or public display name is created yet.
- No family/organization invitation acceptance, moderator dashboard, or admin role management is implemented.
- Password reset completion depends on Supabase's configured redirect and recovery flow; a dedicated recovery-password screen is a follow-up.
