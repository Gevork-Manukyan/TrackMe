-- Delete a user's application data when their Supabase auth account is deleted.
--
-- Why: public."User" mirrors auth.users but cannot foreign-key to it (auth.users.id
-- is uuid, our id is text, and the auth schema is owned by Supabase). Without this
-- trigger, deleting an auth user orphans their categories and items in the
-- database forever, with no way to reach them.
--
-- Deleting the mirror row cascades to Category and Item via the existing
-- onDelete: Cascade relations in schema.prisma.

CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER is required: the delete is performed by supabase_auth_admin,
-- which has no rights on our public tables. search_path is pinned to empty and
-- every name below is fully qualified, so the function cannot be hijacked by a
-- caller-controlled search_path.
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public."User" WHERE id = OLD.id::text;
  RETURN OLD;
END;
$$;

-- Postgres grants EXECUTE to PUBLIC on new functions by default, which would make
-- this SECURITY DEFINER function reachable by anon/authenticated. Revoke it — only
-- the trigger needs to call this.
REVOKE EXECUTE ON FUNCTION public.handle_auth_user_deleted() FROM PUBLIC;

-- The trigger targets auth.users, which does not exist in the vanilla shadow
-- database that `prisma migrate dev` validates against. Guard it so the migration
-- is a no-op there and still applies correctly on Supabase.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users';
    EXECUTE 'CREATE TRIGGER on_auth_user_deleted
               AFTER DELETE ON auth.users
               FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_deleted()';
  END IF;
END
$$;
