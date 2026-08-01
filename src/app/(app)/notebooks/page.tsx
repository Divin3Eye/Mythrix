import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { NotebookGrid, type NotebookItem } from "@/components/notebooks/notebook-grid";

export const dynamic = "force-dynamic";

export default async function NotebooksPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: notebooks } = await supabase
    .from("notebooks")
    .select("id, title, description, color, icon, is_favorite, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const items: NotebookItem[] = (notebooks ?? []).map((nb) => ({
    id: nb.id,
    title: nb.title,
    description: nb.description,
    color: nb.color,
    icon: nb.icon,
    is_favorite: nb.is_favorite,
    created_at: nb.created_at,
  }));

  return (
    <NotebookGrid notebooks={items} />
  );
}
