"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, Star, Pencil, Trash2, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateNotebook,
  softDeleteNotebook,
  toggleFavorite,
} from "@/lib/actions/notebooks";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { relativeTime } from "@/lib/format";

export interface NotebookItem {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_favorite: boolean;
  created_at: string;
}

const COLORS = ["#63e", "#2563eb", "#0d9488", "#059669", "#d97706", "#dc2626", "#db2777", "#7c3aed"];

export function NotebookGrid({
  notebooks,
  emptyTitle = "No notebooks yet",
  emptyDescription = "Create your first notebook to start collecting sources and generating insights.",
  showHeader = true,
  showCreateButton = true,
  onOpenCreate,
}: {
  notebooks: NotebookItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  showHeader?: boolean;
  showCreateButton?: boolean;
  onOpenCreate?: () => void;
}) {
  const router = useRouter();
  const { openNotebookOnboarding } = useOnboarding();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotebookItem | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!menuId) return;
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuId(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuId]);

  function openCreate(e?: React.MouseEvent<HTMLElement>) {
    if (onOpenCreate) {
      onOpenCreate();
      return;
    }
    openNotebookOnboarding(e?.currentTarget?.getBoundingClientRect());
  }

  function openEdit(notebook: NotebookItem) {
    setEditing(notebook);
    setError("");
    setMenuId(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("id", editing.id);
      await updateNotebook(formData);
      setModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleFavorite(id: string) {
    try {
      await toggleFavorite(id);
      router.refresh();
    } catch {
      /* noop */
    }
  }

  async function handleDelete(id: string) {
    try {
      await softDeleteNotebook(id);
      setMenuId(null);
      router.refresh();
    } catch {
      /* noop */
    }
  }

  return (
    <>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Notebooks</h1>
            <p className="text-sm text-white/70 mt-1">
              {notebooks.length} notebook{notebooks.length === 1 ? "" : "s"}
            </p>
          </div>
          {showCreateButton && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-150 active:scale-[0.97]"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Notebook
            </button>
          )}
        </div>
      )}

      {notebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-white/40" />
          </div>
          <h2 className="text-white font-medium">{emptyTitle}</h2>
          <p className="text-white/70 text-sm mt-1.5 max-w-sm">
            {emptyDescription}
          </p>
          {showCreateButton && (
            <button
              onClick={openCreate}
              className="mt-5 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-150 active:scale-[0.97]"
            >
              <Plus size={15} strokeWidth={2.5} />
              Create Notebook
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              menuId={menuId}
              menuRef={menuRef}
              onMenuToggle={(id) => setMenuId(menuId === id ? null : id)}
              onEdit={openEdit}
              onFavorite={handleFavorite}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <NotebookModal
          notebook={editing}
          error={error}
          busy={busy}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

function NotebookCard({
  notebook,
  menuId,
  menuRef,
  onMenuToggle,
  onEdit,
  onFavorite,
  onDelete,
}: {
  notebook: NotebookItem;
  menuId: string | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onMenuToggle: (id: string) => void;
  onEdit: (n: NotebookItem) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const color = notebook.color || "#63e";
  return (
    <div className="group relative flex flex-col rounded-2xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-md transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-2xl opacity-[0.15] transition-opacity duration-300 group-hover:opacity-[0.25]"
        style={{ background: `radial-gradient(80% 100% at 15% 0%, ${color} 0%, transparent 70%)` }}
      />
      <div className="relative flex flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/notebook/${notebook.id}`}
            className="flex items-center gap-3 min-w-0"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ background: `${color}1f`, borderColor: `${color}40`, color }}
            >
              <BookOpen size={17} strokeWidth={1.75} />
            </div>
            <h3 className="text-white font-medium text-[15px] truncate">{notebook.title}</h3>
          </Link>

          <div
            ref={menuRef}
            className="relative shrink-0"
          >
            <button
              onClick={() => onMenuToggle(notebook.id)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg border transition-all duration-200",
                menuId === notebook.id
                  ? "bg-white/[0.08] border-white/[0.16] text-white"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.1] border-transparent"
              )}
              aria-label="Notebook options"
              aria-haspopup="menu"
              aria-expanded={menuId === notebook.id}
            >
              <MoreHorizontal size={16} strokeWidth={1.75} />
            </button>

            {menuId === notebook.id && (
              <div
                role="menu"
                style={{ animation: "fadeInZoom 160ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
                className="absolute top-full right-0 mt-2 w-44 bg-[#141416]/95 backdrop-blur-2xl border border-white/[0.12] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden z-50"
              >
                <button
                  role="menuitem"
                  onClick={() => onEdit(notebook)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-white/65 hover:text-white hover:bg-white/[0.06] text-xs transition-colors"
                >
                  <Pencil size={13} strokeWidth={1.75} />
                  Edit
                </button>
                <button
                  role="menuitem"
                  onClick={() => onFavorite(notebook.id)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-white/65 hover:text-white hover:bg-white/[0.06] text-xs transition-colors"
                >
                  <Star size={13} strokeWidth={1.75} className={notebook.is_favorite ? "fill-amber-400 text-amber-400" : ""} />
                  {notebook.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                </button>
                <div className="mx-3 my-1 border-t border-white/[0.08]" />
                <button
                  role="menuitem"
                  onClick={() => onDelete(notebook.id)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-red-400/85 hover:text-red-400 hover:bg-red-400/[0.08] text-xs transition-colors"
                >
                  <Trash2 size={13} strokeWidth={1.75} />
                  Move to Trash
                </button>
              </div>
            )}
          </div>
        </div>

        {notebook.description && (
          <p className="text-white/60 text-xs mt-3.5 leading-relaxed line-clamp-2">{notebook.description}</p>
        )}

        <div className="mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-between">
          <span className="text-[11px] text-white/45">
            {relativeTime(notebook.created_at)}
          </span>
          <button
            onClick={() => onFavorite(notebook.id)}
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-md transition-colors duration-200",
              notebook.is_favorite
                ? "text-amber-400"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
            )}
            aria-label={notebook.is_favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={14} strokeWidth={1.75} className={notebook.is_favorite ? "fill-amber-400" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NotebookModal({
  notebook,
  error,
  busy,
  onClose,
  onSubmit,
}: {
  notebook: NotebookItem | null;
  error: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [color, setColor] = useState(notebook?.color || COLORS[0]);

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
          <h2 className="text-white font-medium">Edit Notebook</h2>
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
            <label className="block text-xs text-white/70 mb-1.5">Title</label>
            <input
              name="title"
              defaultValue={notebook?.title ?? ""}
              required
              placeholder="e.g. Attention Is All You Need"
              autoFocus
              className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1.5">Description (optional)</label>
            <textarea
              name="description"
              defaultValue={notebook?.description ?? ""}
              placeholder="What is this notebook about?"
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
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
