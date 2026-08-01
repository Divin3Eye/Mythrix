import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { notFound } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: notebook } = await supabase
    .from("notebooks")
    .select("id, title, description, color")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!notebook) notFound();

  return (
    <ChatContainer
      notebookId={id}
      notebookTitle={notebook.title}
      notebookColor={notebook.color}
    />
  );
}
