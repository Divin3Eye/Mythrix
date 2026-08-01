"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNav } from "@/components/ui/topnav";
import { createClient } from "@/lib/supabase/client";

interface NotebookChromeProps {
  children: React.ReactNode;
  notebookId: string;
  userName?: string;
  userInitials?: string;
  userEmail?: string;
  fullWidth?: boolean;
}

export function NotebookChrome({
  children,
  notebookId,
  userName = "User",
  userInitials = "U",
  userEmail = "",
  fullWidth = false,
}: NotebookChromeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isChatPage = pathname.includes("/chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarHoverExpanded, setSidebarHoverExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isSidebarExpanded = !sidebarCollapsed || sidebarHoverExpanded;

  const handleSidebarMouseEnter = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setSidebarHoverExpanded(true);
  }, []);

  const handleSidebarMouseLeave = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      setSidebarHoverExpanded(false);
    }, 150);
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  const contentMargin = isSidebarExpanded ? "lg:ml-[252px]" : "lg:ml-[92px]";

  return (
    <div className="relative min-h-screen bg-[radial-gradient(125%_125%_at_50%_10%,#16161e_45%,#6d28d9_140%)]">
      {/* Sidebar with hover expand */}
      <div
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <Sidebar
          defaultCollapsed
          collapsed={sidebarCollapsed && !sidebarHoverExpanded}
          onCollapsedChange={(c) => {
            setSidebarCollapsed(c);
            setSidebarHoverExpanded(false);
          }}
          userName={userName}
          userInitials={userInitials}
        />
      </div>

      {/* TopNav with notebook tabs */}
      <TopNav
        notebookActive
        notebookId={notebookId}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
        onRefresh={() => router.refresh()}
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        onSignOut={handleSignOut}
      />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Content */}
      <main className={`min-h-screen pt-20 max-lg:pt-0 ${contentMargin} transition-all duration-300`}>
        <div className={`mx-auto w-full px-5 sm:px-8 ${isChatPage ? "pt-4 pb-4 h-[calc(100vh-5.5rem)]" : "py-8 max-w-[1100px]"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
