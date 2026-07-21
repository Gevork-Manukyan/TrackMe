import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createItem } from "@/lib/actions/items";
import { deleteCategory } from "@/lib/actions/categories";
import { AddForm } from "@/components/AddForm";
import { ItemRow } from "@/components/ItemRow";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const user = await requireUser();

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id, deletedAt: null },
    include: {
      items: {
        where: { deletedAt: null },
        orderBy: [{ visited: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!category) notFound();

  const addItem = createItem.bind(null, category.id);
  const removeCategory = deleteCategory.bind(null, category.id);
  const done = category.items.filter((i) => i.visited).length;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <Link
        href="/"
        className="font-mono text-xs tracking-widest text-slate uppercase"
      >
        ← All lists
      </Link>

      <header className="mt-3 mb-6 flex items-baseline justify-between gap-3">
        <h1 className="font-display truncate text-3xl font-semibold tracking-tight">
          {category.name}
        </h1>
        <span className="shrink-0 font-mono text-sm text-slate">
          {done}/{category.items.length}
        </span>
      </header>

      <div className="mb-6">
        <AddForm
          action={addItem}
          placeholder="Add a place"
          submitLabel="Add"
        />
      </div>

      {category.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-rule px-4 py-8 text-center text-slate">
          Nothing here yet. Add the first place.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {category.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <form action={removeCategory} className="mt-8 border-t border-rule pt-4">
        <button
          type="submit"
          className="text-sm text-stamp underline underline-offset-2"
        >
          Delete this list
        </button>
      </form>
    </main>
  );
}
