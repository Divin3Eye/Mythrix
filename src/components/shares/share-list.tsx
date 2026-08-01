"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, X, Copy, Check, Trash2, Link2, Clock } from "lucide-react";
import { createShare, revokeShare } from "@/lib/actions/shares";
import { formatDateTime, relativeTime } from "@/lib/format";

export interface ShareItem {
  id: string;
  token: string;
  notebook_id: string;
  notebook_title: string;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
}

interface ShareNotebook {
  id: string;
  title: string;
}

export function ShareList({
  shares,
  notebooks,
}: {
  shares: ShareItem[];
  notebooks: ShareNotebook[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function shareUrl(token: string) {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/share/${token}`;
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createShare(new FormData(e.currentTarget));
      setModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await revokeShare(id);
      router.refresh();
    } catch {
      /* noop */
    }
  }

  async function handleCopy(token: string) {
    try {
      await navigator.clipboard.writeText(shareUrl(token));
      setCopied(token);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  }

  const activeShares = shares.filter((s) => !s.revoked);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Shared</h1>
          <p className="text-sm text-white/70 mt-1">
            {activeShares.length} active share{activeShares.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
          disabled={notebooks.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Share Link
        </button>
      </div>

      {activeShares.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Users size={24} className="text-white/40" />
          </div>
          <h2 className="text-white font-medium">Nothing shared yet</h2>
          <p className="text-white/70 text-sm mt-1.5 max-w-sm">
            Generate a view-only link to share a notebook with anyone, even outside
            Mythrix.
          </p>
          {notebooks.length > 0 && (
            <button
              onClick={() => {
                setError("");
                setModalOpen(true);
              }}
              className="mt-5 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-150 active:scale-[0.97]"
            >
              <Plus size={15} strokeWidth={2.5} />
              Create Share Link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeShares.map((share) => (
            <div
              key={share.id}
              className="flex items-center gap-4 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] px-4 py-3.5"
            >
              <div className="h-9 w-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                <Link2 size={15} className="text-white/70" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {share.notebook_title}
                </p>
                <p className="text-[11px] text-white/55 font-mono truncate mt-0.5">
                  {shareUrl(share.token)}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/55 shrink-0">
                <Clock size={12} />
                {share.expires_at ? `Expires ${formatDateTime(share.expires_at)}` : "No expiry"}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(share.token)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-white/70 hover:text-white text-xs transition-colors"
                >
                  {copied === share.token ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRevoke(share.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/[0.08] hover:bg-red-400/[0.14] text-red-400/80 hover:text-red-400 text-xs transition-colors"
                >
                  <Trash2 size={13} />
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#141416] border border-white/[0.1] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.09]">
              <h2 className="text-white font-medium">New Share Link</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {error && (
                <div className="rounded-lg bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] px-3.5 py-2.5 text-xs text-[#fca5a5]" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-white/70 mb-1.5">Notebook</label>
                <select
                  name="notebookId"
                  required
                  className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 text-sm text-white outline-none focus:border-white/[0.2] transition-colors"
                >
                  {notebooks.map((nb) => (
                    <option key={nb.id} value={nb.id} className="bg-[#141416]">
                      {nb.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1.5">Expiration</label>
                <select
                  name="expiresIn"
                  className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 text-sm text-white outline-none focus:border-white/[0.2] transition-colors"
                >
                  <option value="never" className="bg-[#141416]">
                    Never expires
                  </option>
                  <option value="1" className="bg-[#141416]">
                    1 day
                  </option>
                  <option value="7" className="bg-[#141416]">
                    7 days
                  </option>
                  <option value="30" className="bg-[#141416]">
                    30 days
                  </option>
                </select>
              </div>

              <p className="text-[11px] text-white/55 leading-relaxed">
                Anyone with the link can view this notebook. You can revoke it at any
                time.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {busy ? "Creating…" : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
