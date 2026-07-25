import Link from "next/link";

// Shown for any unmatched URL (and any notFound() call). A signed-out visitor is
// bounced to /login by the proxy before reaching here; this is mainly for a
// signed-in user following a stale link to a list that no longer exists.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-mono text-xs tracking-widest text-slate uppercase">
        404
      </p>
      <h1 className="font-display display-wonk text-4xl font-semibold tracking-tight">
        Nothing stamped here
      </h1>
      <p className="text-slate">
        That page doesn&rsquo;t exist — the list may have been deleted or the link
        is out of date.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-ink px-4 py-2.5 font-medium text-ground"
      >
        Back to your lists
      </Link>
    </main>
  );
}
