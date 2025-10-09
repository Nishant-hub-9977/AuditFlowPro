import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FolderOpen,
  Settings,
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

const enterpriseItems = [
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
    icon: Settings,
  },
];

const partnerItems = [
  {
    title: "Dashboard",
    url: "/partner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Audits",
    url: "/partner/audits",
    icon: ClipboardCheck,
  },
  {
    title: "My Leads",
    url: "/partner/leads",
    icon: Users,
  },
];

export function AppSidebar({ userRole = "enterprise" }: { userRole?: "enterprise" | "partner" }) {
  const [location] = useLocation();
  const items = userRole === "partner" ? partnerItems : enterpriseItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">SP121</p>
            <p className="text-xs text-muted-foreground">Audit Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
    </Sidebar>
  );
}
