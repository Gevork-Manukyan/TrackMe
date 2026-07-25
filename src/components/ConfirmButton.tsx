"use client";

import { useState } from "react";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path
        d="M4 7h16M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  /** Render the trigger as a compact icon button instead of a full menu row. */
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
          <TrashIcon />
        </button>
      );
    }

    // A proper menu row: icon, label, and a hover fill — not an underlined link.
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate transition-colors hover:bg-stamp/10 hover:text-stamp ${className}`}
      >
        <TrashIcon />
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-1 py-0.5">
      <span className="text-sm text-ink">{question}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          autoFocus
          onClick={() => void onConfirm()}
          className="rounded-lg bg-stamp px-3 py-1.5 text-sm font-medium text-white transition-[filter] hover:brightness-110"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="rounded-lg px-3 py-1.5 text-sm text-slate transition-colors hover:bg-ink/5 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
