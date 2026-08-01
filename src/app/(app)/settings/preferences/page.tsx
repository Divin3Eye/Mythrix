import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { PreferencesForm } from "@/components/settings/preferences-form";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", userId)
    .single();

  const preferences = (profile?.preferences ?? {}) as {
    compactNav?: boolean;
    notificationsEnabled?: boolean;
    enableAnimations?: boolean;
    defaultView?: string;
  };

  return <PreferencesForm preferences={preferences} />;
}
