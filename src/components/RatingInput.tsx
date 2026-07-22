"use client";

import { useState } from "react";

/**
 * Tappable star rating. Feeds the surrounding form through a hidden input, so
 * the existing server action keeps receiving a plain "rating" field.
 *
 * Tapping the current rating again clears it — otherwise a rating set by
 * accident could never be removed.
 */
export function RatingInput({ defaultValue }: { defaultValue: number | null }) {
  const [value, setValue] = useState(defaultValue ?? 0);
  const [preview, setPreview] = useState(0);

  const shown = preview || value;

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name="rating" value={value || ""} />

      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setValue(value === n ? 0 : n)}
          onMouseEnter={() => setPreview(n)}
          onMouseLeave={() => setPreview(0)}
          onFocus={() => setPreview(n)}
          onBlur={() => setPreview(0)}
          aria-label={
            value === n ? `Clear rating` : `Rate ${n} out of 5`
          }
          aria-pressed={n <= value}
          className={`grid h-9 w-8 place-items-center text-xl leading-none transition-colors ${
            n <= shown ? "text-ink" : "text-rule hover:text-slate"
          }`}
        >
          ★
        </button>
      ))}

      {value > 0 && (
        <span className="ml-1 font-mono text-xs text-slate">{value}/5</span>
      )}
    </div>
  );
}
