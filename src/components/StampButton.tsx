"use client";

import { toggleItemVisited } from "@/lib/db/mutations";
import { stampRotation } from "@/lib/stamp";
import type { Ink } from "@/lib/ink";

type Props = {
  id: string;
  name: string;
  visited: boolean;
  visitedAt: string | null;
  /** The owning list's ink — this place is stamped in its colour. */
  ink: Ink;
  /** Fired only when stamping *on*, so the row can offer a rating. */
  onStamped?: () => void;
};

/**
 * The check-off control. No optimistic layer is needed any more: the write goes
 * to IndexedDB, and useLiveQuery re-renders from it immediately, so the stamp
 * appears as fast as it ever did without a server round trip in the path.
 *
 * The mark is a clean pressed seal — no date. When every row was stamped the
 * same day, thirteen identical "JUL 22" rings read as wallpaper; the date is a
 * real fact and now lives in the row's own detail panel. The ring stays the
 * mark, the ink stays the list's, and the hand-pressed angle stays the charm.
 */
export function StampButton({
  id,
  name,
  visited,
  visitedAt,
  ink,
  onStamped,
}: Props) {
  const rotation = stampRotation(id);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !visited;
        void toggleItemVisited(id, next);
        if (next) onStamped?.();
      }}
      aria-pressed={visited}
      aria-label={
        visited ? `Remove the stamp from ${name}` : `Stamp ${name} as visited`
      }
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full transition-colors"
    >
      {visited ? (
        <span
          className="stamp-press grid h-14 w-14 place-items-center rounded-full border-2"
          // --rot feeds the keyframes so the press animation carries this
          // place's own hand-pressed angle instead of fighting it.
          style={{
            ["--rot" as string]: `${rotation}deg`,
            transform: `rotate(${rotation}deg)`,
            borderColor: `var(--ink-${ink})`,
            color: `var(--ink-${ink})`,
          }}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border [border-color:currentColor] opacity-90">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M5 12.5 10 17.5 19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      ) : (
        // An empty slot reads as an invitation to press.
        <span className="h-14 w-14 rounded-full border-2 border-dashed border-rule" />
      )}
    </button>
  );
}
