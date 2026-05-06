import { useGetMe, useGetCredits } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

export function AccountPage() {
  const { data: profile, isLoading: isProfileLoading } = useGetMe();
  const { data: credits, isLoading: isCreditsLoading } = useGetCredits();
  const { user } = useAuth();

  if (isProfileLoading || isCreditsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account details and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-white border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <UserIcon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{profile?.email ?? user?.email}</h3>
                <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                  <Mail className="w-4 h-4" /> {profile?.email ?? user?.email}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Member since {profile?.createdAt ? format(new Date(profile.createdAt), "MMMM d, yyyy") : "Recently"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Usage Summary
            </CardTitle>
            <CardDescription>Your all-time activity on PNG Website Builders</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-sm text-muted-foreground mb-1 font-medium">Free Generations Used</div>
              <div className="text-3xl font-mono font-bold text-foreground">
                {credits?.freeGenerationsUsed ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1 font-medium">Remaining Credits</div>
              <div className="text-3xl font-mono font-bold text-primary">{credits?.creditsRemaining ?? 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
