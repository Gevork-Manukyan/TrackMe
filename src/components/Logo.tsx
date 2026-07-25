type Props = {
  className?: string;
  /** Accessible name; pass an empty string when the logo is purely decorative
      and sits next to a visible "TrackMe" wordmark. */
  title?: string;
};

/**
 * The TrackMe mark: a wonky serif "T" pressed inside a passport stamp, rotated a
 * touch as if hand-stamped. Uses `currentColor`, so tint it with a text color
 * (e.g. `text-stamp` for vermilion). Kept in sync with the static favicon at
 * src/app/icon.svg.
 */
export function Logo({ className, title = "TrackMe" }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <g transform="rotate(-7 32 32)">
        <circle
          cx="32"
          cy="32"
          r="27"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeDasharray="1.6 4.2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <g fill="currentColor">
          <rect x="20" y="21" width="24" height="5.6" rx="2.8" />
          <rect x="29.2" y="21" width="5.6" height="23" rx="2.6" />
          <rect x="25.5" y="40.5" width="13" height="4.6" rx="2.3" />
        </g>
      </g>
    </svg>
  );
}
