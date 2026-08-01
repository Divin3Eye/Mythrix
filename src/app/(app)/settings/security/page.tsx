import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { SecurityForm } from "@/components/settings/security-form";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  await requireUser();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SecurityForm email={user?.email ?? null} />;
}
