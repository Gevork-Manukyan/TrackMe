"use client";

import { useSyncExternalStore } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import {
  getSyncState,
  subscribeToSync,
  type SyncState,
} from "@/lib/db/sync";

// Must be a stable reference: returning a fresh object each call makes React
// think the store changed on every render, and it warns about an infinite loop.
const SERVER_STATE: SyncState = {
  online: true,
  syncing: false,
  authExpired: false,
  lastError: null,
};
const serverSnapshot = () => SERVER_STATE;

/**
 * Silent when everything is online and settled. Speaks up only when there is
 * something the user would want to know: no connection, unsaved changes waiting,
 * or a session that needs renewing.
 */
export function SyncStatus() {
  const state = useSyncExternalStore(
    subscribeToSync,
    getSyncState,
    serverSnapshot,
  );

  const pending = useLiveQuery(
    async () => {
      const [categories, items] = await Promise.all([
        db.categories.where("dirty").equals(1).count(),
        db.items.where("dirty").equals(1).count(),
      ]);
      return categories + items;
    },
    [],
    0,
  );

  if (state.authExpired) {
    return (
      <p className="font-mono text-[11px] tracking-widest text-stamp uppercase">
        Session expired —{" "}
        <a href="/login" className="underline underline-offset-2">
          sign in
        </a>
      </p>
    );
  }

  if (!state.online) {
    return (
      <p className="font-mono text-[11px] tracking-widest text-slate uppercase">
        Offline{pending > 0 ? ` — ${pending} to sync` : ""}
      </p>
    );
  }

  if (pending > 0) {
    return (
      <p className="font-mono text-[11px] tracking-widest text-slate uppercase">
        {state.syncing ? "Syncing…" : `${pending} to sync`}
      </p>
    );
  }

  return null;
}
