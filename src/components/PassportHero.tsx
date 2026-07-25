"use client";

import { rankDots } from "@/lib/ink";
import { StampDots } from "./StampDots";

/**
 * The home screen opens with the whole collection, not one list. A lifetime
 * count of places stamped — the one number that only ever grows and is never a
 * backlog, so it carries the "look what I've collected" feeling the app is
 * built around without ever framing a living list as unfinished.
 *
 * The rank meter beneath turns that count into a tier you climb.
 */
export function PassportHero({ totalStamped }: { totalStamped: number }) {
  const tier = rankDots(totalStamped)?.topRank ?? null;

  if (totalStamped === 0) {
    return (
      <section className="rounded-2xl border border-rule px-5 py-6">
        <p className="font-mono text-[11px] tracking-widest text-slate uppercase">
          Your collection
        </p>
        <p className="font-display display-wonk mt-2 text-2xl leading-tight font-semibold">
          Nothing stamped yet.
        </p>
        <p className="mt-1.5 text-slate">
          Add a place, then press its stamp the day you go.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-rule px-5 py-6">
      <p className="font-mono text-[11px] tracking-widest text-slate uppercase">
        Your collection
      </p>

      <p className="mt-1 flex items-baseline gap-3">
        <span className="font-display display-wonk text-[3.5rem] leading-none font-semibold tracking-tight">
          {totalStamped}
        </span>
        <span className="text-lg text-slate">
          {totalStamped === 1 ? "place stamped" : "places stamped"}
        </span>
      </p>

      <div className="mt-4 flex items-center gap-3">
        <StampDots stamps={totalStamped} size="lg" className="" />
        {tier && (
          <span
            className="font-mono text-[11px] tracking-widest uppercase"
            style={{ color: `var(--rank-${tier})` }}
          >
            {tier}
          </span>
        )}
      </div>
    </section>
  );
}
