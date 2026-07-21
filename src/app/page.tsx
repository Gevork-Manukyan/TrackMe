import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategory } from "@/lib/actions/categories";
import { AddForm } from "@/components/AddForm";

export default async function Home() {
  const user = await requireUser();

  // All reads live at the page boundary — Phase 4 swaps this for Dexie.
  const categories = await prisma.category.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        where: { deletedAt: null },
        select: { visited: true },
      },
    },
  });

  const totalStamped = categories.reduce(
    (n, c) => n + c.items.filter((i) => i.visited).length,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-6 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          TrackMe
        </h1>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs tracking-widest text-slate uppercase">
            {totalStamped} stamped
          </span>
          <form action="/auth/signout" method="post">
            <button className="font-mono text-xs tracking-widest text-slate uppercase underline underline-offset-2">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mb-6">
        <AddForm
          action={createCategory}
          placeholder="Name a new list"
          submitLabel="Add list"
        />
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          No lists yet. Start one — desserts, ramen, dive bars, whatever
          you&rsquo;re chasing.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((c) => {
            const total = c.items.length;
            const done = c.items.filter((i) => i.visited).length;
            const pct = total === 0 ? 0 : (done / total) * 100;

            return (
              <li key={c.id}>
                <Link
                  href={`/c/${c.id}`}
                  className="block rounded-xl border border-rule bg-card p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display truncate text-xl font-semibold">
                      {c.name}
                    </h2>
                    <span className="shrink-0 font-mono text-sm text-slate">
                      {done}/{total}
                    </span>
                  </div>
                  <div
                    className="mt-3 h-1 w-full overflow-hidden rounded-full bg-rule"
                    aria-hidden
                  >
                    <div
                      className="h-full bg-stamp"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
