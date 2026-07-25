import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// SHA-256 of the inline theme <script> in app/layout.tsx (the pre-hydration
// data-theme setter). That script is static, so we allow it by hash rather than a
// nonce: a nonce on an inline script causes a React hydration mismatch (React
// strips the nonce value client-side). Hashes are still honoured under
// strict-dynamic. If the script body changes, recompute this hash.
const THEME_SCRIPT_HASH = "'sha256-3PblYBO/FLr125KS4+Ole/LG2OkhTh2KR11Jex/aDho='";

/**
 * Builds a per-request Content-Security-Policy.
 *
 * Scripts use a nonce + `strict-dynamic`: only scripts we mint are trusted, and
 * that trust propagates to scripts they inject at runtime (so Vercel Analytics,
 * which appends its beacon script via createElement, is allowed without an
 * origin allowlist). Host allowlists are ignored once strict-dynamic is present.
 *
 * Styles need `'unsafe-inline'` because the UI sets colours through inline
 * `style={{ ... }}` attributes (per-list ink, stamp rotation) — attribute styles
 * cannot carry a nonce. Inline style is far lower risk than inline script.
 *
 * `connect-src` must include the Supabase origin: the browser talks to Supabase
 * Auth directly (login, token refresh). Analytics beacons are same-origin.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  // Derive the Supabase origin (and its ws:// form) from the public URL so the
  // policy tracks the configured project without hardcoding.
  let supabaseSources = "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const origin = new URL(supabaseUrl).origin;
      supabaseSources = ` ${origin} ${origin.replace(/^http/, "ws")}`;
    } catch {
      // A malformed URL just means no extra source — login will surface the
      // misconfiguration far more loudly than a CSP report would.
    }
  }

  return [
    `default-src 'self'`,
    // 'unsafe-eval' is only needed in dev, where React uses eval for better stacks.
    `script-src 'self' 'nonce-${nonce}' ${THEME_SCRIPT_HASH} 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self'${supabaseSources}`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

// Refreshes the Supabase auth session on every request and guards routes.
// Adapted from the official @supabase/ssr Next.js middleware pattern, extended to
// attach a nonce-based CSP. The nonce is set on the *request* headers so Next's
// SSR picks it up and stamps it onto its own framework/inline scripts, and on the
// *response* headers so the browser enforces the policy.
export async function updateSession(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser() —
  // it can cause hard-to-debug session logout bugs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated users are redirected to /login (except on auth routes).
  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  // The root is public: signed-out visitors see the landing page there (the page
  // itself decides landing-vs-lists based on the session), so it must not bounce.
  const isPublicRoute = pathname === "/";

  // API routes must answer for themselves. Redirecting them would hand fetch()
  // an HTML login page with a 200, so the client could never tell an expired
  // session from a real failure — /api/sync returns a proper 401 instead.
  const isApiRoute = pathname.startsWith("/api");

  if (!user && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("content-security-policy", csp);
    return redirect;
  }

  supabaseResponse.headers.set("content-security-policy", csp);
  return supabaseResponse;
}
