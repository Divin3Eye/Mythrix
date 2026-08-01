import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { TrashList, type TrashItem } from "@/components/trash/trash-list";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: notebooks } = await supabase
    .from("notebooks")
    .select("id, title, color, deleted_at")
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, color, deleted_at")
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const items: TrashItem[] = [
    ...(notebooks ?? []).map((nb) => ({
      kind: "notebook" as const,
      id: nb.id,
      title: nb.title,
      color: nb.color,
      deleted_at: nb.deleted_at,
    })),
    ...(collections ?? []).map((col) => ({
      kind: "collection" as const,
      id: col.id,
      name: col.name,
      title: col.name,
      color: col.color,
      deleted_at: col.deleted_at,
    })),
  ].sort((a, b) => b.deleted_at.localeCompare(a.deleted_at));

  return (
    <TrashList items={items} />
  );
}
