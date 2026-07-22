"use client";

import { useSyncExternalStore } from "react";

const HIDE_KEY = "trackme-hide-visited";
const HIDE_EVENT = "trackme:hidevisitedchange";

/**
 * Whether visited places are hidden. Stored like the theme: it is external
 * state, shared by every screen, and wanting it in one list almost certainly
 * means wanting it everywhere.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(HIDE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(HIDE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const getSnapshot = () => localStorage.getItem(HIDE_KEY) === "1";
const getServerSnapshot = () => false;

export function useHideVisited() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleHideVisited() {
  const next = !getSnapshot();
  try {
    localStorage.setItem(HIDE_KEY, next ? "1" : "0");
  } catch {
    // Private browsing can refuse storage; the toggle still works this visit.
  }
  window.dispatchEvent(new Event(HIDE_EVENT));
}

/**
 * Search, plus the hide-visited toggle when there is anything to hide.
 *
 * The caller decides whether to render this at all — below a handful of items a
 * search box is noise, so a new user never meets one.
 */
export function SearchField({
  value,
  onChange,
  placeholder,
  hiddenCount,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** How many places the toggle is currently hiding, or null to omit it. */
  hiddenCount?: number | null;
}) {
  const hideVisited = useHideVisited();

  return (
    <div className="flex items-center gap-2">
      {/* The ring goes on the bar, not the input — see .field-wrap in globals.css. */}
      <div className="field-wrap flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-rule bg-card px-3">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-slate"
          aria-hidden
        >
          <circle
            cx="11"
            cy="11"
            r="6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="16"
            x2="21"
            y2="21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="ring-on-wrapper min-w-0 flex-1 bg-transparent py-2.5 text-ink placeholder:text-slate/70"
        />
      </div>

      {hiddenCount !== null && hiddenCount !== undefined && (
        <button
          type="button"
          onClick={toggleHideVisited}
          aria-pressed={hideVisited}
          className="shrink-0 rounded-xl border border-rule bg-card px-3 py-2.5 font-mono text-[11px] tracking-widest text-slate uppercase transition-colors hover:text-ink"
        >
          {hideVisited ? `${hiddenCount} hidden` : "Hide visited"}
        </button>
      )}
    </div>
  );
}
