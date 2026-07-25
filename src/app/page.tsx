import { createClient } from "@/lib/supabase/server";
import { CategoryListView } from "@/components/CategoryListView";
import { SyncProvider } from "@/components/SyncProvider";
import { Landing } from "@/components/Landing";
import { Footer } from "@/components/Footer";

/**
 * The root is now dual-purpose: signed-out visitors see the marketing landing,
 * signed-in visitors see their lists. It's a shell either way — the lists come
 * from IndexedDB on the client, which is what lets the app work with no
 * connection. We check the session without redirecting (the proxy already lets
 * `/` through while signed out) so the landing can render.
 */
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (typeof userId !== "string") {
    return (
      <>
        <Landing />
        <Footer />
      </>
    );
  }

  return (
    <>
      <SyncProvider userId={userId} />
      <CategoryListView userId={userId} />
    </>
  );
}
