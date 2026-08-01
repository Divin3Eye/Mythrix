"use client";

import { useState, memo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SearchDialog } from "@/components/ui/search-dialog";
import {
  Home, BookOpen, FolderOpen, Star, Users,
  Trash2, Settings, Bell, HardDrive, Search,
  ChevronsLeft, ChevronsRight,
} from "lucide-react";

const mainNav = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Notebooks", icon: BookOpen, href: "/notebooks" },
  { label: "Collections", icon: FolderOpen, href: "/collections" },
  { label: "Favorites", icon: Star, href: "/favorites" },
  { label: "Shared", icon: Users, href: "/shared" },
  { label: "Trash", icon: Trash2, href: "/trash" },
];

const bottomNav = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Storage", icon: HardDrive, href: "/storage" },
];

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  logoSize?: number;
  userName?: string;
  userInitials?: string;
}

export const Sidebar = memo(function Sidebar({
  onCollapsedChange,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  logoSize = 32,
  userName = "User",
  userInitials = "U",
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleToggle = () => {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <aside
      className={cn(
        "fixed z-40 flex flex-col bg-sidebar overflow-hidden transition-all duration-300 ease-in-out max-lg:hidden sidebar-scroll",
        "border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
      style={{ top: "16px", left: "16px", bottom: "16px", borderRadius: "24px" }}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center h-12 shrink-0",
        collapsed ? "justify-center px-2" : "px-4"
      )}>
        <img
          src="/images/Logo_2.png"
          alt="Mythrix"
          width={logoSize}
          height={logoSize}
          className="object-contain shrink-0"
          style={{ borderRadius: "30%" }}
          draggable={false}
        />
        {!collapsed && (
          <span className="ml-2.5 font-semibold text-sm text-foreground tracking-tight">Mythrix</span>
        )}
      </div>

      {/* Search */}
      <div className={cn("shrink-0", collapsed ? "px-2 pb-2" : "px-3 pb-2")}>
        {collapsed ? (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-foreground hover:bg-white/[0.1] border border-white/[0.12] bg-white/[0.04] transition-colors mx-auto"
            aria-label="Search"
          >
            <Search size={15} />
          </button>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2.5 h-9 rounded-full text-white/70 text-xs hover:text-foreground hover:bg-white/[0.1] border border-white/[0.12] bg-white/[0.04] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-colors px-3"
          >
            <Search size={14} />
            <span>Search</span>
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 pb-3 sidebar-scroll">
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg text-[13px] transition-colors duration-150",
                  collapsed ? "justify-center h-9 w-full" : "h-8 px-2.5",
                  isActive
                    ? "bg-surface-hover text-foreground font-medium"
                    : "text-white/70 hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Icon size={17} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom nav */}
      <div className={cn("shrink-0", collapsed ? "px-2 pb-2" : "px-3 pb-2")}>
        <Separator className="mb-2" />
        <div className="space-y-0.5">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg text-[13px] text-white/70 hover:text-foreground hover:bg-surface-hover transition-colors",
                  collapsed ? "justify-center h-9 w-full" : "h-8 px-2.5"
                )}
              >
                <Icon size={17} strokeWidth={1.5} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={handleToggle}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center",
          "h-6 w-6 rounded-full bg-sidebar border border-border backdrop-blur-xl",
          "text-white/70 hover:text-foreground hover:bg-surface-hover",
          "transition-all duration-200 opacity-0 hover:opacity-100",
          "-right-3"
        )}
      >
        {collapsed ? <ChevronsRight size={11} /> : <ChevronsLeft size={11} />}
      </button>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </aside>
  );
});
