"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Loader2, Paperclip, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [showHint, setShowHint] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    setShowHint(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !composingRef.current) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    setValue(el.value);
  }

  return (
    <div className="px-4 pb-4">
      <div className="rounded-xl bg-zinc-800 border border-zinc-700/50 overflow-hidden focus-within:border-zinc-600 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          disabled={disabled}
          rows={1}
          placeholder={placeholder || "Ask about your sources..."}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[13px] text-white placeholder:text-zinc-500 outline-none leading-relaxed"
          style={{ fontFamily: "Geist, sans-serif", minHeight: "44px" }}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-1">
            <button
              className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
              title="Attach file"
            >
              <Paperclip size={14} />
            </button>
            <button
              className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
              title="Quick actions"
            >
              <Zap size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {showHint && value.length === 0 && (
              <span className="text-[10px] text-zinc-500">
                Enter to send · Shift+Enter for new line
              </span>
            )}
            <button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-150",
                value.trim() && !disabled
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "text-zinc-600 cursor-not-allowed"
              )}
            >
              {disabled ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
