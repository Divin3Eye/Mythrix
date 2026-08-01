import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { notFound } from "next/navigation";
import { SourcesPageContent } from "@/components/sources/sources-page-content";

export const dynamic = "force-dynamic";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: notebook } = await supabase
    .from("notebooks")
    .select("id, title, description, color, is_favorite, deleted_at, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!notebook) notFound();

  const { data: sources } = await supabase
    .from("source_files")
    .select("id, name, url, size_bytes, created_at")
    .eq("notebook_id", id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <SourcesPageContent
      notebookId={id}
      notebookTitle={notebook.title}
      notebookDescription={notebook.description}
      notebookColor={notebook.color}
      sources={sources ?? []}
    />
  );
}
