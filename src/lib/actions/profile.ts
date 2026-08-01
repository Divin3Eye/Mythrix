"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";

export async function updateProfile(formData: FormData) {
  const userId = await requireUser();
  const username = String(formData.get("username") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim() || null;

  if (!username) throw new Error("Username is required");
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    throw new Error("Username must be 3-24 characters (letters, numbers, underscores)");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ username, full_name: fullName })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function updatePreferences(formData: FormData) {
  const userId = await requireUser();
  const compactNav = formData.get("compactNav") === "on";
  const notificationsEnabled = formData.get("notificationsEnabled") === "on";
  const enableAnimations = formData.get("enableAnimations") === "on";
  const defaultView = String(formData.get("defaultView") || "grid");

  const supabase = await createClient();
  const { data: profile, error: selErr } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", userId)
    .single();
  if (selErr) throw new Error(selErr.message);

  const preferences = {
    ...(profile?.preferences ?? {}),
    compactNav,
    notificationsEnabled,
    enableAnimations,
    defaultView,
  };

  const { error } = await supabase
    .from("profiles")
    .update({ preferences })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function changePassword(formData: FormData) {
  const userId = await requireUser();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters");
  if (newPassword !== confirmPassword) throw new Error("Passwords do not match");

  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user?.email) throw new Error("Unable to verify account");

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInErr) throw new Error("Current password is incorrect");

  const { error: updateErr } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/settings");
}

export async function deleteAccount(formData: FormData) {
  const userId = await requireUser();
  const confirm = String(formData.get("confirm") || "").trim();

  if (confirm !== "DELETE") {
    throw new Error("Type DELETE to confirm account deletion");
  }

  const supabase = await createClient();

  const { error: deleteErr } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (deleteErr) throw new Error(deleteErr.message);

  await supabase.auth.signOut();
  redirect("/login");
}
