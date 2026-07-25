import Link from "next/link";
import { Logo } from "./Logo";

const STEPS = [
  {
    n: "01",
    title: "Make a list",
    body: "Ramen, dive bars, day trips — whatever you're chasing.",
  },
  {
    n: "02",
    title: "Add places",
    body: "Drop in spots as you hear about them, from anywhere.",
  },
  {
    n: "03",
    title: "Stamp them",
    body: "Press the stamp when you go, and watch the collection fill.",
  },
];

/**
 * The signed-out landing page, served at `/`. Signed-in visitors get their lists
 * at the same route (see app/page.tsx); this is what everyone else sees first,
 * instead of being dropped straight onto the login form.
 */
export function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10 px-6 py-12 sm:max-w-lg">
      <header className="flex flex-col items-center text-center">
        <Logo className="h-20 w-20 text-stamp" title="" />
        <h1 className="font-display display-wonk mt-5 text-5xl font-semibold tracking-tight">
          TrackMe
        </h1>
        <p className="mt-2 text-lg text-slate">
          A passport for the places you want to try.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="flex items-start gap-4 rounded-2xl border border-rule bg-card p-4"
          >
            <span className="font-mono text-sm font-medium tracking-widest text-stamp">
              {step.n}
            </span>
            <span className="min-w-0">
              <span className="font-display block text-xl font-semibold">
                {step.title}
              </span>
              <span className="mt-0.5 block text-slate">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3">
        <Link
          href="/login?mode=signup"
          className="rounded-lg bg-ink px-4 py-3 text-center font-medium text-ground"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-rule bg-card px-4 py-3 text-center font-medium text-ink"
        >
          I already have an account
        </Link>
      </div>

      <p className="text-center font-mono text-[11px] tracking-widest text-slate uppercase">
        Works offline · Add it to your home screen
      </p>
    </main>
  );
}
