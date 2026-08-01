import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { ShareList, type ShareItem } from "@/components/shares/share-list";

export const dynamic = "force-dynamic";

export default async function SharedPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: shares } = await supabase
    .from("shares")
    .select("id, token, notebook_id, expires_at, revoked, created_at, notebook:notebooks(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: notebooks } = await supabase
    .from("notebooks")
    .select("id, title")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("title", { ascending: true });

  const items: ShareItem[] = (shares ?? []).map((share) => {
    const notebook = Array.isArray(share.notebook)
      ? (share.notebook[0] as { title: string } | undefined)
      : (share.notebook as { title: string } | null | undefined);
    return {
      id: share.id,
      token: share.token,
      notebook_id: share.notebook_id,
      notebook_title: notebook?.title ?? "Unknown notebook",
      expires_at: share.expires_at,
      revoked: share.revoked,
      created_at: share.created_at,
    };
  });

  const notebookOptions = (notebooks ?? []).map((nb) => ({
    id: nb.id,
    title: nb.title,
  }));

  return (
    <ShareList shares={items} notebooks={notebookOptions} />
  );
}
