"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleItemVisited } from "@/lib/actions/items";
import { stampDate, stampRotation } from "@/lib/stamp";

type Props = {
  id: string;
  name: string;
  visited: boolean;
  /** Pre-formatted on the server so SSR and client agree. */
  stamp: { month: string; day: string } | null;
};

export function StampButton({ id, name, visited, stamp }: Props) {
  const [optimisticVisited, setOptimisticVisited] = useOptimistic(visited);
  const [, startTransition] = useTransition();
  // Only set once the user presses, so it never runs during SSR.
  const [pressedStamp, setPressedStamp] = useState<{
    month: string;
    day: string;
  } | null>(null);

  const rotation = stampRotation(id);
  const shown = stamp ?? pressedStamp;

  function handleClick() {
    const next = !optimisticVisited;
    if (next) setPressedStamp(stampDate(new Date()));
    startTransition(async () => {
      setOptimisticVisited(next);
      await toggleItemVisited(id, next);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={optimisticVisited}
      aria-label={
        optimisticVisited
          ? `Remove the stamp from ${name}`
          : `Stamp ${name} as visited`
      }
      className="shrink-0 grid h-14 w-14 place-items-center rounded-full transition-colors"
    >
      {optimisticVisited ? (
        <span
          key="stamped"
          className="stamp-press grid h-14 w-14 place-items-center rounded-full border-2 border-stamp text-stamp"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-stamp/60 leading-none">
            <span className="font-mono text-[9px] tracking-[0.14em]">
              {shown?.month ?? "VISIT"}
            </span>
            <span className="font-mono text-sm font-semibold">
              {shown?.day ?? "✓"}
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
