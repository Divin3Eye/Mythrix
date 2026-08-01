"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";

export async function createNotebook(input: {
  title: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sources?: Array<{ name: string; type: "file" | "url"; size?: number; url?: string; content?: string }>;
}) {
  const userId = await requireUser();
  const title = input.title?.trim();
  const description = input.description?.trim() || null;
  const color = input.color?.trim() || null;
  const icon = input.icon?.trim() || null;
  const sources = input.sources ?? [];

  if (!title) throw new Error("Title is required");

  const supabase = await createClient();

  // Build insert payload — only include optional fields with non-null values
  const payload: Record<string, unknown> = {
    user_id: userId,
    title,
    description,
  };
  if (color) payload.color = color;
  if (icon) payload.icon = icon;

  const { data, error } = await supabase
    .from("notebooks")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Insert source files — upload to Storage and save URL
  if (sources.length > 0) {
    const fileSources = sources
      .filter((s) => s.type === "file")
      .map(async (s) => {
        let storageUrl: string | null = null;

        // If content is provided, upload it to Storage
        if (s.content) {
          const filePath = `${userId}/${data.id}/${crypto.randomUUID()}-${s.name}`;
          const { error: uploadErr } = await supabase.storage
            .from("source-files")
            .upload(filePath, s.content, {
              contentType: "text/plain",
              upsert: false,
            });

          if (!uploadErr) {
            const { data: urlData } = supabase.storage
              .from("source-files")
              .getPublicUrl(filePath);
            storageUrl = urlData.publicUrl;
          }
        }

        return {
          user_id: userId,
          notebook_id: data.id,
          name: s.name,
          size_bytes: s.size ?? 0,
          url: storageUrl,
        };
      });

    const resolvedSources = await Promise.all(fileSources);
    const { error: srcErr } = await supabase.from("source_files").insert(resolvedSources);
    if (srcErr) console.error("source_files insert failed:", srcErr.message);
  }

  revalidatePath("/notebooks");
  revalidatePath("/dashboard");
  revalidatePath("/storage");
  return { id: data.id };
}

export async function updateNotebook(formData: FormData) {
  const userId = await requireUser();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const color = String(formData.get("color") || "").trim() || null;
  const icon = String(formData.get("icon") || "").trim() || null;

  if (!id || !title) throw new Error("Missing required fields");

  const supabase = await createClient();
  const { error } = await supabase
    .from("notebooks")
    .update({ title, description, color, icon })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/notebooks");
  revalidatePath(`/notebook/${id}`);
}

export async function toggleFavorite(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data, error: selErr } = await supabase
    .from("notebooks")
    .select("is_favorite")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (selErr || !data) throw new Error("Notebook not found");

  const { error } = await supabase
    .from("notebooks")
    .update({ is_favorite: !data.is_favorite })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/notebooks");
  revalidatePath("/dashboard");
  revalidatePath("/favorites");
}

export async function softDeleteNotebook(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notebooks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/notebooks");
  revalidatePath("/dashboard");
  revalidatePath("/trash");
}

export async function restoreNotebook(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notebooks")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/notebooks");
  revalidatePath("/dashboard");
  revalidatePath("/trash");
}

export async function permanentlyDeleteNotebook(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notebooks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/notebooks");
  revalidatePath("/dashboard");
  revalidatePath("/trash");
}
