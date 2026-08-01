"use client";

import { useState } from "react";
import { SourceList } from "./source-list";
import { SourceViewer } from "./source-viewer";
import { formatBytes } from "@/lib/format";
import { FileText, Globe, HardDrive, Layers } from "lucide-react";

interface Source {
  id: string;
  name: string;
  url: string | null;
  size_bytes: number;
  created_at: string;
}

interface SourcesPageContentProps {
  notebookId: string;
  notebookTitle: string;
  notebookDescription?: string | null;
  notebookColor?: string | null;
  sources: Source[];
}

export function SourcesPageContent({
  notebookId,
  notebookTitle,
  notebookDescription,
  notebookColor,
  sources: initialSources,
}: SourcesPageContentProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>(initialSources);

  const totalBytes = sources.reduce((sum, s) => sum + Number(s.size_bytes || 0), 0);
  const fileCount = sources.filter((s) => !s.url).length;
  const urlCount = sources.filter((s) => !!s.url).length;

  const stats = [
    { icon: Layers, label: "Total", value: String(sources.length) },
    { icon: FileText, label: "Files", value: String(fileCount) },
    { icon: Globe, label: "Links", value: String(urlCount) },
    { icon: HardDrive, label: "Size", value: formatBytes(totalBytes) },
  ];

  return (
    <div className="flex gap-4 h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            {notebookColor && (
              <div className="h-2 w-2 rounded-full" style={{ background: notebookColor }} />
            )}
            <h1 className="text-[20px] font-semibold text-white/90 tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              {notebookTitle}
            </h1>
          </div>
          {notebookDescription && (
            <p className="text-[13px] text-white/35 ml-[18px]">{notebookDescription}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={12} className="text-white/30" />
                  <span className="text-[11px] text-white/40">{stat.label}</span>
                </div>
                <p className="text-[17px] font-semibold text-white/80">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Sources */}
        <SourceList
          notebookId={notebookId}
          sources={sources}
          notebookColor={notebookColor ?? null}
          onSelectSource={setSelectedSourceId}
          selectedSourceId={selectedSourceId}
          onSourcesChange={setSources}
        />
      </div>

      {/* Viewer panel */}
      <SourceViewer
        sourceId={selectedSourceId}
        onClose={() => setSelectedSourceId(null)}
      />
    </div>
  );
}
