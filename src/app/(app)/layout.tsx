import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNav } from "@/components/ui/topnav";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", user.id)
        .single()
    : { data: null };

  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(125%_125%_at_50%_10%,#16161e_45%,#6d28d9_140%)]">
      <OnboardingProvider>
        <Sidebar userName={displayName} userInitials={initials} />
        <TopNav userName={displayName} userEmail={displayEmail} userInitials={initials} />
        <main className="min-h-screen pt-20 max-lg:pt-0 lg:pl-[236px]">
          <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8 py-8">
            {children}
          </div>
        </main>
      </OnboardingProvider>
    </div>
  );
}
