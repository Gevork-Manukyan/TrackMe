"use client";

import Link from "next/link";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { createCategory } from "@/lib/db/mutations";
import { inkFor } from "@/lib/ink";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { AddForm } from "./AddForm";
import { StampDots } from "./StampDots";
import { SearchField } from "./SearchField";
import { RecentStamps, type RecentStamp } from "./RecentStamps";
import { SyncStatus } from "./SyncStatus";
import { ThemeToggle } from "./ThemeToggle";
import { SignOutButton } from "./SignOutButton";
import { Menu } from "./Menu";

/** Below this, a search field is noise rather than help. */
const SEARCH_THRESHOLD = 8;
const RECENT_LIMIT = 8;

export function CategoryListView({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query).trim().toLowerCase();

  const data = useLiveQuery(async () => {
    const categories = await db.categories
      .filter((c) => c.deletedAt === null)
      .toArray();
    const items = await db.items.filter((i) => i.deletedAt === null).toArray();

    categories.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const inkById = new Map(
      categories.map((c) => [c.id, inkFor(c.id, c.color)] as const),
    );
    const nameById = new Map(categories.map((c) => [c.id, c.name] as const));

    const recent: RecentStamp[] = items
      .filter((i) => i.visited && i.visitedAt && nameById.has(i.categoryId))
      .sort((a, b) => (b.visitedAt ?? "").localeCompare(a.visitedAt ?? ""))
      .slice(0, RECENT_LIMIT)
      .map((i) => ({
        id: i.id,
        name: i.name,
        visitedAt: i.visitedAt as string,
        categoryId: i.categoryId,
        categoryName: nameById.get(i.categoryId) as string,
        ink: inkById.get(i.categoryId)!,
      }));

    return {
      recent,
      lists: categories.map((category) => {
        const own = items.filter((i) => i.categoryId === category.id);
        return {
          id: category.id,
          name: category.name,
          ink: inkById.get(category.id)!,
          stamped: own.filter((i) => i.visited).length,
          total: own.length,
        };
      }),
      // Search spans every list, so a place can be found without remembering
      // where it was filed.
      places: items.map((i) => ({
        id: i.id,
        name: i.name,
        address: i.address,
        notes: i.notes,
        visited: i.visited,
        categoryId: i.categoryId,
        categoryName: nameById.get(i.categoryId) ?? "",
        ink: inkById.get(i.categoryId),
      })),
    };
  }, []);

  const lists = data?.lists ?? [];
  const places = data?.places ?? [];
  const showSearch = places.length >= SEARCH_THRESHOLD || lists.length >= 6;

  const results = search
    ? places.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.address?.toLowerCase().includes(search) ||
          p.notes?.toLowerCase().includes(search) ||
          p.categoryName.toLowerCase().includes(search),
      )
    : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-1 flex items-center justify-between gap-3">
        <h1 className="font-display display-wonk text-[2.5rem] leading-none font-semibold tracking-tight">
          TrackMe
        </h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Menu label="Account options">
            {() => (
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[11px] tracking-widest text-slate uppercase">
                  Account
                </p>
                <SignOutButton />
              </div>
            )}
          </Menu>
        </div>
      </header>

      <div className="mb-5 min-h-4">
        <SyncStatus />
      </div>

      {data !== undefined && results === null && (
        <div className="mb-7">
          <RecentStamps stamps={data.recent} />
        </div>
      )}

      <div className="mb-3">
        <AddForm
          onAdd={(name) => createCategory(userId, name)}
          placeholder="Name a new list"
          submitLabel="Add list"
        />
      </div>

      {showSearch && (
        <div className="mb-5">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search every list"
            hiddenCount={null}
          />
        </div>
      )}

      {results !== null ? (
        <SearchResults results={results} query={search} />
      ) : data === undefined ? (
        <p className="px-4 py-8 text-center text-slate">Loading your lists…</p>
      ) : lists.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          No lists yet. Start one — desserts, ramen, dive bars, whatever
          you&rsquo;re chasing.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lists.map((list) => (
            <li key={list.id}>
              <Link
                href={`/c/${list.id}`}
                className="block rounded-2xl border border-rule bg-card p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2
                    className="font-display display-wonk truncate text-2xl font-semibold"
                    style={{ color: `var(--ink-${list.ink})` }}
                  >
                    {list.name}
                  </h2>
                  <span className="shrink-0 font-mono text-xs tracking-widest text-slate uppercase">
                    {list.stamped > 0
                      ? `${list.stamped} stamped`
                      : list.total === 0
                        ? "empty"
                        : "none yet"}
                  </span>
                </div>
                <StampDots stamps={list.stamped} />
              </Link>
            </li>
          ))}
        </ul>
      )}

    </main>
  );
}

function SearchResults({
  results,
  query,
}: {
  results: {
    id: string;
    name: string;
    address: string | null;
    visited: boolean;
    categoryId: string;
    categoryName: string;
    ink?: ReturnType<typeof inkFor>;
  }[];
  query: string;
}) {
  if (results.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-rule px-4 py-8 text-center text-slate">
        Nothing matches &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {results.map((place) => (
        <li key={place.id}>
          <Link
            href={`/c/${place.categoryId}?q=${encodeURIComponent(query)}`}
            className="flex items-center gap-3 rounded-xl border border-rule bg-card px-4 py-3"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: `var(--ink-${place.ink})` }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate ${place.visited ? "text-slate" : "text-ink"}`}
              >
                {place.name}
              </span>
              <span className="block truncate text-xs text-slate">
                {place.categoryName}
                {place.address ? ` · ${place.address}` : ""}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
