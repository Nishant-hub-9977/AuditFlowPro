import { StatCard } from "@/components/StatCard";
import { AuditStatusChart } from "@/components/AuditStatusChart";
import { LeadConversionChart } from "@/components/LeadConversionChart";
import { RecentActivityTable } from "@/components/RecentActivityTable";
import { ClipboardCheck, Users, TrendingUp, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Audits"
          value="124"
          icon={ClipboardCheck}
          trend={{ value: 12, isPositive: true }}
          description="Active audits this month"
        />
        <StatCard
          title="Pending Audits"
          value="18"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: false }}
          description="Awaiting execution"
        />
        <StatCard
          title="Completed Audits"
          value="89"
          icon={CheckCircle2}
          trend={{ value: 8, isPositive: true }}
          description="This quarter"
        />
        <StatCard
          title="Leads Generated"
          value="47"
          icon={Users}
          trend={{ value: 15, isPositive: true }}
          description="From audits"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AuditStatusChart />
        <LeadConversionChart />
      </div>

      {/* Recent Activity */}
      <RecentActivityTable />
    </div>
  );
}
