import { Calendar, Palette, BookOpen, Clock } from "lucide-react";
import { formatDate } from "@/lib/format";

interface NotebookInspectorProps {
  notebook: {
    id: string;
    title: string;
    description: string | null;
    color: string | null;
    created_at: string;
    updated_at: string;
  };
  sourceCount: number;
  totalBytes: number;
}

export function NotebookInspector({
  notebook,
  sourceCount,
  totalBytes,
}: NotebookInspectorProps) {
  const color = notebook.color || "#7c3aed";

  return (
    <div className="w-full space-y-4 sticky top-24">
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden">
        {/* Color bar */}
        <div className="h-1" style={{ background: color }} />

        <div className="p-4">
          <p className="text-[11px] text-white/35 uppercase tracking-wider mb-3" style={{ fontFamily: "Geist, sans-serif" }}>
            Details
          </p>

          <div className="space-y-3">
            <Row icon={BookOpen} label="Sources" value={`${sourceCount} items`} />
            <Row icon={Palette} label="Color" value={
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                <span className="font-mono text-[11px]">{color}</span>
              </div>
            } />
            <Row icon={Calendar} label="Created" value={formatDate(notebook.created_at)} />
            <Row icon={Clock} label="Updated" value={formatDate(notebook.updated_at)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={12} className="text-white/25" />
        <span className="text-[11px] text-white/35">{label}</span>
      </div>
      <span className="text-[12px] text-white/50">{value}</span>
    </div>
  );
}
