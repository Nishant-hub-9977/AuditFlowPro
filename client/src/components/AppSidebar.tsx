import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FolderOpen,
  Settings,
  BarChart3,
  Building2,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@shared/schema";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    allowedRoles: ["master_admin", "admin", "client", "auditor"],
  },
  {
    title: "Audits",
    url: "/audits",
    icon: ClipboardCheck,
    allowedRoles: ["master_admin", "admin", "client", "auditor"],
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
    allowedRoles: ["master_admin", "admin", "client"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    allowedRoles: ["master_admin", "admin"],
  },
  {
    title: "Master Data",
    url: "/master-data",
    icon: FolderOpen,
    allowedRoles: ["master_admin", "admin"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    allowedRoles: ["master_admin", "admin"],
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { logout, user } = useAuth();
  
  // Filter nav items based on user role
  const visibleItems = navItems.filter(item => 
    user && item.allowedRoles.includes(user.role as UserRole)
  );

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect to login even if API call fails
      setLocation("/login");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Audit Flow Pro</p>
            <p className="text-xs text-muted-foreground">Audit Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="space-y-2">
          {user && (
            <div className="px-2 py-1">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-1" data-testid="badge-user-role">
                {user.role === 'master_admin' ? 'Master Admin' : 
                 user.role === 'admin' ? 'Admin' :
                 user.role === 'client' ? 'Client' :
                 'Auditor'}
              </Badge>
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
