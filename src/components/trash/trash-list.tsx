"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, AlertTriangle, X, BookOpen, FolderOpen } from "lucide-react";
import {
  restoreNotebook,
  permanentlyDeleteNotebook,
} from "@/lib/actions/notebooks";
import {
  restoreCollection,
  permanentlyDeleteCollection,
} from "@/lib/actions/collections";
import { formatDateTime } from "@/lib/format";

export interface TrashNotebook {
  kind: "notebook";
  id: string;
  title: string;
  color: string | null;
  deleted_at: string;
}

export interface TrashCollection {
  kind: "collection";
  id: string;
  name: string;
  color: string | null;
  deleted_at: string;
}

export type TrashItem = TrashNotebook | TrashCollection;

const RETENTION_DAYS = 30;

export function TrashList({ items }: { items: TrashItem[] }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<TrashItem | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleRestore(item: TrashItem) {
    try {
      if (item.kind === "notebook") await restoreNotebook(item.id);
      else await restoreCollection(item.id);
      router.refresh();
    } catch {
      /* noop */
    }
  }

  async function handlePermanentDelete(item: TrashItem) {
    setBusy(true);
    try {
      if (item.kind === "notebook") await permanentlyDeleteNotebook(item.id);
      else await permanentlyDeleteCollection(item.id);
      setConfirm(null);
      router.refresh();
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Trash</h1>
          <p className="text-sm text-white/70 mt-1">
            Items are permanently deleted after {RETENTION_DAYS} days
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Trash2 size={24} className="text-white/40" />
          </div>
          <h2 className="text-white font-medium">Trash is empty</h2>
          <p className="text-white/70 text-sm mt-1.5 max-w-sm">
            Notebooks and collections you delete will appear here for 30 days before
            being permanently removed.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={`${item.kind}-${item.id}`}
              className="flex items-center gap-4 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] px-4 py-3.5"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: `${item.color || "#63e"}22`,
                  color: item.color || "#63e",
                }}
              >
                {item.kind === "notebook" ? (
                  <BookOpen size={15} />
                ) : (
                  <FolderOpen size={15} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {item.kind === "notebook" ? item.title : item.name}
                </p>
                <p className="text-[11px] text-white/55 mt-0.5">
                  {item.kind === "notebook" ? "Notebook" : "Collection"} · Deleted{" "}
                  {formatDateTime(item.deleted_at)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleRestore(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-white/70 hover:text-white text-xs transition-colors"
                >
                  <RotateCcw size={13} />
                  Restore
                </button>
                <button
                  onClick={() => setConfirm(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/[0.08] hover:bg-red-400/[0.14] text-red-400/80 hover:text-red-400 text-xs transition-colors"
                >
                  <Trash2 size={13} />
                  Delete Forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirm(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#141416] border border-white/[0.1] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5 p-5">
              <div className="h-10 w-10 rounded-xl bg-red-400/[0.1] border border-red-400/[0.2] flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-white font-medium">Delete permanently?</h2>
                <p className="text-sm text-white/70 mt-1.5 leading-relaxed">
                  “{confirm.kind === "notebook" ? confirm.title : confirm.name}” and everything inside it will be permanently
                  deleted. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setConfirm(null)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-surface-hover transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermanentDelete(confirm)}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition-colors disabled:opacity-50"
              >
                {busy ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
