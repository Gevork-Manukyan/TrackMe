import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Identity for rendering a page. Returns the signed-in user's id, or redirects
 * to /login.
 *
 * Deliberately does NOT touch the database. It used to upsert the mirror `User`
 * row on every render, which meant a write to Postgres — over the network — on
 * every single navigation. That row only exists so Category/Item foreign keys
 * resolve, and the only writer of those tables is /api/sync, so the upsert now
 * lives there (see ensureUserRow) where it is actually needed.
 *
 * getClaims() verifies the JWT signature rather than calling the Auth server, so
 * this stays cheap. The real authorization boundary is /api/sync, which
 * independently verifies the session and forces ownership on every record.
 */
export async function requireUser(): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string") redirect("/login");

  return { id: sub };
}
