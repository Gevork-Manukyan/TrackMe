// Served by the service worker when a page load fails with no connection.
// Must stay static and outside auth — see the proxy matcher in src/proxy.ts.
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 text-center">
      <div
        className="mx-auto h-14 w-14 rounded-full border-2 border-dashed border-rule"
        aria-hidden
      />
      <h1 className="font-display text-2xl font-semibold">No connection</h1>
      <p className="text-slate">
        Your lists need a connection right now. Once you&rsquo;re back online
        they&rsquo;ll load as usual.
      </p>
    </main>
  );
}
