"use client";

import { db, type LocalCategory, type LocalItem } from "./dexie";
import { requestSync } from "./sync";
import { INKS, inkFor } from "@/lib/ink";

/**
 * Every mutation writes IndexedDB and returns immediately — nothing here awaits
 * the network, which is what makes the app usable with no signal. Each write
 * stamps a client-authored `updatedAt` (the basis for last-write-wins) and marks
 * the record dirty, then nudges the sync engine.
 *
 * Ids are generated here rather than by the server so a record created offline
 * has a stable identity from birth and never needs reconciling.
 */

const now = () => new Date().toISOString();

function touched() {
  // Fire and forget: a failed sync leaves the record dirty and it retries later.
  void requestSync();
}

// --- Categories -------------------------------------------------------------

export async function createCategory(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const timestamp = now();
  const id = crypto.randomUUID();

  // Pick the least-used ink rather than hashing the id: a hash collides often
  // enough that two lists side by side end up the same colour, which defeats
  // the point of colouring them at all.
  const existing = await db.categories
    .filter((c) => c.deletedAt === null)
    .toArray();
  const used = new Map<string, number>(INKS.map((ink) => [ink, 0]));
  for (const c of existing) {
    const ink = inkFor(c.id, c.color);
    used.set(ink, (used.get(ink) ?? 0) + 1);
  }
  const color = INKS.reduce((best, ink) =>
    (used.get(ink) ?? 0) < (used.get(best) ?? 0) ? ink : best,
  );

  const category: LocalCategory = {
    id,
    userId,
    name: trimmed,
    color,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    dirty: 1,
  };
  await db.categories.add(category);
  touched();
}

export async function renameCategory(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  await db.categories.update(id, {
    name: trimmed,
    updatedAt: now(),
    dirty: 1,
  });
  touched();
}

export async function setCategoryColor(id: string, color: string) {
  await db.categories.update(id, { color, updatedAt: now(), dirty: 1 });
  touched();
}

export async function deleteCategory(id: string) {
  const timestamp = now();
  await db.transaction("rw", db.categories, db.items, async () => {
    await db.categories.update(id, {
      deletedAt: timestamp,
      updatedAt: timestamp,
      dirty: 1,
    });
    // Mirror the cascade the server used to do, so the deletion propagates for
    // the items too rather than leaving them orphaned on other devices.
    const children = await db.items
      .where("categoryId")
      .equals(id)
      .filter((i) => i.deletedAt === null)
      .toArray();
    await Promise.all(
      children.map((child) =>
        db.items.update(child.id, {
          deletedAt: timestamp,
          updatedAt: timestamp,
          dirty: 1,
        }),
      ),
    );
  });
  touched();
}

// --- Items ------------------------------------------------------------------

export async function createItem(
  userId: string,
  categoryId: string,
  name: string,
) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const timestamp = now();
  const item: LocalItem = {
    id: crypto.randomUUID(),
    categoryId,
    userId,
    name: trimmed,
    visited: false,
    visitedAt: null,
    notes: null,
    address: null,
    rating: null,
    url: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    dirty: 1,
  };
  await db.items.add(item);
  touched();
}

export async function toggleItemVisited(id: string, visited: boolean) {
  const timestamp = now();
  await db.items.update(id, {
    visited,
    visitedAt: visited ? timestamp : null,
    updatedAt: timestamp,
    dirty: 1,
  });
  touched();
}

export async function updateItemDetails(
  id: string,
  fields: {
    name?: string;
    notes: string | null;
    address: string | null;
    rating: number | null;
    url: string | null;
  },
) {
  const name = fields.name?.trim();
  const rating =
    fields.rating != null && fields.rating >= 1 && fields.rating <= 5
      ? fields.rating
      : null;

  await db.items.update(id, {
    // An empty name would erase the only label the place has, so it is ignored.
    ...(name ? { name } : {}),
    notes: fields.notes || null,
    address: fields.address || null,
    rating,
    url: fields.url || null,
    updatedAt: now(),
    dirty: 1,
  });
  touched();
}

/** Sets only the rating — used by the prompt that appears right after stamping. */
export async function setItemRating(id: string, rating: number | null) {
  await db.items.update(id, {
    rating: rating != null && rating >= 1 && rating <= 5 ? rating : null,
    updatedAt: now(),
    dirty: 1,
  });
  touched();
}

export async function deleteItem(id: string) {
  const timestamp = now();
  await db.items.update(id, {
    deletedAt: timestamp,
    updatedAt: timestamp,
    dirty: 1,
  });
  touched();
}
