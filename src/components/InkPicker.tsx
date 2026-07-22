"use client";

import { INKS, type Ink } from "@/lib/ink";
import { setCategoryColor } from "@/lib/db/mutations";

/**
 * The list's ink — the colour its places get stamped in. A swatch row rather
 * than a hidden setting, because it is the one piece of personalisation in the
 * app and it should be a single tap.
 */
export function InkPicker({
  categoryId,
  current,
}: {
  categoryId: string;
  current: Ink;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] tracking-widest text-slate uppercase">
        Ink
      </span>
      <div className="flex items-center justify-between">
        {INKS.map((ink) => {
          const selected = ink === current;
          return (
            <button
              key={ink}
              type="button"
              onClick={() => void setCategoryColor(categoryId, ink)}
              aria-label={`Use ${ink} ink`}
              aria-pressed={selected}
              className={`h-6 w-6 rounded-full transition-transform ${
                selected ? "scale-110 ring-2 ring-ink ring-offset-2" : ""
              }`}
              style={{
                backgroundColor: `var(--ink-${ink})`,
                // ring-offset needs to match the surface it sits on.
                ["--tw-ring-offset-color" as string]: "var(--card)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
