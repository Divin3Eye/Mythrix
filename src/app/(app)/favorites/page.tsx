import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { NotebookGrid, type NotebookItem } from "@/components/notebooks/notebook-grid";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: notebooks } = await supabase
    .from("notebooks")
    .select("id, title, description, color, icon, is_favorite, created_at")
    .eq("user_id", userId)
    .eq("is_favorite", true)
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
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Favorites</h1>
          <p className="text-sm text-white/70 mt-1">
            {items.length} favorite{items.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <NotebookGrid
        notebooks={items}
        showHeader={false}
        showCreateButton={false}
        emptyTitle="No favorites yet"
        emptyDescription="Star a notebook from the Notebooks page to pin it here for quick access."
      />
    </>
  );
}
