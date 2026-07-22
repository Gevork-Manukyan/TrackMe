import { requireUser } from "@/lib/auth";
import { CategoryDetailView } from "@/components/CategoryDetailView";
import { SyncProvider } from "@/components/SyncProvider";

/**
 * A shell, not a data source — see src/app/page.tsx. The category is resolved
 * against IndexedDB on the client, so a deep link works offline too.
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const user = await requireUser();

  return (
    <>
      <SyncProvider userId={user.id} />
      <CategoryDetailView userId={user.id} categoryId={categoryId} />
    </>
  );
}
