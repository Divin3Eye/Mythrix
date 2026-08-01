import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { AccountForm, type ProfileData } from "@/components/settings/account-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, plan, created_at")
    .eq("id", userId)
    .single();

  const data: ProfileData = {
    id: userId,
    email: user?.email ?? null,
    username: profile?.username ?? null,
    full_name: profile?.full_name ?? null,
    plan: profile?.plan ?? "free",
    created_at: profile?.created_at ?? "",
  };

  return <AccountForm profile={data} />;
}
