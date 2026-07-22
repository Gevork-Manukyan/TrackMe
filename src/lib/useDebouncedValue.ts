"use client";

import { useEffect, useState } from "react";

/**
 * Delays a fast-changing value so downstream work doesn't run per keystroke.
 * Used for search, so typing "levain" runs one Dexie query rather than six.
 */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
