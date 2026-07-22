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
}: {
  label: string;
  question: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
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
