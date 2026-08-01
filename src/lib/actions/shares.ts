"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";

export async function createShare(formData: FormData) {
  const userId = await requireUser();
  const notebookId = String(formData.get("notebookId") || "");
  const expiresRaw = String(formData.get("expiresIn") || "never");

  if (!notebookId) throw new Error("Missing notebook");

  const supabase = await createClient();

  const { data: nb, error: selErr } = await supabase
    .from("notebooks")
    .select("id")
    .eq("id", notebookId)
    .eq("user_id", userId)
    .single();
  if (selErr || !nb) throw new Error("Notebook not found");

  let expiresAt: string | null = null;
  if (expiresRaw !== "never") {
    const days = parseInt(expiresRaw, 10);
    if (Number.isFinite(days) && days > 0) {
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  const token = randomBytes(24).toString("base64url");

  const { error } = await supabase
    .from("shares")
    .insert({ user_id: userId, notebook_id: notebookId, token, expires_at: expiresAt });

  if (error) throw new Error(error.message);
  revalidatePath("/shared");
}

export async function revokeShare(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("shares")
    .update({ revoked: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/shared");
}
