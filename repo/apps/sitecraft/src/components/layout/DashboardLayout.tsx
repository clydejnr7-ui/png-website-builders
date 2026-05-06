import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Globe, Wand2, LayoutGrid, CreditCard, User as UserIcon, LogOut, Loader2 } from "lucide-react";
import { useGetCredits } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut, user } = useAuth();

  const { data: credits, isLoading: isLoadingCredits } = useGetCredits({
    query: { enabled: !!user },
  });

  const navItems = [
    { href: "/dashboard/create", label: "Create Site", icon: Wand2 },
    { href: "/dashboard/my-sites", label: "My Sites", icon: LayoutGrid },
    { href: "/dashboard/credits", label: "Credits", icon: CreditCard },
    { href: "/dashboard/account", label: "Account", icon: UserIcon },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-muted/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-white flex flex-col shadow-sm">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors">
            <Globe className="w-6 h-6 text-primary" />
            <span className="leading-tight">PNG Website Builders</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium
                    ${isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-blue-900/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border mt-auto space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-2">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Credit Balance</div>
            {isLoadingCredits ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <div className="text-3xl font-mono font-bold text-foreground">
                {credits?.creditsRemaining ?? 0}
                <span className="text-sm font-sans text-muted-foreground ml-1">credits</span>
              </div>
            )}
            <Link href="/dashboard/credits">
              <Button variant="outline" size="sm" className="w-full mt-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                Buy Credits
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto relative z-10 p-6 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
