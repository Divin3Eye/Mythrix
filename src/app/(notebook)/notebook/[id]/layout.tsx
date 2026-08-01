import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { NotebookChrome } from "@/components/notebook/notebook-chrome";

export const dynamic = "force-dynamic";

export default async function NotebookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: notebook } = await supabase
    .from("notebooks")
    .select("id, title")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!notebook) redirect("/notebooks");

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", userId)
    .single();

  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <NotebookChrome
      notebookId={id}
      userName={displayName}
      userInitials={initials}
      userEmail={user?.email ?? ""}
    >
      {children}
    </NotebookChrome>
  );
}
