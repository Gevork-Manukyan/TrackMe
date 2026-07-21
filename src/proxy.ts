import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed the Middleware convention to Proxy; behaviour is identical.
// This is an optimistic check only — it refreshes the Supabase session and
// bounces signed-out visitors to /login. Real authorization happens server-side
// in requireUser() (src/lib/auth.ts), which every page and action calls.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on all paths except static assets and image optimization files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
