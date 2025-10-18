import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { animate, remove } from "animejs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type AuditStatusRow = {
  status: string;
  count: number;
};

type AuditReportsResponse = {
  auditsByStatus: AuditStatusRow[];
  auditsByIndustry: { industryName: string | null; count: number }[];
  auditsByType: { auditTypeName: string | null; count: number }[];
  totalAudits: number;
};

const STATUS_COLOR_MAP: Record<string, string> = {
  completed: "hsl(var(--chart-2))",
  planning: "hsl(var(--chart-3))",
  draft: "hsl(var(--chart-4))",
  review: "hsl(var(--chart-1))",
  approved: "hsl(var(--chart-2))",
  closed: "hsl(var(--chart-4))",
  in_progress: "hsl(var(--chart-3))",
  pending: "hsl(var(--chart-1))",
};

const FALLBACK_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

function formatStatusLabel(status: string): string {
  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AuditStatusChart() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useQuery<AuditReportsResponse>({
    queryKey: ["/api/reports/audits"],
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const chartData = useMemo(() => {
    const entries = data?.auditsByStatus ?? [];
    return entries
      .filter((entry) => entry.count > 0)
      .map((entry, index) => {
        const baseColor =
          STATUS_COLOR_MAP[entry.status.toLowerCase()] ??
          FALLBACK_COLORS[index % FALLBACK_COLORS.length];
        return {
          name: formatStatusLabel(entry.status),
          value: entry.count,
          rawStatus: entry.status,
          color: baseColor,
        };
      });
  }, [data?.auditsByStatus]);

  useEffect(() => {
    if (!contentRef.current || isLoading || isError || chartData.length === 0) {
      return;
    }

    remove(contentRef.current);
    animate(contentRef.current, {
      keyframes: [
        { opacity: 0, translateY: 12 },
        { opacity: 1, translateY: 0 },
      ],
      duration: 600,
      ease: "easeOutQuad",
    });
  }, [chartData, isError, isLoading]);

  return (
    <Card data-testid="chart-audit-status">
      <CardHeader>
        <CardTitle>Audit Status Distribution</CardTitle>
        <CardDescription>
          Current audit stages across all projects
        </CardDescription>
      </CardHeader>
      <CardContent ref={contentRef}>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Unable to load audit distribution right now.
          </p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No audit activity yet. Create audits to see the distribution.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.rawStatus}
                    fill={entry.color}
                    stroke="var(--border)"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value} audit${value === 1 ? "" : "s"}`,
                  "Audits",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
