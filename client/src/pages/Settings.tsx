import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, LogOut, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { useLogout } from "@/hooks/useLogout";

interface OrganizationSummary {
  id: string;
  name: string;
  subdomain: string | null;
  createdAt: string;
}

interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string | null;
  createdAt: string;
}

interface SettingsOverview {
  organization: OrganizationSummary | null;
  primaryUser: UserSummary | null;
  totals: {
    users: number;
    audits: number;
    leads: number;
  };
}

export default function Settings() {
  const handleLogout = useLogout();

  const { data, isLoading } = useQuery<SettingsOverview>({
    queryKey: ["/api/settings/overview"],
  });

  const organization = data?.organization;
  const user = data?.primaryUser;

  const initials = useMemo(() => {
    if (!user?.fullName) return "AF";
    const parts = user.fullName.split(" ");
    const first = parts[0]?.charAt(0) ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";
    return `${first}${last}` || first || "AF";
  }, [user?.fullName]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-settings">
            Workspace Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review your organization details and manage your session
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-4 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-4 h-16 w-full" />
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <Card data-testid="card-organization" className="self-start">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  Organization Profile
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Keep your workspace information up to date.
                </p>
              </div>
              <Badge variant="outline" data-testid="badge-users-count">
                {data?.totals.users ?? 0} members
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Organization
                </p>
                <p
                  className="text-lg font-semibold"
                  data-testid="text-organization-name"
                >
                  {organization?.name ?? "Default Organization"}
                </p>
              </div>

              <div className="grid gap-3 text-sm">
                <div
                  className="flex items-center gap-3"
                  data-testid="text-subdomain"
                >
                  <span className="text-muted-foreground">Subdomain</span>
                  <span className="font-medium">
                    {organization?.subdomain || "Not configured"}
                  </span>
                </div>
                <div
                  className="flex items-center gap-3"
                  data-testid="text-created"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Created{" "}
                    {organization?.createdAt
                      ? format(new Date(organization.createdAt), "PPP")
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid gap-2 text-sm">
                <p className="text-xs uppercase text-muted-foreground">
                  Usage Overview
                </p>
                <div
                  className="flex justify-between"
                  data-testid="metric-audits"
                >
                  <span className="text-muted-foreground">Audits</span>
                  <span className="font-semibold">
                    {data?.totals.audits ?? 0}
                  </span>
                </div>
                <div
                  className="flex justify-between"
                  data-testid="metric-leads"
                >
                  <span className="text-muted-foreground">Leads</span>
                  <span className="font-semibold">
                    {data?.totals.leads ?? 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-user" className="self-start">
            <CardHeader className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold">
                  {user?.fullName ?? "Guest User"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {user?.role ?? "auditor"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span data-testid="text-email">
                  {user?.email ?? "guest@demo.com"}
                </span>
              </div>
              {user?.phone && (
                <div
                  className="flex items-center gap-2"
                  data-testid="text-phone"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div
                className="flex items-center gap-2 text-muted-foreground"
                data-testid="text-user-created"
              >
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {user?.createdAt
                    ? format(new Date(user.createdAt), "PPP")
                    : "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
