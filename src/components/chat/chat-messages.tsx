"use client";

import { useRef, useEffect } from "react";
import { Copy, RotateCcw, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Markdown from "react-markdown";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  is_streaming?: boolean;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  notebookTitle: string;
}

export function ChatMessages({ messages, notebookTitle }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mb-4 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Logo.png" alt="Mythrix" className="h-8 w-8 object-contain" />
        </div>
        <p className="text-[14px] text-zinc-200 font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
          Start a conversation
        </p>
        <p className="text-[12px] text-zinc-400 mt-1 text-center max-w-[280px]">
          Ask questions about your sources, or use the quick actions below
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("group flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar */}
      {!isUser && (
        <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Logo.png" alt="Mythrix" className="h-5 w-5 object-contain" />
        </div>
      )}

      {/* Bubble */}
      <div className={cn("max-w-[75%] min-w-0", isUser && "order-first")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
            isUser
              ? "bg-zinc-700 text-white rounded-br-md"
              : "bg-zinc-800 border border-zinc-700/40 text-zinc-100 rounded-bl-md"
          )}
          style={{ fontFamily: "Geist, sans-serif" }}
        >
          {message.is_streaming ? (
            <div className="flex items-center gap-1.5">
              <span>{message.content}</span>
              <span className="inline-block w-1.5 h-3.5 bg-zinc-400 animate-pulse rounded-sm" />
            </div>
          ) : isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <div className="prose prose-invert prose-zinc max-w-none
              prose-headings:text-zinc-100 prose-headings:font-semibold
              prose-headings:text-base prose-headings:mt-4 prose-headings:mb-2
              prose-p:text-zinc-200 prose-p:leading-relaxed prose-p:my-2
              prose-ul:my-2 prose-ol:my-2 prose-li:my-1
              prose-strong:text-zinc-100 prose-strong:font-semibold
              prose-code:text-purple-300 prose-code:bg-zinc-700/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[12px]
              prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-700/50 prose-pre:rounded-lg
              prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-zinc-600 prose-blockquote:text-zinc-300 prose-blockquote:italic">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </div>

        {/* Actions */}
        {!message.is_streaming && (
          <div className={cn(
            "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "justify-end" : "justify-start"
          )}>
            <button
              onClick={handleCopy}
              className="h-6 px-2 rounded-md flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {!isUser && (
              <button className="h-6 px-2 rounded-md flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all">
                <RotateCcw size={10} />
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="h-7 w-7 rounded-lg bg-zinc-700 border border-zinc-600/50 flex items-center justify-center shrink-0 mt-0.5">
          <User size={13} className="text-zinc-200" />
        </div>
      )}
    </div>
  );
}
