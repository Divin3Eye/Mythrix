"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User, ShieldCheck, SlidersHorizontal, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const settingsNav = [
  { label: "Account", href: "/settings", icon: User },
  { label: "Security", href: "/settings/security", icon: ShieldCheck },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "Preferences", href: "/settings/preferences", icon: SlidersHorizontal },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-white/70 mt-1">
          Manage your account, security, and preferences
        </p>
      </div>

      <div className="flex justify-center gap-1.5 mb-6 overflow-x-auto pb-1">
        {settingsNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/settings"
              ? pathname === "/settings"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm transition-colors whitespace-nowrap",
                isActive
                  ? "bg-white text-black font-medium"
                  : "text-white/75 hover:text-white hover:bg-surface-hover"
              )}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {children}

      {/* Sign Out */}
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150 mx-auto"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
