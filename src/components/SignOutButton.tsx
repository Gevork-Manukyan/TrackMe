"use client";

import { useState } from "react";
import { clearLocalData } from "@/lib/db/dexie";

/**
 * Wipes the local database before ending the session. Without this, the next
 * person to sign in on this device would briefly see the previous account's
 * lists rendered straight out of IndexedDB.
 */
export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  return (
    <form
      method="post"
      action="/auth/signout"
      onSubmit={async (event) => {
        // Hold the navigation until the local data is actually gone.
        event.preventDefault();
        const form = event.currentTarget;
        setBusy(true);
        try {
          await clearLocalData();
        } finally {
          form.submit();
        }
      }}
    >
      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden>
          <path
            d="M15 5V4.5A1.5 1.5 0 0 0 13.5 3H5.5A1.5 1.5 0 0 0 4 4.5v15A1.5 1.5 0 0 0 5.5 21h8a1.5 1.5 0 0 0 1.5-1.5V19M10 12h11M18 9l3 3-3 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
