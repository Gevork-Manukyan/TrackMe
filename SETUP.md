# TrackMe — Setup (Phase 1)

The app skeleton is built. To run it, you need a Supabase project (for the
database + auth). These steps require your logins, so they're yours to do — then
the app runs locally.

## 1. Create a Supabase project
1. Go to https://supabase.com → New project. Pick a name and a **database
   password** (save it).
2. Wait for it to provision (~1 min).

## 2. Collect your keys and connection strings
- **Settings → API**
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - **Publishable** key (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
    (this replaces the legacy `anon` key; never use the secret/`service_role` key)
- **Settings → Database → Connection string → "Connection pooling" tab**
  - **Transaction** mode (port `6543`) → `DATABASE_URL` (keep the
    `?pgbouncer=true` flag)
  - **Session** mode (port `5432`) → `DIRECT_URL`
  - Replace `[YOUR-PASSWORD]` in both with the DB password from step 1.

## 3. Fill in env vars
```bash
cp .env.example .env.local
# then edit .env.local with the values from step 2
```

## 4. Create the database tables
```bash
npm run db:migrate -- --name init
```
This creates the `User`, `Category`, and `Item` tables in Supabase.

## 5. (Optional) Turn off email confirmation for easier local testing
Supabase → **Authentication → Providers → Email** → toggle **"Confirm email"**
off. Then sign-up logs you straight in. Leave it on for production.

## 5b. (Optional) Enable "Continue with Google"
The login page has a Google button; it works once you enable the provider.
1. **Google Cloud Console** → create an OAuth 2.0 Client ID (type: Web
   application).
   - Authorized redirect URI: `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`
     (Supabase → Authentication → Providers → Google shows the exact callback URL).
2. Copy the Client ID + Client Secret into **Supabase → Authentication →
   Providers → Google** and enable it.
3. **Supabase → Authentication → URL Configuration** → add
   `http://localhost:3000/auth/callback` (and later your Vercel URL) to the
   allowed redirect URLs.

(You can skip this and just use email/password to start — the Google button
simply won't complete until the provider is on.)

## 6. Run it
```bash
npm run dev
```
Open http://localhost:3000 → you'll be redirected to `/login`. Sign up, then
you'll land on the home page showing your email and a category count of 0.

## Verify Phase 1 works
- Sign up / sign in works and lands you on `/`.
- The home page shows your email (proves the Supabase session).
- The category count renders (proves Prisma → Postgres round-trips).
- `npm run db:studio` opens Prisma Studio — you should see one row in `User`.
- Sign out returns you to `/login`; visiting `/` while signed out redirects back.

## What's next (later phases)
- **Phase 2:** category + item CRUD (server actions) — the actual usable app.
- **Phase 3:** PWA manifest + service worker (installable).
- **Phase 4:** offline via Dexie + write queue + sync.

## Deploying to Vercel (whenever you're ready)
Import the repo in Vercel, add the same four env vars in the project settings,
and deploy. Set the Supabase **Authentication → URL Configuration** Site URL and
redirect URLs to your Vercel domain.
