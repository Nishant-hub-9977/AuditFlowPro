import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Download,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface AuditReports {
  auditsByStatus: { status: string; count: number }[];
  auditsByIndustry: { industryName: string; count: number }[];
  auditsByType: { auditTypeName: string; count: number }[];
  totalAudits: number;
}

interface LeadReports {
  leadsByStatus: { status: string; count: number }[];
  leadsByIndustry: { industryName: string; count: number }[];
  leadsByPriority: { priority: string; count: number }[];
  conversionRate: number;
  totalEstimatedValue: number;
  totalLeads: number;
}

export default function Reports() {
  const { data: auditReports, isLoading: auditLoading } =
    useQuery<AuditReports>({
      queryKey: ["/api/reports/audits"],
    });

  const { data: leadReports, isLoading: leadLoading } = useQuery<LeadReports>({
    queryKey: ["/api/reports/leads"],
  });

  const isLoading = auditLoading || leadLoading;

  const handleExportAudits = async () => {
    try {
      const response = await apiRequest(
        "GET",
        "/api/reports/audits/export/csv",
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-reports.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export audit reports:", error);
    }
  };

  const handleExportLeads = async () => {
    try {
      const response = await apiRequest("GET", "/api/reports/leads/export/csv");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lead-reports.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export lead reports:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-reports">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive metrics and insights for audits and leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAudits}
            data-testid="button-export-audits"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Audits
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLeads}
            data-testid="button-export-leads"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Leads
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading reports...
        </div>
      ) : (
        <>
          {/* Lead Metrics Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Lead Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card data-testid="card-total-leads">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Leads
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadReports?.totalLeads || 0}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-conversion-rate">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadReports?.conversionRate || 0}%
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-total-value">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Est. Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(leadReports?.totalEstimatedValue || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-total-audits">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Audits
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {auditReports?.totalAudits || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Row 1: Leads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="chart-leads-by-status">
              <CardHeader>
                <CardTitle>Leads by Status</CardTitle>
                <CardDescription>
                  Distribution of leads across different stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadReports?.leadsByStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="status"
                      tickFormatter={formatStatus}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatStatus}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="chart-leads-by-priority">
              <CardHeader>
                <CardTitle>Leads by Priority</CardTitle>
                <CardDescription>
                  Priority distribution of active leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadReports?.leadsByPriority || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ priority, percent }) =>
                        `${formatPriority(priority)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="priority"
                    >
                      {leadReports?.leadsByPriority?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      labelFormatter={formatPriority}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Audits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="chart-audits-by-status">
              <CardHeader>
                <CardTitle>Audits by Status</CardTitle>
                <CardDescription>
                  Current audit workflow distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={auditReports?.auditsByStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="status"
                      tickFormatter={formatStatus}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatStatus}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="chart-audits-by-type">
              <CardHeader>
                <CardTitle>Audits by Type</CardTitle>
                <CardDescription>
                  Distribution across audit types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={auditReports?.auditsByType || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ auditTypeName, percent }) =>
                        `${auditTypeName}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="auditTypeName"
                    >
                      {auditReports?.auditsByType?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 3: Industry Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="chart-leads-by-industry">
              <CardHeader>
                <CardTitle>Leads by Industry</CardTitle>
                <CardDescription>
                  Lead distribution across industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadReports?.leadsByIndustry || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="industryName"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="chart-audits-by-industry">
              <CardHeader>
                <CardTitle>Audits by Industry</CardTitle>
                <CardDescription>
                  Audit distribution across industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={auditReports?.auditsByIndustry || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="industryName"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS[3]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
