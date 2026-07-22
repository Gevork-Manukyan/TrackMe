"use client";

import { StampButton } from "./StampButton";
import { RatingInput } from "./RatingInput";
import { deleteItem, updateItemDetails } from "@/lib/db/mutations";
import type { LocalItem } from "@/lib/db/dexie";

const fieldClass =
  "rounded-lg border border-rule bg-ground px-2 py-1.5 text-ink placeholder:text-slate/60";
const labelClass =
  "font-mono text-[11px] tracking-widest text-slate uppercase";

/**
 * Presentational — takes a record as a prop and never queries.
 *
 * The row itself is the disclosure control: <summary> covers the name and meta,
 * so tapping anywhere on the text opens the details. The stamp deliberately sits
 * *outside* <details> and is positioned over the row, because content inside
 * <details> is hidden while closed, and anything inside <summary> would toggle
 * the panel when pressed.
 */
export function ItemRow({ item }: { item: LocalItem }) {
  const meta = [item.address, item.notes].filter(Boolean).join(" · ");

  return (
    <li className="relative rounded-xl border border-rule bg-card">
      <details>
        {/* min-height reserves room for the stamp, which is absolutely
            positioned and would otherwise overflow a row with no meta line.
            Centring keeps a one-line row aligned with the stamp beside it. */}
        <summary className="flex min-h-[4.75rem] cursor-pointer flex-col justify-center px-4 py-3 pr-20">
          <span
            className={`block truncate text-[17px] ${
              item.visited ? "text-slate" : "text-ink"
            }`}
          >
            {item.name}
          </span>

          {meta && (
            <span className="mt-0.5 block truncate text-sm text-slate">
              {meta}
            </span>
          )}

          {item.rating != null && (
            <span className="mt-1 block text-sm leading-none">
              <span className="text-ink">{"★".repeat(item.rating)}</span>
              <span className="text-rule">{"★".repeat(5 - item.rating)}</span>
            </span>
          )}
        </summary>

        <div className="border-t border-rule px-4 pt-3 pb-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const ratingRaw = String(data.get("rating") ?? "");
              void updateItemDetails(item.id, {
                name: String(data.get("name") ?? ""),
                notes: String(data.get("notes") ?? "") || null,
                address: String(data.get("address") ?? "") || null,
                rating: ratingRaw ? Number(ratingRaw) : null,
                url: String(data.get("url") ?? "") || null,
              });
              // Collapse so the saved values are visible on the row.
              (event.currentTarget.closest("details") as HTMLDetailsElement).open =
                false;
            }}
            className="flex flex-col gap-2.5"
          >
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Name</span>
              <input
                name="name"
                defaultValue={item.name}
                maxLength={120}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className={labelClass}>Where</span>
              <input
                name="address"
                defaultValue={item.address ?? ""}
                placeholder="Address or neighborhood"
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className={labelClass}>Notes</span>
              <textarea
                name="notes"
                defaultValue={item.notes ?? ""}
                rows={2}
                placeholder="What to order, who recommended it"
                className={fieldClass}
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className={labelClass}>Rating</span>
              <RatingInput defaultValue={item.rating} />
            </div>

            <label className="flex flex-col gap-1">
              <span className={labelClass}>Link</span>
              <input
                name="url"
                type="url"
                defaultValue={item.url ?? ""}
                placeholder="https://"
                className={`w-full ${fieldClass}`}
              />
            </label>

            <div className="mt-1 flex items-center justify-between gap-3">
              <button
                type="submit"
                className="rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-ground"
              >
                Save changes
              </button>

              <button
                type="button"
                onClick={() => void deleteItem(item.id)}
                className="text-sm text-slate underline underline-offset-2 transition-colors hover:text-stamp"
              >
                Remove
              </button>
            </div>
          </form>
        </div>
      </details>

      {/* Outside <details> so it stays visible when collapsed and never toggles it. */}
      <div className="absolute top-2.5 right-3">
        <StampButton
          id={item.id}
          name={item.name}
          visited={item.visited}
          visitedAt={item.visitedAt}
        />
      </div>
    </li>
  );
}
