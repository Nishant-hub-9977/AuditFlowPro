import type { ComponentType, SVGProps } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FolderOpen,
  BarChart3,
  Building2,
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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

interface NavItem {
  title: string;
  url: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Audits",
    url: "/audits",
    icon: ClipboardCheck,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Master Data",
    url: "/master-data",
    icon: FolderOpen,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Building2,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2
              className="h-5 w-5 text-primary-foreground"
              aria-hidden="true"
            />
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link
                      href={item.url}
                      aria-current={location === item.url ? "page" : undefined}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
