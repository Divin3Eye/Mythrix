"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, CreditCard, AlertTriangle, Calendar } from "lucide-react";
import { updateProfile, deleteAccount } from "@/lib/actions/profile";
import { formatDate } from "@/lib/format";

export interface ProfileData {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  plan: string;
  created_at: string;
}

export function AccountForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const initials = (profile.full_name || profile.username || profile.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateProfile(new FormData(e.currentTarget));
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteAccount(new FormData(e.currentTarget));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Avatar + Identity Card */}
        <section className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.09] text-center">
            <h2 className="text-white font-medium">Profile</h2>
            <p className="text-xs text-white/40 mt-0.5">
              This information is visible to you and your collaborators.
            </p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="relative">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
              >
                {initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#141416] flex items-center justify-center"
                style={{ background: profile.plan === "pro" ? "#7c3aed" : "#3b82f6" }}
              >
                <span className="text-[8px] text-white font-bold uppercase">
                  {profile.plan === "pro" ? "P" : "F"}
                </span>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-3 font-medium">
              {profile.full_name || profile.username || "User"}
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              @{profile.username || "username"}
            </p>
          </div>

          <form onSubmit={handleSave} className="p-6 pt-2 space-y-4">
            {error && (
              <div className="rounded-lg bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] px-3.5 py-2.5 text-xs text-[#fca5a5]" role="alert">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] px-3.5 py-2.5 text-xs text-[#86efac]">
                Profile updated.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-center text-xs text-white/70 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    name="username"
                    defaultValue={profile.username ?? ""}
                    required
                    placeholder="username"
                    className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] pl-9 pr-3.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-center text-xs text-white/70 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    name="fullName"
                    defaultValue={profile.full_name ?? ""}
                    placeholder="Full name"
                    className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] pl-9 pr-3.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-1">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Account Info */}
        <section className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.09] text-center">
            <h2 className="text-white font-medium">Account</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoCard
                icon={Mail}
                label="Email"
                value={profile.email || "—"}
              />
              <InfoCard
                icon={CreditCard}
                label="Plan"
                value={profile.plan === "pro" ? "Pro" : "Free"}
                badge={profile.plan}
              />
              <InfoCard
                icon={Calendar}
                label="Member Since"
                value={formatDate(profile.created_at)}
              />
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl bg-[rgba(220,38,38,0.04)] border border-[rgba(220,38,38,0.15)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(220,38,38,0.15)] text-center">
            <h2 className="text-red-400 font-medium">Danger zone</h2>
            <p className="text-xs text-white/40 mt-0.5">
              Permanently delete your account and all of your data. This cannot be
              undone.
            </p>
          </div>
          <div className="px-6 py-4 flex justify-center">
            <button
              onClick={() => {
                setDeleteError("");
                setDeleteOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteOpen(false)}
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
                <h2 className="text-white font-medium">Delete your account?</h2>
                <p className="text-sm text-white/70 mt-1.5 leading-relaxed">
                  All notebooks, sources, collections, and data will be permanently
                  deleted. This cannot be undone.
                </p>
              </div>
            </div>

            <form onSubmit={handleDelete} className="px-5 pb-5 space-y-3">
              {deleteError && (
                <div className="rounded-lg bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] px-3.5 py-2.5 text-xs text-[#fca5a5]" role="alert">
                  {deleteError}
                </div>
              )}
              <label className="block text-xs text-white/70">
                Type <span className="text-red-400 font-mono">DELETE</span> to confirm
              </label>
              <input
                name="confirm"
                required
                autoFocus
                placeholder="DELETE"
                className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-red-400/40 transition-colors"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteBusy}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition-colors disabled:opacity-50"
                >
                  {deleteBusy ? "Deleting…" : "Delete Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.09] px-4 py-5">
      <div className="h-9 w-9 rounded-lg bg-[#63e]/12 flex items-center justify-center">
        <Icon size={16} className="text-[#a78bfa]" />
      </div>
      <div className="text-center min-w-0 w-full">
        <p className="text-[11px] text-white/45 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-white/80 mt-1 truncate">{value}</p>
      </div>
      {badge && (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#63e]/15 text-[#a78bfa] font-medium uppercase tracking-wide">
          {badge}
        </span>
      )}
    </div>
  );
}
