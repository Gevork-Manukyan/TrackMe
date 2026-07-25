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
  // Run on all paths except static assets and the PWA files. sw.js and /offline
  // must stay reachable while signed out, or the service worker can never
  // register and the offline fallback would itself redirect to /login. robots.txt
  // and sitemap.xml must stay reachable too, or crawlers get a login redirect
  // instead of the metadata routes.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|sw\\.js|offline|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
