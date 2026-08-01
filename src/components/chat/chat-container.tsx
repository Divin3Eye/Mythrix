"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatMessages, type ChatMessage } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatHistorySidebar, type ChatSession } from "./chat-history-sidebar";
import { MessageSquare } from "lucide-react";
import { sendChatMessage } from "@/lib/actions/chat";
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
  updateChatSessionTitle,
  addChatMessage,
  deleteChatSession,
} from "@/lib/actions/chat-history";

interface ChatContainerProps {
  notebookId: string;
  notebookTitle: string;
  notebookColor?: string | null;
  initialSessionId?: string;
}

export function ChatContainer({
  notebookId,
  notebookTitle,
  notebookColor,
  initialSessionId,
}: ChatContainerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await getChatSessions(notebookId);
        setSessions(data);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setLoadingSessions(false);
      }
    }
    loadSessions();
  }, [notebookId]);

  // Load messages when session changes
  useEffect(() => {
    async function loadMessages() {
      if (!activeSessionId) {
        setMessages([]);
        return;
      }
      try {
        const data = await getChatMessages(activeSessionId);
        setMessages(data.map((m) => ({ ...m, is_streaming: false })));
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
    loadMessages();
  }, [activeSessionId]);

  const handleNewChat = useCallback(async () => {
    try {
      const session = await createChatSession(notebookId);
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
      // Navigate to the new chat URL
      window.history.pushState(null, "", `/notebook/${notebookId}/chat/${session.id}`);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }, [notebookId]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await deleteChatSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) {
          setActiveSessionId(undefined);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    },
    [activeSessionId]
  );

  const handleSend = useCallback(
    async (content: string) => {
      // Create a new session if none active
      let sessionId = activeSessionId;
      if (!sessionId) {
        try {
          const session = await createChatSession(notebookId, content.slice(0, 50));
          sessionId = session.id;
          setSessions((prev) => [session, ...prev]);
          setActiveSessionId(sessionId);
          // Navigate to the new chat URL
          window.history.pushState(null, "", `/notebook/${notebookId}/chat/${sessionId}`);
        } catch (err) {
          console.error("Failed to create session:", err);
          return;
        }
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        created_at: new Date().toISOString(),
        is_streaming: false,
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      // Save user message to DB
      try {
        await addChatMessage(sessionId, "user", content);
      } catch (err) {
        console.error("Failed to save user message:", err);
      }

      // Update session title if first message
      if (messages.length === 0 && sessionId) {
        const newTitle = content.slice(0, 50) || "New chat";
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, title: newTitle } : s
          )
        );
        try {
          await updateChatSessionTitle(sessionId, newTitle);
        } catch (err) {
          console.error("Failed to update session title:", err);
        }
      }

      try {
        // Build conversation history for context
        const conversationHistory = messages.map((m) => ({
          role: m.role,
          content: m.content
        }));

        // Call the server action
        const response = await sendChatMessage(notebookId, content, conversationHistory);

        // Add assistant message directly - no streaming simulation
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          created_at: new Date().toISOString(),
          is_streaming: false,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Save assistant message to DB
        try {
          await addChatMessage(sessionId, "assistant", response.answer);
        } catch (err) {
          console.error("Failed to save assistant message:", err);
        }
      } catch (error) {
        // Fallback on error
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        const errorResponse = `I apologize, but I encountered an error while processing your request: ${errorMessage}. Please try again.`;

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorResponse,
          created_at: new Date().toISOString(),
          is_streaming: false,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Save error message to DB
        try {
          await addChatMessage(sessionId, "assistant", errorResponse);
        } catch (err) {
          console.error("Failed to save error message:", err);
        }
      }

      setStreaming(false);

      // Update session message count
      if (sessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messageCount: s.messageCount + 2 }
              : s
          )
        );
      }
    },
    [messages, activeSessionId, notebookId]
  );

  return (
    <div className="flex gap-2 h-full">
      {/* Chat History Sidebar */}
      <div className="shrink-0 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80">
        <ChatHistorySidebar
          notebookId={notebookId}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden">
        {/* Header */}
        <div className="h-11 border-b border-zinc-800/80 flex items-center px-3 gap-2 bg-zinc-900">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <MessageSquare size={13} />
          </button>
          <div className="h-3 w-px bg-zinc-700/50" />
          <p
            className="text-[12px] text-zinc-300 truncate"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            {notebookTitle}
          </p>
        </div>

        <ChatMessages
          messages={messages}
          notebookTitle={notebookTitle}
        />
        <ChatInput
          onSend={handleSend}
          disabled={streaming}
          placeholder={`Ask about ${notebookTitle}...`}
        />
      </div>
    </div>
  );
}
