"use client";

import { toggleItemVisited } from "@/lib/db/mutations";
import { stampDate, stampRotation } from "@/lib/stamp";
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
  const stamp = visitedAt ? stampDate(new Date(visitedAt)) : null;

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
          <span className="grid h-11 w-11 place-items-center rounded-full border leading-none [border-color:currentColor] opacity-80">
            <span className="font-mono text-[9px] tracking-[0.14em]">
              {stamp?.month ?? "VISIT"}
            </span>
            <span className="font-mono text-sm font-semibold">
              {stamp?.day ?? "✓"}
            </span>
          </span>
        </span>
      ) : (
        // An empty slot reads as an invitation to press.
        <span className="h-14 w-14 rounded-full border-2 border-dashed border-rule" />
      )}
    </button>
  );
}
