"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Archive, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavorite, softDeleteNotebook } from "@/lib/actions/notebooks";

interface NotebookHeaderProps {
  notebook: {
    id: string;
    title: string;
    description: string | null;
    color: string | null;
    is_favorite: boolean;
    deleted_at: string | null;
  };
}

export function NotebookHeader({ notebook }: NotebookHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFavorite() {
    setBusy(true);
    try {
      await toggleFavorite(notebook.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    setBusy(true);
    try {
      await softDeleteNotebook(notebook.id);
      router.push("/notebooks");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          {notebook.color && (
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ background: notebook.color }}
            />
          )}
          <h1 className="text-xl font-semibold text-white/90 truncate" style={{ fontFamily: "Geist, sans-serif" }}>
            {notebook.title}
          </h1>
          {notebook.is_favorite && (
            <Star size={16} className="text-amber-400 fill-amber-400 shrink-0" />
          )}
          {notebook.deleted_at && (
            <span className="text-[11px] bg-white/[0.06] px-2 py-0.5 rounded-full text-white/40 shrink-0">
              Archived
            </span>
          )}
        </div>
        {notebook.description && (
          <p className="text-sm text-white/40 mt-1.5 truncate" style={{ fontFamily: "Geist, sans-serif" }}>
            {notebook.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleFavorite}
          disabled={busy}
          className={cn(
            "h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs transition-all duration-150",
            notebook.is_favorite
              ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
          )}
        >
          <Star size={14} className={notebook.is_favorite ? "fill-amber-400" : ""} />
          <span className="hidden sm:inline" style={{ fontFamily: "Geist, sans-serif" }}>Favorite</span>
        </button>

        <button
          onClick={handleArchive}
          disabled={busy}
          className={cn(
            "h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs transition-all duration-150",
            notebook.deleted_at
              ? "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20"
              : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
          )}
        >
          <Archive size={14} />
          <span className="hidden sm:inline" style={{ fontFamily: "Geist, sans-serif" }}>Archive</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-150"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl bg-[#1a1a1e] border border-white/[0.1] shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: rename modal
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Pencil size={14} />
                  Rename
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleArchive();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
