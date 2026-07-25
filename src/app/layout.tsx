import type { Metadata, Viewport } from "next";
import { Fraunces, Schibsted_Grotesk, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

// Display face — wordmark and list titles only. SOFT rounds the terminals and
// WONK swaps in the slanted, off-kilter forms; without them Fraunces is just
// another serif. opsz lets it get properly characterful at large sizes.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

// Body/UI face.
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  display: "swap",
});

// Utility face — counts, dates, the date inside the stamp.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// The nonce-based CSP (src/lib/supabase/proxy.ts) requires dynamic rendering:
// Next can only stamp the per-request nonce onto its scripts during SSR, so a
// statically prerendered page would ship scripts the CSP then blocks — a broken,
// non-interactive page in production. Force every route dynamic. (The app is
// auth-gated and goes through the proxy on every request, so it's effectively
// dynamic anyway.)
export const dynamic = "force-dynamic";

// Falls back to the production domain so previews unfurl and canonical URLs
// resolve even if the env var isn't set (e.g. it's not configured on Vercel yet).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://trackme.gevorkmanukyan.com";

export const metadata: Metadata = {
  // Resolves every relative URL below (canonical, OG/Twitter images) to absolute.
  // Without it, link-preview scrapers can't fetch relative image paths.
  metadataBase: new URL(siteUrl),
  title: {
    default: "TrackMe — a passport for the places you want to try",
    template: "%s · TrackMe",
  },
  description:
    "Keep a running list of the places you want to try, and stamp each one when you go. A playful passport for your city — and it works offline.",
  applicationName: "TrackMe",
  keywords: [
    "places to try",
    "bucket list",
    "restaurant list",
    "travel checklist",
    "passport stamps",
    "offline app",
  ],
  authors: [{ name: "Gevork Manukyan" }],
  creator: "Gevork Manukyan",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "TrackMe",
    title: "TrackMe — a passport for the places you want to try",
    description:
      "Keep a running list of the places you want to try, and stamp each one when you go.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackMe — a passport for the places you want to try",
    description:
      "Keep a running list of the places you want to try, and stamp each one when you go.",
  },
  appleWebApp: {
    capable: true,
    title: "TrackMe",
    // Lets the app draw behind the iOS status bar when installed.
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  // viewportFit: cover pairs with the translucent status bar on notched iPhones.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E9EDF2" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1626" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${schibsted.variable} ${geistMono.variable} h-full antialiased`}
      // The inline script below stamps data-theme onto this element before
      // React hydrates, so the server HTML legitimately differs here. This
      // suppresses the warning for <html>'s own attributes only — mismatches
      // anywhere inside the tree are still reported.
      suppressHydrationWarning
    >
      <head>
        {/*
          Applies a saved theme during HTML parse, before the first paint.
          Without this the page renders with the system theme and then snaps to
          the saved one — a visible flash on every navigation.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("trackme-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistrar />
        <Analytics />
      </body>
    </html>
  );
}
