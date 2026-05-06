import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { HomePage } from "./pages/home";
import { SignInPage } from "./pages/sign-in";
import { SignUpPage } from "./pages/sign-up";
import { CreatePage } from "./pages/dashboard/create";
import { MySitesPage } from "./pages/dashboard/my-sites";
import { CreditsPage } from "./pages/dashboard/credits";
import { AccountPage } from "./pages/dashboard/account";
import NotFound from "@/pages/not-found";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoaded, user } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/sign-in" />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Routes() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />

      <Route path="/dashboard/create">
        <ProtectedRoute component={CreatePage} />
      </Route>
      <Route path="/dashboard/my-sites">
        <ProtectedRoute component={MySitesPage} />
      </Route>
      <Route path="/dashboard/credits">
        <ProtectedRoute component={CreditsPage} />
      </Route>
      <Route path="/dashboard/account">
        <ProtectedRoute component={AccountPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </QueryClientProvider>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
