"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, Check, Globe, Lock, Eye } from "lucide-react";
import { changePassword } from "@/lib/actions/profile";

export function SecurityForm({ email }: { email: string | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await changePassword(new FormData(e.currentTarget));
      setSaved(true);
      router.refresh();
      e.currentTarget.reset();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Password */}
      <section className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.09] text-center">
          <h2 className="text-white font-medium flex items-center justify-center gap-2">
            <KeyRound size={15} className="text-white/40" />
            Password
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            {email ? `Signed in as ${email}` : "Update your password"}
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] px-3.5 py-2.5 text-xs text-[#fca5a5]" role="alert">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] px-3.5 py-2.5 text-xs text-[#86efac] flex items-center gap-2">
              <Check size={13} />
              Password updated.
            </div>
          )}

          <div>
            <label className="block text-center text-xs text-white/70 mb-1.5">
              Current password
            </label>
            <div className="relative">
              <input
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 pr-10 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-center text-xs text-white/70 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 pr-10 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-center text-xs text-white/70 mb-1.5">
                Confirm new password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/[0.2] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-center pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      {/* Security Status */}
      <section className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.09] text-center">
          <h2 className="text-white font-medium flex items-center justify-center gap-2">
            <ShieldCheck size={15} className="text-white/40" />
            Security Status
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <StatusRow
            icon={Lock}
            label="HttpOnly, Secure cookies"
            description="Session tokens are protected from XSS attacks"
            status="good"
          />
          <StatusRow
            icon={Globe}
            label="Data isolation"
            description="Your data is isolated per account via RLS policies"
            status="good"
          />
          <StatusRow
            icon={ShieldCheck}
            label="Row Level Security"
            description="All database tables enforce user-level access control"
            status="good"
          />
        </div>
      </section>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  description,
  status,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  status: "good" | "warning" | "bad";
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">{label}</p>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
      <Check size={14} className="text-emerald-400 shrink-0 mt-1" />
    </div>
  );
}

function EyeOff({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
