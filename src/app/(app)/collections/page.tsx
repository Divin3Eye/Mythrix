import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { CollectionGrid, type CollectionItem } from "@/components/collections/collection-grid";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: collections } = await supabase
    .from("collections")
    .select(
      "id, name, description, color, notebook_count:collection_notebooks(count)"
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const items: CollectionItem[] = (collections ?? []).map((col) => ({
    id: col.id,
    name: col.name,
    description: col.description,
    color: col.color,
    notebook_count: Array.isArray(col.notebook_count)
      ? Number((col.notebook_count[0] as { count: number }).count ?? 0)
      : Number((col.notebook_count as unknown as { count: number })?.count ?? 0),
  }));

  return (
    <CollectionGrid collections={items} />
  );
}
