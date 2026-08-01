"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Link2, Upload, X, Plus,
  Trash2, ExternalLink, Globe, File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addSource, deleteSource } from "@/lib/actions/sources";
import { formatBytes, relativeTime } from "@/lib/format";

interface Source {
  id: string;
  name: string;
  url: string | null;
  size_bytes: number;
  created_at: string;
}

interface SourceListProps {
  notebookId: string;
  sources: Source[];
  notebookColor: string | null;
  onSelectSource?: (id: string) => void;
  selectedSourceId?: string | null;
  onSourcesChange?: (sources: Source[]) => void;
}

export function SourceList({ notebookId, sources: initialSources, notebookColor, onSelectSource, selectedSourceId, onSourcesChange }: SourceListProps) {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [urlInput, setUrlInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const color = notebookColor || "#7c3aed";

  // Sync with parent when initialSources changes
  useState(() => {
    setSources(initialSources);
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAdding(true);
    setError("");
    const newSources: Source[] = [];
    for (const file of Array.from(files)) {
      try {
        // Read file content
        const content = await file.text();
        const result = await addSource({
          notebook_id: notebookId,
          name: file.name,
          url: null,
          size_bytes: file.size,
          content,
        });
        // Add to local state
        newSources.push({
          id: result?.id || crypto.randomUUID(),
          name: file.name,
          url: null,
          size_bytes: file.size,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add source");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAdding(false);
    // Update local state with new sources
    if (newSources.length > 0) {
      const updated = [...newSources, ...sources];
      setSources(updated);
      onSourcesChange?.(updated);
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files.length) return;
    setAdding(true);
    setError("");
    const newSources: Source[] = [];
    for (const file of Array.from(files)) {
      try {
        // Read file content
        const content = await file.text();
        const result = await addSource({
          notebook_id: notebookId,
          name: file.name,
          url: null,
          size_bytes: file.size,
          content,
        });
        // Add to local state
        newSources.push({
          id: result?.id || crypto.randomUUID(),
          name: file.name,
          url: null,
          size_bytes: file.size,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add source");
      }
    }
    setAdding(false);
    // Update local state with new sources
    if (newSources.length > 0) {
      const updated = [...newSources, ...sources];
      setSources(updated);
      onSourcesChange?.(updated);
    }
  }

  async function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    try { new URL(url); } catch { setError("Enter a valid URL"); return; }
    setAdding(true);
    setError("");
    try {
      const hostname = new URL(url).hostname;
      const result = await addSource({ notebook_id: notebookId, name: hostname, url, size_bytes: 0 });
      setUrlInput("");
      // Add to local state
      if (result) {
        const newSource: Source = {
          id: result.id,
          name: hostname,
          url,
          size_bytes: 0,
          created_at: new Date().toISOString(),
        };
        const updated = [newSource, ...sources];
        setSources(updated);
        onSourcesChange?.(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add source");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteSource(id);
      const updated = sources.filter((s) => s.id !== id);
      setSources(updated);
      onSourcesChange?.(updated);
      // Clear selection if deleted source was selected
      if (selectedSourceId === id) {
        onSelectSource?.(null as any);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div>
      {/* Section header */}
      <h2 className="text-[13px] font-medium text-white/50 mb-3 uppercase tracking-wider">Sources</h2>

      {/* Upload + URL row */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-xl border transition-all duration-200 mb-4",
          dragOver
            ? "border-white/20 bg-white/[0.04]"
            : "border-white/[0.08] bg-white/[0.04]"
        )}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={adding}
            className="flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[12px] text-white/60 hover:text-white/80 hover:bg-white/[0.08] transition-all disabled:opacity-40 shrink-0"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            <Upload size={13} />
            Upload
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

          <div className="hidden sm:block w-px h-5 bg-white/[0.06]" />

          {/* URL input */}
          <div className="relative flex-1">
            <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }}
              placeholder="Paste a URL..."
              className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-8 pr-3 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-white/[0.15] transition-colors"
              style={{ fontFamily: "Geist, sans-serif" }}
            />
          </div>

          <button
            onClick={handleAddUrl}
            disabled={adding || !urlInput.trim()}
            className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all disabled:opacity-30 shrink-0"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            <Plus size={13} />
            Add
          </button>
        </div>

        {/* Drag hint */}
        {dragOver && (
          <div className="px-3 pb-2.5">
            <div className="flex items-center justify-center gap-2 h-14 rounded-lg border border-dashed border-white/15 text-[12px] text-white/40">
              <Upload size={14} />
              Drop files to upload
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[12px] text-red-300">
          <X size={12} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Source list */}
      {sources.length === 0 ? (
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] border-dashed">
          <div className="flex flex-col items-center justify-center py-12">
            <File size={28} className="text-white/10 mb-3" />
            <p className="text-[13px] text-white/30" style={{ fontFamily: "Geist, sans-serif" }}>
              No sources yet
            </p>
            <p className="text-[11px] text-white/15 mt-1">
              Upload files or add URLs to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden">
          {sources.map((source, i) => (
            <SourceRow
              key={source.id}
              source={source}
              onDelete={() => handleDelete(source.id)}
              isLast={i === sources.length - 1}
              onClick={() => onSelectSource?.(source.id)}
              isSelected={source.id === selectedSourceId}
            />
          ))}
        </div>
      )}

      {sources.length > 0 && (
        <p className="text-[11px] text-white/20 mt-2.5 text-center">
          {sources.length} source{sources.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function SourceRow({ source, onDelete, isLast, onClick, isSelected }: { source: Source; onDelete: () => void; isLast: boolean; onClick?: () => void; isSelected?: boolean }) {
  const isUrl = !!source.url;

  return (
    <div className={cn(
      "group flex items-center gap-3 px-3.5 py-2.5 transition-colors cursor-pointer",
      !isLast && "border-b border-white/[0.05]",
      isSelected
        ? "bg-white/[0.06] border-l-2 border-l-purple-500"
        : "hover:bg-white/[0.02]"
    )}
    onClick={onClick}
    >
      {/* Icon */}
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
        isUrl ? "bg-white/[0.04]" : "bg-white/[0.04]"
      )}>
        {isUrl ? (
          <Globe size={14} className="text-white/30" />
        ) : (
          <FileText size={14} className="text-white/30" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white/65 truncate" style={{ fontFamily: "Geist, sans-serif" }}>
          {source.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-white/20">{relativeTime(source.created_at)}</span>
          {!isUrl && source.size_bytes > 0 && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-[10px] text-white/20">{formatBytes(source.size_bytes)}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUrl && (
          <a
            href={source.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 rounded-md flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
          >
            <ExternalLink size={12} />
          </a>
        )}
        <button
          onClick={onDelete}
          className="h-6 w-6 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
