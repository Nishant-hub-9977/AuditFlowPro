import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Unauthorized from "@/pages/errors/Unauthorized";
import Forbidden from "@/pages/errors/Forbidden";
import ServerError from "@/pages/errors/ServerError";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Audits = lazy(() => import("@/pages/Audits"));
const Leads = lazy(() => import("@/pages/Leads"));
const Reports = lazy(() => import("@/pages/Reports"));
const MasterData = lazy(() => import("@/pages/MasterData"));
const Settings = lazy(() => import("@/pages/Settings"));

function Router() {
  return (
    <Switch>
  <Route path="/" component={Dashboard} />
  <Route path="/audits" component={Audits} />
  <Route path="/leads" component={Leads} />
  <Route path="/reports" component={Reports} />
  <Route path="/master-data" component={MasterData} />
  <Route path="/settings" component={Settings} />
  <Route path="/login" component={Login} />
    <Route path="/401" component={Unauthorized} />
    <Route path="/403" component={Forbidden} />
    <Route path="/500" component={ServerError} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };
  const handleLogout = useLogout();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-3">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    data-testid="button-header-logout"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <OfflineBanner />
                <div className="flex-1 overflow-auto p-6">
                  <ErrorBoundary>
                    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
                      <Router />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
