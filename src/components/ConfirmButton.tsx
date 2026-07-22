"use client";

import { useState } from "react";

/**
 * A destructive action that takes two taps. Inline rather than a modal: on a
 * phone a modal is heavier than the decision warrants, and it steals focus from
 * the row you were looking at.
 *
 * The question names the thing and what it costs — "Delete Desserts and its 14
 * places?" tells you something; "Are you sure?" does not.
 */
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  onConfirm,
  className = "",
  /** Render the trigger as an icon button instead of a text link. */
  icon = false,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
  icon?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    if (icon) {
      return (
        <button
          type="button"
          onClick={() => setArmed(true)}
          aria-label={label}
          title={label}
          className={`grid h-9 w-9 place-items-center rounded-lg text-slate transition-colors hover:bg-stamp/10 hover:text-stamp ${className}`}
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
            <path
              d="M4 7h16M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={`text-sm text-slate underline underline-offset-2 transition-colors hover:text-stamp ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="text-sm text-ink">{question}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          autoFocus
          onClick={() => void onConfirm()}
          className="rounded-lg bg-stamp px-2.5 py-1 text-sm font-medium text-white"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="text-sm text-slate underline underline-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
