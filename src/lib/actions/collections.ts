"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";

export async function createCollection(formData: FormData) {
  const userId = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const color = String(formData.get("color") || "").trim() || null;

  if (!name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .insert({ user_id: userId, name, description, color });

  if (error) throw new Error(error.message);
  revalidatePath("/collections");
}

export async function updateCollection(formData: FormData) {
  const userId = await requireUser();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const color = String(formData.get("color") || "").trim() || null;

  if (!id || !name) throw new Error("Missing required fields");

  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .update({ name, description, color })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/collections");
}

export async function softDeleteCollection(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/collections");
  revalidatePath("/trash");
}

export async function restoreCollection(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/trash");
  revalidatePath("/collections");
}

export async function permanentlyDeleteCollection(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: col, error: selErr } = await supabase
    .from("collections")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (selErr) throw new Error(selErr.message);
  if (!col) throw new Error("Collection not found");

  const { error: delErr } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (delErr) throw new Error(delErr.message);

  revalidatePath("/trash");
  revalidatePath("/collections");
}

export async function addNotebookToCollection(collectionId: string, notebookId: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: col, error: colErr } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", userId)
    .single();
  if (colErr || !col) throw new Error("Collection not found");

  const { data: nb, error: nbErr } = await supabase
    .from("notebooks")
    .select("id")
    .eq("id", notebookId)
    .eq("user_id", userId)
    .single();
  if (nbErr || !nb) throw new Error("Notebook not found");

  const { error } = await supabase
    .from("collection_notebooks")
    .insert({ collection_id: collectionId, notebook_id: notebookId });
  if (error && error.code !== "23505") throw new Error(error.message);

  revalidatePath("/collections");
}

export async function removeNotebookFromCollection(collectionId: string, notebookId: string) {
  const userId = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("collection_notebooks")
    .delete()
    .eq("collection_id", collectionId)
    .eq("notebook_id", notebookId);

  if (error) throw new Error(error.message);
  revalidatePath("/collections");
}
