import type { NextConfig } from "next";

// Static security headers applied to every response. The Content-Security-Policy
// is deliberately NOT here: it carries a per-request nonce and is set in the
// proxy instead (src/lib/supabase/proxy.ts), where each request gets a fresh one.
const securityHeaders = [
  // Force HTTPS for two years, including subdomains. Only takes effect once served
  // over HTTPS (i.e. in production), so it's a no-op on local http.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Never let the browser guess a response's type — the one defence against MIME
  // sniffing turning an upload into an executable.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Belt-and-braces clickjacking defence alongside the CSP frame-ancestors rule,
  // for the routes the proxy (and thus the CSP) doesn't cover.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the origin but not the path on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop powerful features this app never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this directory. Without it, Turbopack walks up the
  // tree looking for a lockfile and finds an unrelated project's package-lock.json
  // in the home directory, inferring the wrong root. __dirname is this project.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
