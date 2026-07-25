"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";

/**
 * Segment-level error boundary. Catches render/runtime errors in the page tree —
 * most likely an IndexedDB read failing on a locked-down or private-mode browser,
 * which for an offline-first app is a real possibility rather than a rare one.
 *
 * `reset()` re-renders this segment's children; because the lists come from a
 * Dexie live query rather than a server fetch, re-rendering re-runs that query,
 * which is exactly the recovery we want. (Next 16 also offers `unstable_retry`,
 * but that re-fetches server data we don't have here.)
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook point for an error-tracking service (Sentry, etc.). Console for now.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="font-display display-wonk text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-slate">
        The app hit an unexpected error. Your saved lists are stored on this
        device and should be safe.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-ink px-4 py-2.5 font-medium text-ground"
      >
        Try again
      </button>
    </main>
  );
}
