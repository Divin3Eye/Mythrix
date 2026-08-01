"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, FolderOpen, MessageSquare, PenLine, X, Menu,
  LogOut, Plus, Users, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";

const primaryTabs = [
  { label: "Sources", href: "/sources", icon: Database },
  { label: "Chat", href: "/chat", icon: MessageSquare },
];

const secondaryTabs = [
  { label: "Workspace", href: "/workspace", icon: FolderOpen },
  { label: "Draft", href: "/draft", icon: PenLine },
];

interface TopNavProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  notebookActive?: boolean;
  notebookId?: string;
  onRefresh?: () => void;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  onSignOut?: () => void;
}

export function TopNav({
  onMobileMenuToggle,
  isMobileMenuOpen,
  notebookActive = false,
  notebookId,
  userName = "User",
  userInitials = "U",
  onSignOut,
}: TopNavProps) {
  const pathname = usePathname();
  const { openNotebookOnboarding } = useOnboarding();

  const base = notebookId ? `/notebook/${notebookId}` : null;
  const showTabs = notebookActive || !!notebookId;
  const isHome = pathname === "/";

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={onMobileMenuToggle}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.3)] text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-colors"
        >
          {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <header className="fixed top-4 left-[calc(50%+118px)] -translate-x-1/2 z-50 hidden lg:flex items-center gap-0.5 px-4 py-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-150",
            isHome
              ? "bg-white/[0.1] text-white"
              : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
          )}
        >
          <Home size={14} strokeWidth={isHome ? 2 : 1.5} />
          <span className="text-[13px] font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
            Home
          </span>
        </Link>

        <Sep />

        {showTabs && base && (
          <>
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const active = pathname === `${base}${tab.href}`;
              return (
                <Link
                  key={tab.label}
                  href={`${base}${tab.href}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
                    active
                      ? "bg-white/[0.1] text-white"
                      : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                  )}
                >
                  <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                  <span className="text-[13px] font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}

            <Sep />

            {secondaryTabs.map((tab) => {
              const Icon = tab.icon;
              const active = pathname.startsWith(`${base}${tab.href}`);
              return (
                <Link
                  key={tab.label}
                  href={`${base}${tab.href}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
                    active
                      ? "bg-white/[0.1] text-white"
                      : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                  )}
                >
                  <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                  <span className="text-[13px] font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}

            <Sep />
          </>
        )}

        {!showTabs && (
          <>
            <button
              onClick={(e) => openNotebookOnboarding(e.currentTarget.getBoundingClientRect())}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 transition-all duration-150 active:scale-[0.97]"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              <Plus size={14} strokeWidth={2.5} />
              New Notebook
            </button>
            <Sep />
          </>
        )}

        <Link
          href="/community"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-150",
            pathname === "/community"
              ? "bg-white/[0.1] text-white"
              : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
          )}
        >
          <Users size={14} strokeWidth={pathname === "/community" ? 2 : 1.5} />
          <span className="text-[13px] font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
            Community
          </span>
        </Link>

        <Sep />

        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-7 w-7 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-[11px] font-medium text-white/50">
            {userInitials}
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="flex items-center justify-center h-7 w-7 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150"
          title="Sign Out"
        >
          <LogOut size={14} />
        </button>
      </header>
    </>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-white/[0.08] mx-0.5" />;
}
