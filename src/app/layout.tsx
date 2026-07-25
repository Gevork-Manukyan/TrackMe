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

export const metadata: Metadata = {
  title: "TrackMe",
  description: "Track the places you want to try, and check them off.",
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
