"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string | null;
  kind: "notebook" | "collection";
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  const userId = await requireUser();
  const q = query.trim();
  if (!q) return [];

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const [notebooksRes, collectionsRes] = await Promise.all([
    supabase
      .from("notebooks")
      .select("id, title, description")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("collections")
      .select("id, name, description")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const results: SearchResultItem[] = [];

  for (const nb of notebooksRes.data ?? []) {
    results.push({
      id: nb.id,
      title: nb.title,
      subtitle: nb.description ?? "Notebook",
      kind: "notebook",
      href: "/notebooks",
    });
  }

  for (const col of collectionsRes.data ?? []) {
    results.push({
      id: col.id,
      title: col.name,
      subtitle: col.description ?? "Collection",
      kind: "collection",
      href: "/collections",
    });
  }

  return results;
}
