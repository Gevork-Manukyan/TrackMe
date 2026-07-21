-- Enable Row Level Security on all application tables.
--
-- Why: these tables live in the `public` schema, which Supabase exposes through
-- the Data API (PostgREST). The publishable key ships to every browser, so
-- without RLS anyone could read/write these tables directly and bypass the app.
-- Application-side `userId` filtering does not protect against that.
--
-- Prisma connects as the `postgres` role, which owns these tables and has
-- BYPASSRLS, so server-side queries are unaffected. We deliberately do NOT use
-- FORCE ROW LEVEL SECURITY, which would also apply RLS to the owner.
--
-- NOTE: we read the JWT `sub` claim directly instead of calling auth.uid().
-- auth.uid() is only a wrapper around exactly this, and depending on the `auth`
-- schema would break `prisma migrate dev`, which validates migrations against a
-- vanilla shadow database that has no Supabase schemas.
-- current_setting(..., true) returns NULL when unset, so an anonymous request
-- yields NULL, which never equals a userId and therefore matches no rows.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Item" ENABLE ROW LEVEL SECURITY;

-- Policies target the `authenticated` role only. `anon` gets no policy at all,
-- so unauthenticated Data API access is denied outright.
--
-- FOR ALL gives us both USING and WITH CHECK. WITH CHECK matters: without it a
-- user could UPDATE a row and reassign its "userId" to someone else.
-- Column names are camelCase, so they must be double-quoted.

CREATE POLICY "own_user" ON "User"
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ) = "id"
  )
  WITH CHECK (
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ) = "id"
  );

CREATE POLICY "own_categories" ON "Category"
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ) = "userId"
  )
  WITH CHECK (
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ) = "userId"
  );

CREATE POLICY "own_items" ON "Item"
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ) = "userId"
  )
  WITH CHECK (
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ) = "userId"
  );
