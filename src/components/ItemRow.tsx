import { StampButton } from "./StampButton";
import { deleteItem, updateItemDetails } from "@/lib/actions/items";
import { stampDate } from "@/lib/stamp";

export type ItemRowData = {
  id: string;
  name: string;
  visited: boolean;
  visitedAt: Date | null;
  notes: string | null;
  address: string | null;
  rating: number | null;
  url: string | null;
};

/**
 * Presentational — takes data as props and never queries. Phase 4 swaps the
 * data source to Dexie without touching this file.
 */
export function ItemRow({ item }: { item: ItemRowData }) {
  const saveDetails = updateItemDetails.bind(null, item.id);
  const remove = deleteItem.bind(null, item.id);

  const meta = [item.address, item.notes].filter(Boolean).join(" · ");

  return (
    <li className="rounded-xl border border-rule bg-card">
      <div className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[17px] ${item.visited ? "text-slate line-through decoration-stamp/50" : "text-ink"}`}
          >
            {item.name}
          </p>
          {meta && <p className="mt-0.5 truncate text-sm text-slate">{meta}</p>}
          {item.rating != null && (
            <p className="mt-0.5 font-mono text-xs text-slate">
              {"★".repeat(item.rating)}
              <span className="text-rule">{"★".repeat(5 - item.rating)}</span>
            </p>
          )}
        </div>

        <StampButton
          id={item.id}
          name={item.name}
          visited={item.visited}
          stamp={item.visitedAt ? stampDate(item.visitedAt) : null}
        />
      </div>

      <details className="group border-t border-rule">
        <summary className="cursor-pointer list-none px-3 py-2 font-mono text-[11px] tracking-widest text-slate uppercase">
          <span className="group-open:hidden">Details +</span>
          <span className="hidden group-open:inline">Details −</span>
        </summary>

        <div className="px-3 pb-3">
          <form action={saveDetails} className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
                Name
              </span>
              <input
                name="name"
                defaultValue={item.name}
                maxLength={120}
                className="rounded-lg border border-rule bg-ground px-2 py-1.5 text-ink"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
                Where
              </span>
              <input
                name="address"
                defaultValue={item.address ?? ""}
                placeholder="Address or neighborhood"
                className="rounded-lg border border-rule bg-ground px-2 py-1.5 text-ink placeholder:text-slate/60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
                Notes
              </span>
              <textarea
                name="notes"
                defaultValue={item.notes ?? ""}
                rows={2}
                placeholder="What to order, who recommended it"
                className="rounded-lg border border-rule bg-ground px-2 py-1.5 text-ink placeholder:text-slate/60"
              />
            </label>

            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
                  Rating
                </span>
                <input
                  name="rating"
                  type="number"
                  min={1}
                  max={5}
                  defaultValue={item.rating ?? ""}
                  placeholder="1–5"
                  className="w-full rounded-lg border border-rule bg-ground px-2 py-1.5 text-ink placeholder:text-slate/60"
                />
              </label>
              <label className="flex flex-[2] flex-col gap-1">
                <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
                  Link
                </span>
                <input
                  name="url"
                  type="url"
                  defaultValue={item.url ?? ""}
                  placeholder="https://"
                  className="w-full rounded-lg border border-rule bg-ground px-2 py-1.5 text-ink placeholder:text-slate/60"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-1 self-start rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-ground"
            >
              Save changes
            </button>
          </form>

          <form action={remove} className="mt-2 border-t border-rule pt-2">
            <button
              type="submit"
              className="text-sm text-stamp underline underline-offset-2"
            >
              Remove this place
            </button>
          </form>
        </div>
      </details>
    </li>
  );
}
