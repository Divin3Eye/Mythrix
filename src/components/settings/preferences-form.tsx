"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Monitor, Bell, PanelLeftClose, Search, Sparkles } from "lucide-react";
import { updatePreferences } from "@/lib/actions/profile";

interface Preferences {
  compactNav?: boolean;
  notificationsEnabled?: boolean;
  enableAnimations?: boolean;
  defaultView?: string;
}

export function PreferencesForm({ preferences }: { preferences: Preferences }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [compactNav, setCompactNav] = useState(preferences.compactNav ?? false);
  const [notifications, setNotifications] = useState(preferences.notificationsEnabled ?? true);
  const [animations, setAnimations] = useState(preferences.enableAnimations ?? true);
  const [defaultView, setDefaultView] = useState(preferences.defaultView ?? "grid");

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const formData = new FormData();
      if (compactNav) formData.set("compactNav", "on");
      if (notifications) formData.set("notificationsEnabled", "on");
      if (animations) formData.set("enableAnimations", "on");
      formData.set("defaultView", defaultView);
      await updatePreferences(formData);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Appearance */}
      <section className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.09] text-center">
          <h2 className="text-white font-medium flex items-center justify-center gap-2">
            <Monitor size={15} className="text-white/40" />
            Appearance
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Control how Mythrix looks and behaves for you.
          </p>
        </div>

        <div className="p-6 space-y-1">
          {error && (
            <div className="rounded-lg bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] px-3.5 py-2.5 text-xs text-[#fca5a5] mb-4" role="alert">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] px-3.5 py-2.5 text-xs text-[#86efac] flex items-center gap-2 mb-4">
              <Check size={13} />
              Preferences saved.
            </div>
          )}

          <ToggleRow
            icon={PanelLeftClose}
            label="Compact navigation"
            description="Show a smaller, collapsed sidebar."
            checked={compactNav}
            onChange={setCompactNav}
          />
          <ToggleRow
            icon={Sparkles}
            label="Animations"
            description="Enable transition animations and motion effects."
            checked={animations}
            onChange={setAnimations}
          />

          <div className="py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  <Search size={14} className="text-white/40" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Default notebook view</p>
                  <p className="text-xs text-white/55 mt-0.5">Choose how notebooks are displayed.</p>
                </div>
              </div>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
                className="h-9 rounded-lg bg-white/[0.04] border border-white/[0.12] px-3 text-sm text-white outline-none focus:border-white/[0.2] transition-colors cursor-pointer"
              >
                <option value="grid" className="bg-[#141416]">Grid</option>
                <option value="list" className="bg-[#141416]">List</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center pt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.09] text-center">
          <h2 className="text-white font-medium flex items-center justify-center gap-2">
            <Bell size={15} className="text-white/40" />
            Notifications
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Choose what alerts you receive.
          </p>
        </div>

        <div className="p-6 space-y-1">
          <ToggleRow
            icon={Bell}
            label="Processing alerts"
            description="Get notified when source processing completes."
            checked={notifications}
            onChange={setNotifications}
          />
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
          <Icon size={14} className="text-white/40" />
        </div>
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="text-xs text-white/55 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: checked ? "#63e" : "rgba(255,255,255,0.12)" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}
