"use client";

import { useState, useEffect } from "react";
import { X, FileText, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSourceContent } from "@/lib/actions/sources";
import { formatBytes } from "@/lib/format";

interface SourceViewerProps {
  sourceId: string | null;
  onClose: () => void;
}

interface FileContent {
  name: string;
  content: string;
  truncated: boolean;
  totalSize: number;
}

export function SourceViewer({ sourceId, onClose }: SourceViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileData, setFileData] = useState<FileContent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sourceId) {
      setFileData(null);
      return;
    }

    async function loadContent() {
      setLoading(true);
      setError("");
      try {
        const data = await getSourceContent(sourceId!);
        setFileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [sourceId]);

  function handleCopy() {
    if (!fileData) return;
    navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!sourceId) return null;

  return (
    <div className="w-[420px] shrink-0 h-full flex flex-col rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden">
      {/* Header */}
      <div className="h-11 border-b border-zinc-800/80 flex items-center justify-between px-3 bg-zinc-900">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={13} className="text-zinc-400 shrink-0" />
          <p className="text-[12px] text-zinc-200 truncate" style={{ fontFamily: "Geist, sans-serif" }}>
            {fileData?.name || "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {fileData && !fileData.truncated && (
            <button
              onClick={handleCopy}
              className="h-6 px-2 rounded-md flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          <button
            onClick={onClose}
            className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="text-zinc-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-[12px] text-red-300">{error}</p>
            </div>
          </div>
        ) : fileData ? (
          <div className="p-4">
            {/* File info */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-zinc-800/50">
              <span className="text-[11px] text-zinc-500">
                {formatBytes(fileData.totalSize)}
              </span>
              {fileData.truncated && (
                <span className="text-[10px] text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Showing first 50KB
                </span>
              )}
            </div>

            {/* Raw content */}
            <pre className="text-[12px] text-zinc-300 whitespace-pre-wrap break-words leading-relaxed" style={{ fontFamily: "Geist, sans-serif" }}>
              {fileData.content}
            </pre>

            {fileData.truncated && (
              <div className="mt-4 pt-3 border-t border-zinc-800/50">
                <p className="text-[11px] text-zinc-500 text-center">
                  File truncated at 50KB. Total size: {formatBytes(fileData.totalSize)}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
