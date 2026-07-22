"use client";

import { useState } from "react";
import { setItemRating } from "@/lib/db/mutations";
import type { Ink } from "@/lib/ink";

/**
 * Appears on a row the moment it is stamped, so a rating can be left while the
 * visit is still fresh — without opening the details panel.
 *
 * Rendered outside <details> by ItemRow: anything inside is hidden while the row
 * is collapsed, which is exactly when this needs to be visible.
 */
export function QuickRating({
  itemId,
  name,
  ink,
  onDone,
}: {
  itemId: string;
  name: string;
  ink: Ink;
  onDone: () => void;
}) {
  const [preview, setPreview] = useState(0);

  return (
    <div className="flex items-center gap-2 border-t border-rule px-4 py-2.5">
      <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
        How was it?
      </span>

      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={async () => {
              await setItemRating(itemId, n);
              onDone();
            }}
            onMouseEnter={() => setPreview(n)}
            onMouseLeave={() => setPreview(0)}
            onFocus={() => setPreview(n)}
            onBlur={() => setPreview(0)}
            aria-label={`Rate ${name} ${n} out of 5`}
            className="grid h-8 w-7 place-items-center text-lg leading-none transition-colors"
            style={{
              color: n <= preview ? `var(--ink-${ink})` : "var(--rule)",
            }}
          >
            ★
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="ml-auto text-xs text-slate underline underline-offset-2"
      >
        Skip
      </button>
    </div>
  );
}
