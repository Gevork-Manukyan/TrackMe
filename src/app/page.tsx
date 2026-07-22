import { requireUser } from "@/lib/auth";
import { CategoryListView } from "@/components/CategoryListView";
import { SyncProvider } from "@/components/SyncProvider";

/**
 * A shell, not a data source. requireUser() still runs so an unauthenticated
 * request never renders, but the lists themselves come from IndexedDB on the
 * client — that is what lets the page work with no connection.
 */
export default async function Home() {
  const user = await requireUser();

  return (
    <>
      <SyncProvider userId={user.id} />
      <CategoryListView userId={user.id} />
    </>
  );
}
