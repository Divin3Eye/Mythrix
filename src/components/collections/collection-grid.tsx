"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderOpen, Plus, Pencil, Trash2, MoreHorizontal, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createCollection,
  updateCollection,
  softDeleteCollection,
} from "@/lib/actions/collections";

export interface CollectionItem {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  notebook_count: number;
}

const COLORS = ["#63e", "#2563eb", "#0d9488", "#059669", "#d97706", "#dc2626", "#db2777", "#7c3aed"];

export function CollectionGrid({ collections }: { collections: CollectionItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function openCreate() {
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(collection: CollectionItem) {
    setEditing(collection);
    setError("");
    setMenuId(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      if (editing) {
        formData.set("id", editing.id);
        await updateCollection(formData);
      } else {
        await createCollection(formData);
      }
      setModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await softDeleteCollection(id);
      setMenuId(null);
      router.refresh();
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Collections</h1>
          <p className="text-sm text-white/70 mt-1">
            {collections.length} collection{collections.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-150 active:scale-[0.97]"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <FolderOpen size={24} className="text-white/40" />
          </div>
          <h2 className="text-white font-medium">No collections yet</h2>
          <p className="text-white/70 text-sm mt-1.5 max-w-sm">
            Group related notebooks into collections to keep your research organized.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-150 active:scale-[0.97]"
          >
            <Plus size={15} strokeWidth={2.5} />
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              menuId={menuId}
              onMenuToggle={(id) => setMenuId(menuId === id ? null : id)}
              onMenuLeave={() => {
                if (menuTimer.current) clearTimeout(menuTimer.current);
                menuTimer.current = setTimeout(() => setMenuId(null), 120);
              }}
              onMenuEnter={() => {
                if (menuTimer.current) clearTimeout(menuTimer.current);
              }}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <CollectionModal
          collection={editing}
          error={error}
          busy={busy}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

function CollectionCard({
  collection,
  menuId,
  onMenuToggle,
  onMenuLeave,
  onMenuEnter,
  onEdit,
  onDelete,
}: {
  collection: CollectionItem;
  menuId: string | null;
  onMenuToggle: (id: string) => void;
  onMenuLeave: () => void;
  onMenuEnter: () => void;
  onEdit: (c: CollectionItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] hover:border-white/[0.15] transition-colors duration-200 overflow-hidden">
      <div
        className="h-1 shrink-0"
        style={{ background: collection.color || "#63e" }}
      />
      <div className="flex flex-col p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${collection.color || "#63e"}22`, color: collection.color || "#63e" }}
            >
              <FolderOpen size={16} />
            </div>
            <h3 className="text-white font-medium text-sm truncate">{collection.name}</h3>
          </div>

          <div className="relative" onMouseLeave={onMenuLeave} onMouseEnter={onMenuEnter}>
            <button
              onClick={() => onMenuToggle(collection.id)}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-surface-hover transition-colors"
              aria-label="Collection options"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuId === collection.id && (
              <div className="absolute top-full right-0 mt-1 w-[150px] bg-[#141416]/95 backdrop-blur-2xl border border-white/[0.12] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                <button
                  onClick={() => onEdit(collection)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-white/60 hover:text-white hover:bg-white/[0.05] text-xs transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <div className="mx-3 my-1 border-t border-white/[0.09]" />
                <button
                  onClick={() => onDelete(collection.id)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-red-400/[0.06] text-xs transition-colors"
                >
                  <Trash2 size={13} />
                  Move to Trash
                </button>
              </div>
            )}
          </div>
        </div>

        {collection.description && (
          <p className="text-white/70 text-xs mt-3 line-clamp-2">{collection.description}</p>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/55">
          <BookOpen size={12} />
          <span>
            {collection.notebook_count} notebook{collection.notebook_count === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}

function CollectionModal({
  collection,
  error,
  busy,
  onClose,
  onSubmit,
}: {
  collection: CollectionItem | null;
  error: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [color, setColor] = useState(collection?.color || COLORS[0]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#141416] border border-white/[0.1] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.09]">
          <h2 className="text-white font-medium">
            {collection ? "Edit Collection" : "New Collection"}
          </h2>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] px-3.5 py-2.5 text-xs text-[#fca5a5]" role="alert">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-white/70 mb-1.5">Name</label>
            <input
              name="name"
              defaultValue={collection?.name ?? ""}
              required
              placeholder="e.g. Q3 Research"
              autoFocus
              className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1.5">Description (optional)</label>
            <textarea
              name="description"
              defaultValue={collection?.description ?? ""}
              placeholder="What is this collection for?"
              rows={3}
              className="w-full rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1.5">Color</label>
            <input type="hidden" name="color" value={color} />
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-6 w-6 rounded-full transition-all duration-150",
                    color === c
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#141416]"
                      : "opacity-60 hover:opacity-100"
                  )}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {busy ? "Saving…" : collection ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
