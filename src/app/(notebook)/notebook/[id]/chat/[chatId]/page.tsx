import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { notFound } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";

export const dynamic = "force-dynamic";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ id: string; chatId: string }>;
}) {
  const { id, chatId } = await params;
  const userId = await requireUser();
  const supabase = await createClient();

  // Verify notebook exists
  const { data: notebook } = await supabase
    .from("notebooks")
    .select("id, title, description, color")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!notebook) notFound();

  // Verify chat session exists and belongs to user
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", chatId)
    .eq("user_id", userId)
    .single();

  if (!session) notFound();

  return (
    <ChatContainer
      notebookId={id}
      notebookTitle={notebook.title}
      notebookColor={notebook.color}
      initialSessionId={chatId}
    />
  );
}
