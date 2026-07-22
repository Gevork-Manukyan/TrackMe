"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { createItem, deleteCategory } from "@/lib/db/mutations";
import { inkFor } from "@/lib/ink";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { AddForm } from "./AddForm";
import { ItemRow } from "./ItemRow";
import { StampDots } from "./StampDots";
import { InkPicker } from "./InkPicker";
import { ConfirmButton } from "./ConfirmButton";
import { SearchField, useHideVisited } from "./SearchField";
import { SyncStatus } from "./SyncStatus";
import { ThemeToggle } from "./ThemeToggle";

/** Below this, a search field is noise rather than help. */
const SEARCH_THRESHOLD = 8;

export function CategoryDetailView({
  userId,
  categoryId,
}: {
  userId: string;
  categoryId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Arriving from a home-screen search result lands already filtered, rather
  // than at the top of sixty rows.
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const search = useDebouncedValue(query).trim().toLowerCase();
  const hideVisited = useHideVisited();

  const [justStamped, setJustStamped] = useState<string | null>(null);

  const data = useLiveQuery(async () => {
    const category = await db.categories.get(categoryId);
    if (!category || category.deletedAt !== null)
      return { missing: true } as const;

    const items = await db.items
      .where("categoryId")
      .equals(categoryId)
      .filter((i) => i.deletedAt === null)
      .toArray();

    // Strictly the order they were added. Sorting visited places away made a row
    // jump out from under the finger that had just tapped it.
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
        <p className="mt-8 rounded-2xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          This list isn&rsquo;t here. It may have been deleted on another device.
        </p>
      </main>
    );
  }

  const { category, items } = data;
  const ink = inkFor(category.id, category.color);
  const stamped = items.filter((i) => i.visited).length;

  // Counts and rank always reflect everything; hiding is not forgetting.
  //
  // A search deliberately overrides "hide visited". Searching means you are
  // looking for one specific place, and it is almost certainly one you have
  // been to — leaving the filter on makes the app answer "nothing matches" for
  // a place that is right there.
  const visible = items
    .filter((i) => (hideVisited && !search ? !i.visited : true))
    .filter((i) =>
      search
        ? i.name.toLowerCase().includes(search) ||
          i.address?.toLowerCase().includes(search) ||
          i.notes?.toLowerCase().includes(search)
        : true,
    );

  const showSearch = items.length >= SEARCH_THRESHOLD;

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

      <header className="mt-3">
        <h1
          className="font-display display-wonk truncate text-4xl leading-none font-semibold tracking-tight"
          style={{ color: `var(--ink-${ink})` }}
        >
          {category.name}
        </h1>
        <p className="mt-2 font-mono text-xs tracking-widest text-slate uppercase">
          {stamped > 0 ? `${stamped} stamped` : "none stamped yet"}
        </p>
        <StampDots stamps={stamped} />
      </header>

      <div className="mt-3 mb-4 min-h-4">
        <SyncStatus />
      </div>

      <div className="mb-3">
        <AddForm
          onAdd={(name) => createItem(userId, categoryId, name)}
          placeholder="Add a place"
          submitLabel="Add"
        />
      </div>

      {showSearch && (
        <div className="mb-5">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search this list"
            hiddenCount={stamped}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          {items.length === 0
            ? "Nothing here yet. Add the first place."
            : search
              ? `Nothing matches “${search}”.`
              : "Every place here is stamped. Nice."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visible.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              ink={ink}
              askForRating={justStamped === item.id && item.rating == null}
              onStamped={() => setJustStamped(item.id)}
              onRatingDone={() => setJustStamped(null)}
            />
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-col gap-4 border-t border-rule pt-4">
        <InkPicker categoryId={category.id} current={ink} />

        <ConfirmButton
          // Otherwise it stretches to the flex column's width and centres itself.
          className="self-start"
          label="Delete this list"
          question={`Delete “${category.name}” and its ${items.length} ${
            items.length === 1 ? "place" : "places"
          }?`}
          confirmLabel="Delete"
          onConfirm={async () => {
            await deleteCategory(categoryId);
            router.push("/");
          }}
        />
      </div>
    </main>
  );
}
