import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { RoleGuard } from "@/components/RoleGuard";
import Dashboard from "@/pages/Dashboard";
import Audits from "@/pages/Audits";
import Leads from "@/pages/Leads";
import Reports from "@/pages/Reports";
import MasterData from "@/pages/MasterData";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Don't show sidebar/header for login/register pages
  if (location === "/login" || location === "/register") {
    return <>{children}</>;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between px-6 py-3 border-b border-border sticky top-0 bg-background z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function PrivateRoute({ component: Component, children }: { component?: React.ComponentType; children?: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return Component ? <Component /> : <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route path="/audits">
        <PrivateRoute>
          <RoleGuard allowedRoles={["auditor", "client", "admin", "master_admin"]}>
            <Audits />
          </RoleGuard>
        </PrivateRoute>
      </Route>
      <Route path="/leads">
        <PrivateRoute>
          <RoleGuard allowedRoles={["client", "admin", "master_admin"]}>
            <Leads />
          </RoleGuard>
        </PrivateRoute>
      </Route>
      <Route path="/reports">
        <PrivateRoute>
          <RoleGuard allowedRoles={["admin", "master_admin"]}>
            <Reports />
          </RoleGuard>
        </PrivateRoute>
      </Route>
      <Route path="/master-data">
        <PrivateRoute>
          <RoleGuard allowedRoles={["admin", "master_admin"]}>
            <MasterData />
          </RoleGuard>
        </PrivateRoute>
      </Route>
      <Route path="/settings">
        <PrivateRoute>
          <RoleGuard allowedRoles={["admin", "master_admin"]}>
            <MasterData />
          </RoleGuard>
        </PrivateRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppLayout>
            <Router />
          </AppLayout>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
