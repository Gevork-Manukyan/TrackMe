"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A small popover hung off an icon button in the header. Settings and
 * destructive actions live here rather than stranded at the bottom of the page,
 * where they competed with the content for no reason.
 *
 * Closes on Escape and on a click outside, and returns focus to the trigger so
 * keyboard users are not dropped at the top of the document.
 */
export function Menu({
  label,
  children,
}: {
  label: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        className="grid h-8 w-8 place-items-center rounded-full text-slate transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
          <circle cx="5" cy="12" r="1.9" fill="currentColor" />
          <circle cx="12" cy="12" r="1.9" fill="currentColor" />
          <circle cx="19" cy="12" r="1.9" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute top-10 right-0 z-20 w-72 rounded-2xl border border-rule bg-card p-3 shadow-lg shadow-black/10"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
