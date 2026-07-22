import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Push local changes and pull remote ones in a single round trip.
 *
 * Conflicts resolve last-write-wins on the client-authored `updatedAt`. The pull
 * cursor uses the server-authored `serverUpdatedAt` instead, so a device with a
 * wrong clock can never skip records it has not seen.
 */

type IncomingCategory = {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type IncomingItem = {
  id: string;
  categoryId: string;
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
};

// Mirrors INKS in src/lib/ink.ts. Kept as a set here so the server never trusts
// a client-supplied colour: these values are interpolated into CSS custom
// property names on render.
const INK_NAMES = new Set([
  "raspberry",
  "vermilion",
  "amber",
  "olive",
  "teal",
  "indigo",
  "plum",
  "rose",
]);

const asDate = (v: string | null | undefined) => (v ? new Date(v) : null);

const isValidDate = (d: Date | null): d is Date =>
  d !== null && !Number.isNaN(d.getTime());

export async function POST(request: NextRequest) {
  // Not requireUser(): that redirects, which is wrong for a fetch. A 401 lets the
  // client stop syncing and prompt to sign in again.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  let body: {
    since?: string | null;
    changes?: { categories?: IncomingCategory[]; items?: IncomingItem[] };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const incomingCategories = body.changes?.categories ?? [];
  const incomingItems = body.changes?.items ?? [];
  const now = new Date();

  // The mirror row exists so Category/Item foreign keys resolve. This is the only
  // place that needs it, so it is created here rather than on every page render.
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: { id: user.id, email: user.email },
  });

  // ---- Push ----------------------------------------------------------------
  // Every write is scoped to the session user. A client-supplied userId is never
  // read; that is the entire ownership boundary.

  if (incomingCategories.length > 0) {
    const ids = incomingCategories.map((c) => c.id);
    const existing = await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true, updatedAt: true },
    });
    const byId = new Map(existing.map((e) => [e.id, e]));

    for (const incoming of incomingCategories) {
      const updatedAt = asDate(incoming.updatedAt);
      if (!isValidDate(updatedAt)) continue;

      const current = byId.get(incoming.id);
      // An id that already belongs to someone else is never touched.
      if (current && current.userId !== user.id) continue;
      // Last-write-wins: an older edit is simply dropped.
      if (current && current.updatedAt >= updatedAt) continue;

      const data = {
        name: incoming.name,
        // Constrained to the known palette so a client cannot inject arbitrary
        // values that would end up in a style attribute.
        color: INK_NAMES.has(incoming.color ?? "") ? incoming.color : null,
        updatedAt,
        deletedAt: asDate(incoming.deletedAt),
        serverUpdatedAt: now,
      };

      await prisma.category.upsert({
        where: { id: incoming.id },
        update: data,
        create: {
          ...data,
          id: incoming.id,
          userId: user.id,
          createdAt: asDate(incoming.createdAt) ?? now,
        },
      });
    }
  }

  if (incomingItems.length > 0) {
    const ids = incomingItems.map((i) => i.id);
    const existing = await prisma.item.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true, updatedAt: true },
    });
    const byId = new Map(existing.map((e) => [e.id, e]));

    // An item may only hang off a category this user owns.
    const ownedCategories = await prisma.category.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const ownedCategoryIds = new Set(ownedCategories.map((c) => c.id));

    for (const incoming of incomingItems) {
      const updatedAt = asDate(incoming.updatedAt);
      if (!isValidDate(updatedAt)) continue;
      if (!ownedCategoryIds.has(incoming.categoryId)) continue;

      const current = byId.get(incoming.id);
      if (current && current.userId !== user.id) continue;
      if (current && current.updatedAt >= updatedAt) continue;

      const rating =
        typeof incoming.rating === "number" &&
        incoming.rating >= 1 &&
        incoming.rating <= 5
          ? incoming.rating
          : null;

      const data = {
        categoryId: incoming.categoryId,
        name: incoming.name,
        visited: Boolean(incoming.visited),
        visitedAt: asDate(incoming.visitedAt),
        notes: incoming.notes || null,
        address: incoming.address || null,
        rating,
        url: incoming.url || null,
        updatedAt,
        deletedAt: asDate(incoming.deletedAt),
        serverUpdatedAt: now,
      } satisfies Prisma.ItemUncheckedUpdateInput;

      await prisma.item.upsert({
        where: { id: incoming.id },
        update: data,
        create: {
          ...data,
          id: incoming.id,
          userId: user.id,
          createdAt: asDate(incoming.createdAt) ?? now,
        },
      });
    }
  }

  // ---- Pull ----------------------------------------------------------------
  // `>=` rather than `>`: two writes sharing a millisecond would otherwise let one
  // slip past the cursor forever. Upserts on the client are idempotent, so the
  // small overlap costs nothing.
  const since = asDate(body.since ?? null);
  const cursorFilter = isValidDate(since) ? { gte: since } : undefined;

  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id, ...(cursorFilter && { serverUpdatedAt: cursorFilter }) },
      orderBy: { serverUpdatedAt: "asc" },
    }),
    prisma.item.findMany({
      where: { userId: user.id, ...(cursorFilter && { serverUpdatedAt: cursorFilter }) },
      orderBy: { serverUpdatedAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    cursor: now.toISOString(),
    changes: { categories, items },
  });
}
