"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./auth";

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function getChatSessions(notebookId: string): Promise<ChatSession[]> {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at")
    .eq("notebook_id", notebookId)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Get message counts for each session
  const sessionsWithCounts = await Promise.all(
    (sessions || []).map(async (session) => {
      const { count } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id);

      return {
        ...session,
        messageCount: count || 0,
      };
    })
  );

  return sessionsWithCounts;
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const userId = await requireUser();
  const supabase = await createClient();

  // Verify session ownership
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) throw new Error("Session not found");

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (messages || []) as ChatMessage[];
}

export async function createChatSession(
  notebookId: string,
  title: string = "New chat"
): Promise<ChatSession> {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      notebook_id: notebookId,
      title,
    })
    .select("id, title, created_at")
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    messageCount: 0,
  };
}

export async function updateChatSessionTitle(
  sessionId: string,
  title: string
): Promise<void> {
  const userId = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("chat_sessions")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function addChatMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  const userId = await requireUser();
  const supabase = await createClient();

  // Verify session ownership
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) throw new Error("Session not found");

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      role,
      content,
    })
    .select("id, role, content, created_at")
    .single();

  if (error) throw new Error(error.message);

  // Update session timestamp
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return data as ChatMessage;
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const userId = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
