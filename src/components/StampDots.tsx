/**
 * A list's progress drawn in the app's own vocabulary: one small stamp per
 * place, filled once it's been visited. Vermilion means "stamped" everywhere in
 * this interface, so it's the right colour here — these are miniature stamps,
 * not a generic accent.
 *
 * Dots stop being readable past a dozen or so, at which point the mono fraction
 * beside them already tells the story, so we render nothing.
 */
const MAX_DOTS = 12;

export function StampDots({ total, done }: { total: number; done: number }) {
  if (total === 0 || total > MAX_DOTS) return null;

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-1.5"
      aria-hidden // the adjacent "3/8" already conveys this to screen readers
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            i < done
              ? "h-2 w-2 rounded-full bg-stamp"
              : "h-2 w-2 rounded-full border border-rule"
          }
        />
      ))}
    </div>
  );
}
