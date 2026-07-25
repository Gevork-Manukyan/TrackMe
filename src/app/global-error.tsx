"use client"; // Error boundaries must be Client Components.

// Last-resort boundary for errors thrown by the root layout itself, which the
// segment-level error.tsx cannot catch. It replaces the whole document, so it
// must render its own <html>/<body> and pull in global styles for the tokens.
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A root-layout failure is the worst case — always log it. Hook point for an
    // error-tracking service.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-ground text-ink antialiased">
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-slate">
            The app failed to load. Reloading usually fixes it — your lists are
            stored on this device.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-ink px-4 py-2.5 font-medium text-ground"
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
