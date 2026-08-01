"use client";

import { FileText, Globe, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatBytes, relativeTime } from "@/lib/format";

export interface Source {
  id: string;
  name: string;
  url: string | null;
  size_bytes: number;
  created_at: string;
}

interface ChatSidebarProps {
  sources: Source[];
  notebookColor?: string | null;
}

export function ChatSidebar({ sources, notebookColor }: ChatSidebarProps) {
  const color = notebookColor || "#7c3aed";
  const files = sources.filter((s) => !s.url);
  const urls = sources.filter((s) => !!s.url);

  return (
    <div className="space-y-4 sticky top-24">
      {/* Sources */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-white/[0.05]">
          <p className="text-[11px] text-white/35 uppercase tracking-wider" style={{ fontFamily: "Geist, sans-serif" }}>
            Sources
          </p>
        </div>

        <div className="p-2">
          {sources.length === 0 ? (
            <p className="text-[11px] text-white/20 py-3 text-center">
              No sources in this notebook
            </p>
          ) : (
            <div className="space-y-0.5">
              {files.length > 0 && (
                <SourceGroup
                  label="Files"
                  count={files.length}
                  sources={files}
                  defaultOpen
                />
              )}
              {urls.length > 0 && (
                <SourceGroup
                  label="Links"
                  count={urls.length}
                  sources={urls}
                  defaultOpen={files.length === 0}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-white/[0.05]">
          <p className="text-[11px] text-white/35 uppercase tracking-wider" style={{ fontFamily: "Geist, sans-serif" }}>
            Quick actions
          </p>
        </div>
        <div className="p-2 space-y-0.5">
          <ActionButton label="Summarize sources" color={color} />
          <ActionButton label="Extract key points" color={color} />
          <ActionButton label="Create outline" color={color} />
        </div>
      </div>
    </div>
  );
}

function SourceGroup({
  label,
  count,
  sources,
  defaultOpen = false,
}: {
  label: string;
  count: number;
  sources: Source[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-white/35 hover:text-white/50 hover:bg-white/[0.03] transition-all"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="font-medium">{label}</span>
        <span className="text-white/20 ml-auto">{count}</span>
      </button>
      {open && (
        <div className="ml-3 space-y-0.5">
          {sources.map((source) => (
            <SourceRow key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceRow({ source }: { source: Source }) {
  const isUrl = !!source.url;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
      {isUrl ? (
        <Globe size={11} className="text-white/20 shrink-0" />
      ) : (
        <FileText size={11} className="text-white/20 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/45 truncate">{source.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock size={8} className="text-white/15" />
          <span className="text-[9px] text-white/15">{relativeTime(source.created_at)}</span>
          {!isUrl && source.size_bytes > 0 && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-[9px] text-white/15">{formatBytes(source.size_bytes)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, color }: { label: string; color: string }) {
  return (
    <button
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-all text-left"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ background: `${color}60` }}
      />
      {label}
    </button>
  );
}
