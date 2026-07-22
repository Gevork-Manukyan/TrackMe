"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { createItem, deleteCategory } from "@/lib/db/mutations";
import { AddForm } from "./AddForm";
import { ItemRow } from "./ItemRow";
import { SyncStatus } from "./SyncStatus";
import { ThemeToggle } from "./ThemeToggle";

export function CategoryDetailView({
  userId,
  categoryId,
}: {
  userId: string;
  categoryId: string;
}) {
  const router = useRouter();
  // The row most recently stamped, which is offered a quick rating.
  const [justStamped, setJustStamped] = useState<string | null>(null);

  const data = useLiveQuery(async () => {
    const category = await db.categories.get(categoryId);
    if (!category || category.deletedAt !== null) return { missing: true } as const;

    const items = await db.items
      .where("categoryId")
      .equals(categoryId)
      .filter((i) => i.deletedAt === null)
      .toArray();

    // Strictly the order they were added, and nothing else. Sorting visited
    // places to the bottom meant a row jumped away the instant it was stamped,
    // under the finger that just tapped it. A list you wrote stays where you
    // wrote it; the stamp itself already shows what has been visited.
    items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return { missing: false, category, items } as const;
  }, [categoryId]);

  if (data === undefined) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <p className="px-4 py-8 text-center text-slate">Loading…</p>
      </main>
    );
  }

  if (data.missing) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <Link
          href="/"
          className="font-mono text-xs tracking-widest text-slate uppercase"
        >
          ← All lists
        </Link>
        <p className="mt-8 rounded-xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          This list isn&rsquo;t here. It may have been deleted on another device.
        </p>
      </main>
    );
  }

  const { category, items } = data;
  const done = items.filter((i) => i.visited).length;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-mono text-xs tracking-widest text-slate uppercase"
        >
          ← All lists
        </Link>
        <ThemeToggle />
      </div>

      <header className="mt-3 flex items-baseline justify-between gap-3">
        <h1 className="font-display truncate text-3xl font-semibold tracking-tight">
          {category.name}
        </h1>
        <span className="shrink-0 font-mono text-sm text-slate">
          {done}/{items.length}
        </span>
      </header>

      <div className="mt-2 mb-4 min-h-4">
        <SyncStatus />
      </div>

      <div className="mb-6">
        <AddForm
          onAdd={(name) => createItem(userId, categoryId, name)}
          placeholder="Add a place"
          submitLabel="Add"
        />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          Nothing here yet. Add the first place.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              // Only ask for a rating on the row just stamped, and only if it
              // doesn't already have one.
              askForRating={justStamped === item.id && item.rating == null}
              onStamped={() => setJustStamped(item.id)}
              onRatingDone={() => setJustStamped(null)}
            />
          ))}
        </ul>
      )}

      {/* Destructive, but quiet: it only reddens on hover so it never competes
          with "Add" for attention, and never reads as the primary action. */}
      <div className="mt-10 border-t border-rule pt-4">
        <button
          type="button"
          onClick={async () => {
            await deleteCategory(categoryId);
            router.push("/");
          }}
          className="text-sm text-slate underline underline-offset-2 transition-colors hover:text-stamp"
        >
          Delete this list
        </button>
      </div>
    </main>
  );
}
