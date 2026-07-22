"use client";

import Link from "next/link";
import { stampDate, stampRotation } from "@/lib/stamp";
import { type Ink } from "@/lib/ink";

export type RecentStamp = {
  id: string;
  name: string;
  visitedAt: string;
  categoryId: string;
  categoryName: string;
  ink: Ink;
};

/**
 * The home screen opens with what you've actually collected — the last few
 * places stamped, each in its list's ink. It is personal, it changes constantly,
 * and it puts the point of the app on the first screen instead of one level
 * down. A total count would say the same thing far less vividly.
 */
export function RecentStamps({ stamps }: { stamps: RecentStamp[] }) {
  if (stamps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rule px-4 py-6 text-center">
        <div
          className="mx-auto mb-3 h-12 w-12 rounded-full border-2 border-dashed border-rule"
          aria-hidden
        />
        <p className="text-slate">
          Your stamps show up here. Add a place, then press it when you go.
        </p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="mb-2.5 font-mono text-[11px] tracking-widest text-slate uppercase">
        Recently stamped
      </h2>
      <ul className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {stamps.map((stamp) => {
          const date = stampDate(new Date(stamp.visitedAt));
          return (
            <li key={stamp.id} className="shrink-0">
              <Link
                href={`/c/${stamp.categoryId}`}
                className="flex w-24 flex-col items-center gap-1.5"
              >
                <span
                  className="grid h-16 w-16 place-items-center rounded-full border-2"
                  style={{
                    borderColor: `var(--ink-${stamp.ink})`,
                    color: `var(--ink-${stamp.ink})`,
                    transform: `rotate(${stampRotation(stamp.id)}deg)`,
                  }}
                >
                  <span className="grid h-[52px] w-[52px] place-items-center rounded-full border leading-none [border-color:currentColor] opacity-90">
                    <span className="font-mono text-[9px] tracking-[0.14em]">
                      {date.month}
                    </span>
                    <span className="font-mono text-base font-semibold">
                      {date.day}
                    </span>
                  </span>
                </span>
                <span className="line-clamp-2 text-center text-xs leading-tight text-slate">
                  {stamp.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
