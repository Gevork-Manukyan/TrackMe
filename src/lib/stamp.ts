/**
 * A stamp is pressed by hand, so it sits slightly crooked. The angle is derived
 * from the item id rather than randomised, so it stays identical between the
 * server render and the client render (no hydration mismatch) and doesn't jump
 * around on every refresh.
 */
export function stampRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  // Map the hash onto roughly -7°..+7°, skipping dead-straight.
  const spread = 15;
  return (Math.abs(hash) % spread) - Math.floor(spread / 2);
}

/** Splits a date into the two lines shown inside a stamp: "MAR" over "12". */
export function stampDate(date: Date): { month: string; day: string } {
  return {
    month: date
      .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
      .toUpperCase(),
    day: String(date.getUTCDate()),
  };
}
