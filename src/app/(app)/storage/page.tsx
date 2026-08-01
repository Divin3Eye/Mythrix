import { HardDrive, BookOpen, FileText, AlertTriangle, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";

const FREE_TIER = {
  notebooks: 5,
  sourcesPerNotebook: 25,
  totalStorage: 250 * 1024 * 1024,
  chatMessages: 100,
  artifactGenerations: 20,
};

export default async function StoragePage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const [{ count: notebookCount }, { data: usage }] = await Promise.all([
    supabase
      .from("notebooks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null),
    supabase
      .from("source_files")
      .select("size_bytes")
      .eq("user_id", userId),
  ]);

  const totalBytes = (usage ?? []).reduce((sum, f) => sum + Number(f.size_bytes || 0), 0);
  const usedPct = Math.min(100, (totalBytes / FREE_TIER.totalStorage) * 100);

  const quotas = [
    {
      icon: BookOpen,
      label: "Notebooks",
      used: notebookCount ?? 0,
      limit: FREE_TIER.notebooks,
    },
    {
      icon: FileText,
      label: "Sources per notebook",
      used: usage?.length ?? 0,
      limit: FREE_TIER.sourcesPerNotebook,
    },
    {
      icon: Database,
      label: "Chat messages / month",
      used: 0,
      limit: FREE_TIER.chatMessages,
    },
    {
      icon: Database,
      label: "Artifact generations / month",
      used: 0,
      limit: FREE_TIER.artifactGenerations,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Storage</h1>
        <p className="text-sm text-white/70 mt-1">
          Usage across your free-tier plan
        </p>
      </div>

      {/* Storage usage card */}
      <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center">
              <HardDrive size={18} className="text-white/60" />
            </div>
            <div>
              <h2 className="text-white font-medium">Storage used</h2>
              <p className="text-sm text-white/70 mt-0.5">
                {formatBytes(totalBytes)} of {formatBytes(FREE_TIER.totalStorage)}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-white/70">
            {usedPct.toFixed(1)}%
          </span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(usedPct, 1)}%`,
              background:
                usedPct > 90
                  ? "linear-gradient(90deg, #dc2626, #ef4444)"
                  : usedPct > 70
                    ? "linear-gradient(90deg, #d97706, #f59e0b)"
                    : "linear-gradient(90deg, #63e, #8b5cf6)",
            }}
          />
        </div>
        {usedPct > 90 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-400">
            <AlertTriangle size={14} />
            You are close to your storage limit. Delete unused sources to free up
            space.
          </div>
        )}
      </div>

      {/* Per-resource quotas */}
      <h2 className="text-white font-medium mb-4">Plan quotas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quotas.map((quota) => {
          const Icon = quota.icon;
          const pct = Math.min(100, (quota.used / quota.limit) * 100);
          return (
            <div
              key={quota.label}
              className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] p-5"
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} className="text-white/60" />
                <span className="text-sm text-white/70">{quota.label}</span>
              </div>
              <p className="text-2xl font-semibold text-white mt-3">
                {quota.used}
                <span className="text-sm font-normal text-white/60"> / {quota.limit}</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(pct, 0)}%`,
                    background: pct > 90 ? "#ef4444" : "#63e",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
