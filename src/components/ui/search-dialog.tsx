"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResultItem } from "@/lib/actions/search";
import {
  Search, BookOpen, FolderOpen, Star, Users, Trash2, Settings,
  Bell, HardDrive, Home, FileText, User, Loader2, CornerDownLeft,
} from "lucide-react";

const PAGES = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Notebooks", href: "/notebooks", icon: BookOpen },
  { label: "Collections", href: "/collections", icon: FolderOpen },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Shared", href: "/shared", icon: Users },
  { label: "Trash", href: "/trash", icon: Trash2 },
  { label: "Storage", href: "/storage", icon: HardDrive },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Account", href: "/settings", icon: User },
  { label: "Security", href: "/settings/security", icon: FileText },
  { label: "Preferences", href: "/settings/preferences", icon: Settings },
];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange, close]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      setActive(0);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await globalSearch(q);
        setResults(res);
        setActive(0);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES;
    return PAGES.filter((p) => p.label.toLowerCase().includes(q));
  }, [query]);

  const items = useMemo(() => {
    const list: { key: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; sublabel?: string; href: string; section: string }[] = [];

    if (filteredPages.length > 0) {
      for (const p of filteredPages) {
        list.push({
          key: `page-${p.href}-${p.label}`,
          icon: p.icon,
          label: p.label,
          sublabel: "Page",
          href: p.href,
          section: "Pages",
        });
      }
    }

    if (results.length > 0) {
      for (const r of results) {
        list.push({
          key: `${r.kind}-${r.id}`,
          icon: r.kind === "notebook" ? BookOpen : FolderOpen,
          label: r.title,
          sublabel: r.subtitle ?? undefined,
          href: r.href,
          section: r.kind === "notebook" ? "Notebooks" : "Collections",
        });
      }
    }

    return list;
  }, [filteredPages, results]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        const item = items[active];
        if (item) {
          e.preventDefault();
          close();
          router.push(item.href);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, active, items, close, router]);

  const hasQuery = query.trim().length > 0;
  const showEmpty = !loading && hasQuery && items.length === 0;
  const currentSection = items.length > 0 ? items[active]?.section : "";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center p-4 pt-[14vh] bg-black/30 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-white/[0.1] bg-white/[0.06] backdrop-blur-[40px] saturate-[1.2] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        style={{ animation: "fadeInZoom 150ms ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glossy top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.25] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/[0.08] to-transparent" />

        {/* Input */}
        <div className="relative flex items-center gap-3 px-4 h-14 border-b border-white/[0.08]">
          <Search size={17} className="text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notebooks, collections, pages..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            style={{ fontFamily: "Geist, sans-serif" }}
            spellCheck={false}
          />
          {loading ? (
            <Loader2 size={15} className="text-white/40 shrink-0 animate-spin" />
          ) : (
            <kbd className="text-[10px] text-white/40 bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-0.5 font-mono shrink-0">ESC</kbd>
          )}
        </div>

        {/* Results */}
        <div className="relative max-h-[42vh] overflow-y-auto sidebar-scroll py-2">
          {items.map((item, i) => (
            <div key={item.key}>
              {i === 0 || items[i - 1].section !== item.section ? (
                <p className="px-4 pt-2 pb-1.5 text-[10px] font-medium uppercase tracking-widest text-white/30">
                  {item.section}
                </p>
              ) : null}
              <button
                onClick={() => {
                  close();
                  router.push(item.href);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  active === i ? "bg-white/[0.08]" : "text-white/70"
                )}
              >
                <span
                  className={cn(
                    "h-7 w-7 shrink-0 flex items-center justify-center rounded-lg border",
                    active === i ? "border-white/[0.15] bg-white/[0.06] text-white" : "border-white/[0.08] text-white/55"
                  )}
                >
                  <item.icon size={14} strokeWidth={1.8} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] truncate" style={{ fontFamily: "Geist, sans-serif" }}>{item.label}</span>
                  {item.sublabel && (
                    <span className="block text-[11px] text-white/40 truncate">{item.sublabel}</span>
                  )}
                </span>
                {active === i && (
                  <CornerDownLeft size={13} className="text-white/35 shrink-0" />
                )}
              </button>
            </div>
          ))}

          {showEmpty && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-white/70" style={{ fontFamily: "Geist, sans-serif" }}>No results for &quot;{query.trim()}&quot;</p>
              <p className="text-xs text-white/40 mt-1">Try a different search term.</p>
            </div>
          )}

          {!hasQuery && !loading && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-white/50" style={{ fontFamily: "Geist, sans-serif" }}>Type to search your notebooks, collections and pages.</p>
              <p className="text-xs text-white/30 mt-1">Press <kbd className="text-[10px] bg-white/[0.06] border border-white/[0.1] rounded px-1 py-0.5 font-mono">⌘K</kbd> anytime</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-4 px-4 h-10 border-t border-white/[0.08] text-[10px] text-white/35">
          <span className="flex items-center gap-1">
            <kbd className="bg-white/[0.06] border border-white/[0.1] rounded px-1 py-0.5 font-mono">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white/[0.06] border border-white/[0.1] rounded px-1 py-0.5 font-mono">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white/[0.06] border border-white/[0.1] rounded px-1 py-0.5 font-mono">esc</kbd> close
          </span>
          {currentSection && (
            <span className="ml-auto" style={{ fontFamily: "Geist, sans-serif" }}>{currentSection}</span>
          )}
        </div>
      </div>
    </div>
  );
}
