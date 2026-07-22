"use client";

import {
  db,
  getCursor,
  setCursor,
  type LocalCategory,
  type LocalItem,
} from "./dexie";

/**
 * Reconciles the local database with the server. Push and pull happen in one
 * request; see src/app/api/sync/route.ts for the server half.
 *
 * Timestamps travel as ISO-8601 UTC strings, so plain string comparison orders
 * them correctly and no parsing is needed on the hot path.
 */

export type SyncState = {
  online: boolean;
  syncing: boolean;
  /** Set when the server rejected us — syncing stops until the user signs in again. */
  authExpired: boolean;
  lastError: string | null;
};

let state: SyncState = {
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  syncing: false,
  authExpired: false,
  lastError: null,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<SyncState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeToSync(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncState(): SyncState {
  return state;
}

// Server sends the Prisma row; strip it down to what the local table stores.
function toLocalCategory(remote: Record<string, unknown>): LocalCategory {
  return {
    id: String(remote.id),
    userId: String(remote.userId),
    name: String(remote.name),
    createdAt: String(remote.createdAt),
    updatedAt: String(remote.updatedAt),
    deletedAt: remote.deletedAt ? String(remote.deletedAt) : null,
    dirty: 0,
  };
}

function toLocalItem(remote: Record<string, unknown>): LocalItem {
  return {
    id: String(remote.id),
    categoryId: String(remote.categoryId),
    userId: String(remote.userId),
    name: String(remote.name),
    visited: Boolean(remote.visited),
    visitedAt: remote.visitedAt ? String(remote.visitedAt) : null,
    notes: remote.notes ? String(remote.notes) : null,
    address: remote.address ? String(remote.address) : null,
    rating: remote.rating == null ? null : Number(remote.rating),
    url: remote.url ? String(remote.url) : null,
    createdAt: String(remote.createdAt),
    updatedAt: String(remote.updatedAt),
    deletedAt: remote.deletedAt ? String(remote.deletedAt) : null,
    dirty: 0,
  };
}

let inFlight: Promise<void> | null = null;
let queuedAgain = false;

/**
 * Requests a sync, coalescing concurrent callers. If a sync is asked for while
 * one is running, exactly one more runs afterwards — so a burst of edits results
 * in two round trips, not twenty.
 */
export async function requestSync(): Promise<void> {
  if (inFlight) {
    queuedAgain = true;
    return inFlight;
  }
  inFlight = runSync().finally(() => {
    inFlight = null;
    if (queuedAgain) {
      queuedAgain = false;
      void requestSync();
    }
  });
  return inFlight;
}

async function runSync(): Promise<void> {
  if (state.authExpired) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    setState({ online: false });
    return;
  }

  setState({ syncing: true, lastError: null });

  try {
    // Snapshot what is dirty *now*. Anything edited after this point keeps its
    // dirty flag, because we compare against these exact values below.
    const [pushCategories, pushItems, since] = await Promise.all([
      db.categories.where("dirty").equals(1).toArray(),
      db.items.where("dirty").equals(1).toArray(),
      getCursor(),
    ]);

    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        since,
        changes: { categories: pushCategories, items: pushItems },
      }),
    });

    if (response.status === 401) {
      setState({ authExpired: true, syncing: false });
      return;
    }
    if (!response.ok) {
      throw new Error(`sync failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      cursor: string;
      changes: {
        categories: Record<string, unknown>[];
        items: Record<string, unknown>[];
      };
    };

    await db.transaction("rw", db.categories, db.items, async () => {
      // Clear dirty only where the record has not changed since we snapshotted
      // it. If the user edited it mid-request, that edit is still unpushed and
      // must stay dirty or it would be silently lost.
      for (const pushed of pushCategories) {
        const current = await db.categories.get(pushed.id);
        if (current && current.updatedAt === pushed.updatedAt) {
          await db.categories.update(pushed.id, { dirty: 0 });
        }
      }
      for (const pushed of pushItems) {
        const current = await db.items.get(pushed.id);
        if (current && current.updatedAt === pushed.updatedAt) {
          await db.items.update(pushed.id, { dirty: 0 });
        }
      }

      // Apply the server's version, unless we hold a newer unpushed edit.
      for (const raw of payload.changes.categories) {
        const remote = toLocalCategory(raw);
        const local = await db.categories.get(remote.id);
        if (local?.dirty === 1 && local.updatedAt > remote.updatedAt) continue;
        await db.categories.put({ ...remote, dirty: local?.dirty ?? 0 });
      }
      for (const raw of payload.changes.items) {
        const remote = toLocalItem(raw);
        const local = await db.items.get(remote.id);
        if (local?.dirty === 1 && local.updatedAt > remote.updatedAt) continue;
        await db.items.put({ ...remote, dirty: local?.dirty ?? 0 });
      }
    });

    await setCursor(payload.cursor);
    setState({ syncing: false, online: true, lastError: null });
  } catch (error) {
    // Records stay dirty, so the next attempt picks them up. Nothing is lost.
    setState({
      syncing: false,
      lastError: error instanceof Error ? error.message : "sync failed",
    });
  }
}

/** Wires up the triggers that should cause a sync. Returns a cleanup function. */
export function startSyncListeners(): () => void {
  const onOnline = () => {
    setState({ online: true });
    void requestSync();
  };
  const onOffline = () => setState({ online: false });
  const onVisible = () => {
    if (document.visibilityState === "visible") void requestSync();
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  document.addEventListener("visibilitychange", onVisible);

  // A slow heartbeat catches changes made on another device.
  const interval = window.setInterval(() => void requestSync(), 60_000);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    document.removeEventListener("visibilitychange", onVisible);
    window.clearInterval(interval);
  };
}
