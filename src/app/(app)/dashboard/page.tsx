import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { formatBytes } from "@/lib/format";
import { BookOpen, FolderOpen, HardDrive, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, plan")
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
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";
  const plan = profile?.plan ?? "free";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const stats = [
    { icon: BookOpen, label: "Notebooks", value: notebookCount ?? 0 },
    { icon: FolderOpen, label: "Collections", value: collectionCount ?? 0 },
    { icon: HardDrive, label: "Storage", value: formatBytes(totalBytes) },
    { icon: FileText, label: "Sources", value: sourceFiles?.length ?? 0 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-white/90 tracking-tight">
          Welcome back, {displayName}
        </h1>
        <p className="text-[13px] text-white/40 mt-1">
          Here's an overview of your workspace.
        </p>
      </div>

      {/* Stats grid — glass cards */}
      <h2 className="text-[13px] font-medium text-white/50 mb-3 uppercase tracking-wider">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className="text-white/35" />
                <span className="text-[12px] text-white/45">{stat.label}</span>
              </div>
              <p className="text-[20px] font-semibold text-white/85">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <h2 className="text-[13px] font-medium text-white/50 mt-8 mb-3 uppercase tracking-wider">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="/notebooks"
          className="group rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
        >
          <BookOpen size={16} className="text-white/35 group-hover:text-white/60 transition-colors mb-2" />
          <p className="text-[13px] font-medium text-white/70 group-hover:text-white/85 transition-colors">View Notebooks</p>
          <p className="text-[11px] text-white/35 mt-0.5">{notebookCount ?? 0} total</p>
        </a>
        <a
          href="/collections"
          className="group rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
        >
          <FolderOpen size={16} className="text-white/35 group-hover:text-white/60 transition-colors mb-2" />
          <p className="text-[13px] font-medium text-white/70 group-hover:text-white/85 transition-colors">View Collections</p>
          <p className="text-[11px] text-white/35 mt-0.5">{collectionCount ?? 0} total</p>
        </a>
        <a
          href="/storage"
          className="group rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
        >
          <HardDrive size={16} className="text-white/35 group-hover:text-white/60 transition-colors mb-2" />
          <p className="text-[13px] font-medium text-white/70 group-hover:text-white/85 transition-colors">Storage Usage</p>
          <p className="text-[11px] text-white/35 mt-0.5">{formatBytes(totalBytes)} used</p>
        </a>
      </div>
    </div>
  );
}
