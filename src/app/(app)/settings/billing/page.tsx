import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { formatBytes } from "@/lib/format";
import { CreditCard, Lock, Sparkles, BookOpen, FolderOpen, HardDrive, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, created_at")
    .eq("id", userId)
    .single();

  const [{ count: notebookCount }, { count: collectionCount }, { data: sourceFiles }] = await Promise.all([
    supabase
      .from("notebooks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null),
    supabase
      .from("collections")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null),
    supabase
      .from("source_files")
      .select("size_bytes")
      .eq("user_id", userId),
  ]);

  const totalBytes = (sourceFiles ?? []).reduce((sum, f) => sum + Number(f.size_bytes || 0), 0);
  const sourceCount = sourceFiles?.length ?? 0;
  const plan = profile?.plan ?? "free";

  const limits = {
    free: { notebooks: 5, collections: 10, storage: 500 * 1024 * 1024 },
    pro: { notebooks: Infinity, collections: Infinity, storage: 10 * 1024 * 1024 * 1024 },
  };

  const planLimits = limits[plan as keyof typeof limits] ?? limits.free;
  const notebookPercent = planLimits.notebooks === Infinity ? 0 : Math.min(((notebookCount ?? 0) / planLimits.notebooks) * 100, 100);
  const collectionPercent = planLimits.collections === Infinity ? 0 : Math.min(((collectionCount ?? 0) / planLimits.collections) * 100, 100);
  const storagePercent = planLimits.storage === Infinity ? 0 : Math.min((totalBytes / planLimits.storage) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.09] flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
              Current Plan
            </h2>
            <p className="text-xs text-white/40 mt-0.5">Usage and limits for your account</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-400 capitalize">{plan} Plan</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Notebooks */}
          <UsageRow
            icon={BookOpen}
            label="Notebooks"
            value={notebookCount ?? 0}
            limit={planLimits.notebooks}
            percent={notebookPercent}
            format={(v) => String(v)}
          />

          {/* Collections */}
          <UsageRow
            icon={FolderOpen}
            label="Collections"
            value={collectionCount ?? 0}
            limit={planLimits.collections}
            percent={collectionPercent}
            format={(v) => String(v)}
          />

          {/* Storage */}
          <UsageRow
            icon={HardDrive}
            label="Storage"
            value={totalBytes}
            limit={planLimits.storage}
            percent={storagePercent}
            format={formatBytes}
          />

          {/* Sources */}
          <UsageRow
            icon={FileText}
            label="Source Files"
            value={sourceCount}
            limit={Infinity}
            percent={0}
            format={(v) => String(v)}
          />
        </div>
      </div>

      {/* Upgrade */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-700/5 border border-violet-500/20 overflow-hidden">
        <div className="px-6 py-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
            <CreditCard size={20} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white/90" style={{ fontFamily: "Geist, sans-serif" }}>
              Upgrade to Pro
            </h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              Unlimited notebooks, collections, and 10GB storage. Priority support and early access to new features.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-white/[0.04]">
                <p className="text-lg font-bold text-white/80">&infin;</p>
                <p className="text-[10px] text-white/40 mt-0.5">Notebooks</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/[0.04]">
                <p className="text-lg font-bold text-white/80">&infin;</p>
                <p className="text-[10px] text-white/40 mt-0.5">Collections</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/[0.04]">
                <p className="text-lg font-bold text-white/80">10 GB</p>
                <p className="text-[10px] text-white/40 mt-0.5">Storage</p>
              </div>
            </div>
            <button
              disabled
              className="mt-4 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.09]">
          <h2 className="text-white font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
            Payment Method
          </h2>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] border-dashed">
            <Lock size={16} className="text-white/30" />
            <p className="text-xs text-white/40">No payment method added yet</p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] border border-white/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.09]">
          <h2 className="text-white font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
            Billing History
          </h2>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-xs text-white/40">No billing history available</p>
        </div>
      </div>
    </div>
  );
}

function UsageRow({
  icon: Icon,
  label,
  value,
  limit,
  percent,
  format,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  limit: number;
  percent: number;
  format: (v: number) => string;
}) {
  const isUnlimited = limit === Infinity;
  const isNearLimit = percent > 80;
  const isAtLimit = percent >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon size={15} className="text-white/35" />
          <span className="text-sm text-white/70">{label}</span>
        </div>
        <span className="text-sm text-white/50">
          {format(value)}
          {!isUnlimited && (
            <span className="text-white/30"> / {format(limit)}</span>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percent, 100)}%`,
              background: isAtLimit ? "#ef4444" : isNearLimit ? "#f59e0b" : "#7c3aed",
            }}
          />
        </div>
      )}
    </div>
  );
}
