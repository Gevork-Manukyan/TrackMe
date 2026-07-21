"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Every action starts with requireUser() and scopes its query to that user's id,
// so one account can never touch another's data.

export async function createCategory(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.category.create({
    data: { name, userId: user.id },
  });

  revalidatePath("/");
}

export async function renameCategory(id: string, name: string) {
  const user = await requireUser();
  const trimmed = name.trim();
  if (!trimmed) return;

  // updateMany (not update) so the userId filter is part of the WHERE clause —
  // a wrong id simply matches 0 rows instead of touching someone else's row.
  await prisma.category.updateMany({
    where: { id, userId: user.id, deletedAt: null },
    data: { name: trimmed },
  });

  revalidatePath("/");
  revalidatePath(`/c/${id}`);
}

export async function deleteCategory(id: string) {
  const user = await requireUser();

  // Soft delete so the deletion can sync offline later (Phase 4).
  const now = new Date();
  await prisma.category.updateMany({
    where: { id, userId: user.id, deletedAt: null },
    data: { deletedAt: now },
  });
  // Cascade the soft delete to the category's items.
  await prisma.item.updateMany({
    where: { categoryId: id, userId: user.id, deletedAt: null },
    data: { deletedAt: now },
  });

  revalidatePath("/");
}
