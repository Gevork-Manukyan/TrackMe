"use client";

import Dexie, { type Table } from "dexie";

/**
 * The local copy of a user's lists. This is the app's read path — every screen
 * renders from here, so it works with no connection. The server is reconciled
 * separately by src/lib/db/sync.ts.
 *
 * Records mirror the Prisma models, plus a `dirty` flag marking rows that have
 * local edits not yet accepted by the server.
 */

export type LocalCategory = {
  id: string;
  userId: string;
  name: string;
  /** The list's ink. Null on lists created before colours existed. */
  color: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /** 1 = waiting to be pushed. Indexed so the pending count is a cheap query. */
  dirty: 0 | 1;
};

export type LocalItem = {
  id: string;
  categoryId: string;
  userId: string;
  name: string;
  visited: boolean;
  visitedAt: string | null;
  notes: string | null;
  address: string | null;
  rating: number | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  dirty: 0 | 1;
};

export type MetaRow = { key: string; value: string };

class TrackMeDB extends Dexie {
  categories!: Table<LocalCategory, string>;
  items!: Table<LocalItem, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super("trackme");
    // `visited` is not indexed: IndexedDB cannot index booleans, and sorting by
    // it is done in memory over a small list anyway.
    this.version(1).stores({
      categories: "id, userId, updatedAt, deletedAt, dirty",
      items: "id, categoryId, userId, updatedAt, deletedAt, dirty",
      meta: "key",
    });
  }
}

export const db = new TrackMeDB();

const CURSOR_KEY = "syncCursor";
const OWNER_KEY = "ownerUserId";

export async function getCursor(): Promise<string | null> {
  return (await db.meta.get(CURSOR_KEY))?.value ?? null;
}

export async function setCursor(cursor: string): Promise<void> {
  await db.meta.put({ key: CURSOR_KEY, value: cursor });
}

/**
 * Guards against two accounts sharing a device: if the local database belongs to
 * a different user, wipe it before anything reads from it. Returns true when a
 * wipe happened.
 */
export async function claimForUser(userId: string): Promise<boolean> {
  const owner = (await db.meta.get(OWNER_KEY))?.value ?? null;
  if (owner === userId) return false;

  if (owner !== null) await clearLocalData();
  await db.meta.put({ key: OWNER_KEY, value: userId });
  return owner !== null;
}

/** Drops every local record. Used on sign-out and on account switch. */
export async function clearLocalData(): Promise<void> {
  await db.transaction("rw", db.categories, db.items, db.meta, async () => {
    await Promise.all([db.categories.clear(), db.items.clear(), db.meta.clear()]);
  });
}
