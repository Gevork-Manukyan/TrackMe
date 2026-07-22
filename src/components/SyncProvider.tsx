"use client";

import { useEffect } from "react";
import { claimForUser } from "@/lib/db/dexie";
import { requestSync, startSyncListeners } from "@/lib/db/sync";

/**
 * Boots the local database for the signed-in user and starts syncing.
 * Renders nothing.
 *
 * The claim step matters for shared devices: if IndexedDB belongs to a different
 * account, it is wiped before any screen can read from it.
 */
export function SyncProvider({ userId }: { userId: string }) {
  useEffect(() => {
    let cancelled = false;
    let stopListeners: (() => void) | undefined;

    (async () => {
      await claimForUser(userId);
      if (cancelled) return;
      stopListeners = startSyncListeners();
      void requestSync();
    })();

    return () => {
      cancelled = true;
      stopListeners?.();
    };
  }, [userId]);

  return null;
}
