/**
 * Two colour systems that answer different questions.
 *
 *   INK  — which list is this? Each list owns a hue; its places are stamped in it.
 *   RANK — how deep have you gone? A universal ladder, identical in every list,
 *          so rank is comparable at a glance.
 *
 * They are deliberately separate. Ink identifies, rank measures.
 */

export const INKS = [
  "raspberry",
  "vermilion",
  "amber",
  "olive",
  "teal",
  "indigo",
  "plum",
  "rose",
] as const;

export type Ink = (typeof INKS)[number];

export function isInk(value: string | null | undefined): value is Ink {
  return !!value && (INKS as readonly string[]).includes(value);
}

/**
 * Falls back to a hue derived from the list id, so lists created before colours
 * existed still look deliberate rather than grey. Stable for a given id.
 */
export function inkFor(id: string, color: string | null | undefined): Ink {
  if (isInk(color)) return color;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return INKS[Math.abs(hash) % INKS.length];
}

/** CSS custom property holding this ink's current-theme value. */
export const inkVar = (ink: Ink) => `var(--ink-${ink})`;

// --- Rank ------------------------------------------------------------------

/** The row never grows past this; beyond it, dots convert to the next rank. */
export const DOTS_PER_RANK = 12;

/** Ranks stop climbing here rather than inventing tiers nobody reaches. */
export const MAX_RANK = 5;

export const RANK_NAMES = [
  "copper",
  "silver",
  "gold",
  "emerald",
  "violet",
] as const;

export type RankName = (typeof RANK_NAMES)[number];

export type RankDots = {
  /** Dots already converted to the higher rank, drawn first. */
  upgraded: number;
  upgradedRank: RankName;
  /** Dots still at the lower rank. */
  remaining: number;
  remainingRank: RankName;
  /** Highest rank currently on screen — used for the label. */
  topRank: RankName;
};

const clampRank = (n: number): RankName =>
  RANK_NAMES[Math.min(Math.max(n, 1), MAX_RANK) - 1];

/**
 * An odometer. With n stamps:
 *   base     = floor((n - 1) / 12)   completed conversions
 *   upgraded = n - 12 * base         dots sitting at the higher rank
 *
 * So 12 fills the row, 13 converts the first dot, 24 completes the conversion,
 * and 25 begins the next rank. Below 12 the row simply grows, with no empty
 * slots — a backlog should never be rendered as guilt.
 */
export function rankDots(stamps: number): RankDots | null {
  if (stamps <= 0) return null;

  const base = Math.floor((stamps - 1) / DOTS_PER_RANK);
  const upgraded = stamps - DOTS_PER_RANK * base;

  // First row: just the dots earned so far, all at rank 1.
  if (base === 0) {
    return {
      upgraded,
      upgradedRank: "copper",
      remaining: 0,
      remainingRank: "copper",
      topRank: "copper",
    };
  }

  const lower = clampRank(base);
  const higher = clampRank(base + 1);

  return {
    upgraded,
    upgradedRank: higher,
    remaining: DOTS_PER_RANK - upgraded,
    remainingRank: lower,
    // Once the ladder is capped, the "higher" rank stops being new.
    topRank: higher,
  };
}
