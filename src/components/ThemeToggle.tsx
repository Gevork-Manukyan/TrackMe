"use client";

import { useSyncExternalStore } from "react";

export const THEME_KEY = "trackme-theme";
const THEME_EVENT = "trackme:themechange";

type Theme = "light" | "dark";

/**
 * The resolved theme is external state — it lives on the document element and
 * in localStorage, and it can also change underneath us when the system switches
 * appearance. useSyncExternalStore is the right tool: it subscribes to both
 * sources and hydrates without a mismatch.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

function getSnapshot(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// The server cannot know which theme the browser will resolve to, so it renders
// an empty box of the right size and the icon appears once hydrated. Committing
// to an icon here would either mismatch or shift the layout.
const getServerSnapshot = (): Theme | null => null;

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private browsing can refuse storage; the theme still applies for this visit.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const label =
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      // Says what pressing it does, not what the theme currently is.
      aria-label={label}
      title={label}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate transition-colors hover:text-ink"
    >
      {theme === null ? null : theme === "dark" ? (
        // Currently dark → offer the sun.
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="12"
              y1="1.5"
              x2="12"
              y2="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
        </svg>
      ) : (
        // Currently light → offer the moon.
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
          <path
            d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
