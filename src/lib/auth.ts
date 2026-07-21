import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the authenticated Supabase user and ensures a matching row exists in
 * our Prisma `User` table (created on first login). Redirects to /login if there
 * is no session. Call this at the top of every server action and protected page.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Mirror the Supabase auth user into our data schema (idempotent).
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: { id: user.id, email: user.email },
  });

  return user;
}
