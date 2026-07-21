"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function createItem(categoryId: string, formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  // Confirm the category belongs to this user before attaching an item to it.
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id, deletedAt: null },
    select: { id: true },
  });
  if (!category) return;

  await prisma.item.create({
    data: { name, categoryId, userId: user.id },
  });

  revalidatePath(`/c/${categoryId}`);
  revalidatePath("/");
}

export async function toggleItemVisited(id: string, visited: boolean) {
  const user = await requireUser();

  const item = await prisma.item.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    select: { categoryId: true },
  });
  if (!item) return;

  await prisma.item.updateMany({
    where: { id, userId: user.id, deletedAt: null },
    data: { visited, visitedAt: visited ? new Date() : null },
  });

  revalidatePath(`/c/${item.categoryId}`);
  revalidatePath("/");
}

/** Updates the optional data points on an item (notes, address, rating, url). */
export async function updateItemDetails(id: string, formData: FormData) {
  const user = await requireUser();

  const item = await prisma.item.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    select: { categoryId: true },
  });
  if (!item) return;

  const str = (key: string) => {
    const v = String(formData.get(key) ?? "").trim();
    return v === "" ? null : v;
  };

  const ratingRaw = str("rating");
  const rating = ratingRaw === null ? null : Number(ratingRaw);

  await prisma.item.updateMany({
    where: { id, userId: user.id, deletedAt: null },
    data: {
      name: String(formData.get("name") ?? "").trim() || undefined,
      notes: str("notes"),
      address: str("address"),
      url: str("url"),
      rating:
        rating !== null && Number.isFinite(rating) && rating >= 1 && rating <= 5
          ? rating
          : null,
    },
  });

  revalidatePath(`/c/${item.categoryId}`);
}

export async function deleteItem(id: string) {
  const user = await requireUser();

  const item = await prisma.item.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    select: { categoryId: true },
  });
  if (!item) return;

  await prisma.item.updateMany({
    where: { id, userId: user.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/c/${item.categoryId}`);
  revalidatePath("/");
}
