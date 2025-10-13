import { StatCard } from "@/components/StatCard";
import { AuditStatusChart } from "@/components/AuditStatusChart";
import { LeadConversionChart } from "@/components/LeadConversionChart";
import { RecentActivityTable } from "@/components/RecentActivityTable";
import { useEffect } from "react";
import { ClipboardCheck, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DashboardStats {
  totalAudits: number;
  pendingAudits: number;
  completedAudits: number;
  totalLeads: number;
}

export default function Dashboard() {
  const { error: showErrorToast } = useToast();

  const {
    data: stats,
    isLoading,
    isError,
    error: statsError,
    refetch,
  } = useQuery<DashboardStats, Error>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard/stats");
      return (await res.json()) as DashboardStats;
    },
    retry: 1,
    retryDelay: 1500,
  });

  useEffect(() => {
    if (isError && statsError) {
      showErrorToast({
        title: "Unable to load dashboard",
        description: statsError.message || "Unexpected error",
      });
    }
  }, [isError, showErrorToast, statsError]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-dashboard">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your audit and lead overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Audits"
          value={isLoading ? "..." : stats?.totalAudits.toString() || "0"}
          icon={ClipboardCheck}
          trend={{ value: 12, isPositive: true }}
          description="Active audits this month"
        />
        <StatCard
          title="Pending Audits"
          value={isLoading ? "..." : stats?.pendingAudits.toString() || "0"}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: false }}
          description="Awaiting execution"
        />
        <StatCard
          title="Completed Audits"
          value={isLoading ? "..." : stats?.completedAudits.toString() || "0"}
          icon={CheckCircle2}
          trend={{ value: 8, isPositive: true }}
          description="This quarter"
        />
        <StatCard
          title="Leads Generated"
          value={isLoading ? "..." : stats?.totalLeads.toString() || "0"}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
          description="From audits"
        />
      </div>

      {isError ? (
        <div className="rounded-lg border border-dashed border-destructive/60 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">We couldn't load dashboard insights.</p>
          <p className="mt-1 text-sm text-destructive/80">Check your connection or try again.</p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Retry loading data
          </Button>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AuditStatusChart />
            <LeadConversionChart />
          </div>

          {/* Recent Activity */}
          <RecentActivityTable />
        </>
      )}
    </div>
  );
}
