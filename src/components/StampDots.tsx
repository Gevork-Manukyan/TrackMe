"use client";

import { rankDots } from "@/lib/ink";

/**
 * A list's stamps as an odometer. The row never exceeds twelve dots, but it keeps
 * meaning more: once full, dots convert to the next rank one visit at a time.
 *
 * Only earned stamps are drawn — never empty slots for places not yet visited.
 * A list that keeps growing should never render its backlog as guilt.
 */
export function StampDots({
  stamps,
  size = "sm",
  className = "mt-2.5",
}: {
  stamps: number;
  /** "lg" is the lifetime meter on the passport hero; "sm" sits on a list card. */
  size?: "sm" | "lg";
  className?: string;
}) {
  const dots = rankDots(stamps);
  if (!dots) return null;

  const dot = size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2";
  const gap = size === "lg" ? "gap-2" : "gap-1.5";

  return (
    <div
      className={`flex flex-wrap items-center ${gap} ${className}`}
      // The adjacent "14 stamped" already conveys this to screen readers.
      aria-hidden
    >
      {Array.from({ length: dots.upgraded }, (_, i) => (
        <span
          key={`u${i}`}
          className={`${dot} rounded-full`}
          style={{ backgroundColor: `var(--rank-${dots.upgradedRank})` }}
        />
      ))}
      {Array.from({ length: dots.remaining }, (_, i) => (
        <span
          key={`r${i}`}
          className={`${dot} rounded-full`}
          style={{ backgroundColor: `var(--rank-${dots.remainingRank})` }}
        />
      ))}
    </div>
  );
}
