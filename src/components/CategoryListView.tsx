"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { createCategory } from "@/lib/db/mutations";
import { AddForm } from "./AddForm";
import { StampDots } from "./StampDots";
import { SyncStatus } from "./SyncStatus";
import { ThemeToggle } from "./ThemeToggle";
import { SignOutButton } from "./SignOutButton";

export function CategoryListView({ userId }: { userId: string }) {
  // Reads the local database, so this renders with no connection. useLiveQuery
  // re-runs automatically whenever a mutation or a sync touches these tables.
  const data = useLiveQuery(async () => {
    const categories = await db.categories
      .filter((c) => c.deletedAt === null)
      .toArray();
    const items = await db.items.filter((i) => i.deletedAt === null).toArray();

    categories.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return categories.map((category) => {
      const own = items.filter((i) => i.categoryId === category.id);
      return {
        id: category.id,
        name: category.name,
        total: own.length,
        done: own.filter((i) => i.visited).length,
      };
    });
  }, []);

  const totalStamped =
    data?.reduce((sum, category) => sum + category.done, 0) ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-2 flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          TrackMe
        </h1>
        <div className="flex items-center gap-2">
          {totalStamped > 0 && (
            <span className="font-mono text-xs tracking-widest text-slate uppercase">
              {totalStamped} stamped
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="mb-4 min-h-4">
        <SyncStatus />
      </div>

      <div className="mb-6">
        <AddForm
          onAdd={(name) => createCategory(userId, name)}
          placeholder="Name a new list"
          submitLabel="Add list"
        />
      </div>

      {data === undefined ? (
        // Only shown before IndexedDB has answered — typically a single frame.
        <p className="px-4 py-8 text-center text-slate">Loading your lists…</p>
      ) : data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          No lists yet. Start one — desserts, ramen, dive bars, whatever
          you&rsquo;re chasing.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.map((category) => (
            <li key={category.id}>
              <Link
                href={`/c/${category.id}`}
                className="block rounded-xl border border-rule bg-card p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display truncate text-xl font-semibold">
                    {category.name}
                  </h2>
                  <span className="shrink-0 font-mono text-sm text-slate">
                    {category.total === 0
                      ? "empty"
                      : `${category.done}/${category.total}`}
                  </span>
                </div>
                <StampDots total={category.total} done={category.done} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Signing out is rare — it belongs at the end, not competing with the wordmark. */}
      <div className="mt-auto pt-10">
        <SignOutButton />
      </div>
    </main>
  );
}
