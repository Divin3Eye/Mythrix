"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus, Search, Trash2, MoreHorizontal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  created_at: string;
  messageCount: number;
}

interface ChatHistorySidebarProps {
  notebookId: string;
  sessions: ChatSession[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  collapsed?: boolean;
}

export function ChatHistorySidebar({
  notebookId,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  collapsed = false,
}: ChatHistorySidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSession = (id: string) => {
    onSelectSession(id);
    router.push(`/notebook/${notebookId}/chat/${id}`);
  };

  const handleNewChat = () => {
    onNewChat();
    // Will navigate after session is created
  };

  if (collapsed) {
    return (
      <div className="w-[52px] flex flex-col items-center py-3 gap-3">
        <button
          onClick={handleNewChat}
          className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
          title="New chat"
        >
          <Plus size={14} />
        </button>
        <div className="w-5 h-px bg-zinc-700/50" />
        <div className="flex-1 overflow-y-auto space-y-1 w-full px-1.5">
          {filtered.slice(0, 10).map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all",
                session.id === activeSessionId
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              )}
              title={session.title}
            >
              <MessageSquare size={13} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[220px] flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-3 py-3 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
            Chat History
          </p>
          <button
            onClick={handleNewChat}
            className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all"
            title="New chat"
          >
            <Plus size={13} />
          </button>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full h-7 rounded-md bg-zinc-800 border border-zinc-700/50 pl-7 pr-2.5 text-[11px] text-white placeholder:text-zinc-500 outline-none focus:border-zinc-600 transition-colors"
            style={{ fontFamily: "Geist, sans-serif" }}
          />
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <MessageSquare size={20} className="text-zinc-600 mx-auto mb-2" />
            <p className="text-[11px] text-zinc-500">No chats yet</p>
          </div>
        ) : (
          <div className="space-y-0.5 px-1.5">
            {filtered.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={() => handleSelectSession(session.id)}
                onDelete={() => onDeleteSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionRow({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-150",
        isActive
          ? "bg-zinc-800 text-white"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
      )}
      onClick={onSelect}
    >
      <MessageSquare size={13} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] truncate" style={{ fontFamily: "Geist, sans-serif" }}>
          {session.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={8} className="text-zinc-500" />
          <span className="text-[9px] text-zinc-500">{session.messageCount} messages</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="h-5 w-5 rounded flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 hover:!text-zinc-200 hover:bg-zinc-700/50 transition-all shrink-0"
      >
        <MoreHorizontal size={11} />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-0.5 z-50 w-32 rounded-lg bg-zinc-800 border border-zinc-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={10} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
