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
        className="text-sm text-slate underline underline-offset-2 transition-colors hover:text-ink disabled:opacity-50"
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
