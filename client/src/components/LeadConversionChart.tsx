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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type LeadStatusRow = {
  status: string;
  count: number;
};

type LeadReportsResponse = {
  leadsByStatus: LeadStatusRow[];
  leadsByIndustry: { industryName: string | null; count: number }[];
  leadsByPriority: { priority: string; count: number }[];
  conversionRate: number;
  totalEstimatedValue: number;
  totalLeads: number;
};

const STATUS_ORDER = ["new", "qualified", "in_progress", "converted", "closed"];

const STATUS_LABEL_MAP: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  in_progress: "In Progress",
  converted: "Converted",
  closed: "Closed",
};

const BAR_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function LeadConversionChart() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useQuery<LeadReportsResponse>({
    queryKey: ["/api/reports/leads"],
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const chartData = useMemo(() => {
    const entries = data?.leadsByStatus ?? [];
    const sorted = [...entries].sort((a, b) => {
      const leftIndex = STATUS_ORDER.indexOf(a.status);
      const rightIndex = STATUS_ORDER.indexOf(b.status);
      const normalizedLeft =
        leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRight =
        rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
      return normalizedLeft - normalizedRight;
    });

    return sorted
      .filter((entry) => entry.count > 0)
      .map((entry, index) => ({
        stage:
          STATUS_LABEL_MAP[entry.status] ??
          entry.status
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()),
        count: entry.count,
        color: BAR_COLORS[index % BAR_COLORS.length],
        rawStatus: entry.status,
      }));
  }, [data?.leadsByStatus]);

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
    <Card data-testid="chart-lead-conversion">
      <CardHeader>
        <CardTitle>Lead Conversion Funnel</CardTitle>
        <CardDescription>Lead progression through sales stages</CardDescription>
      </CardHeader>
      <CardContent ref={contentRef}>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Unable to load lead conversion data right now.
          </p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Lead activity will appear here once leads start moving through the
            funnel.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="stage"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--popover-border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number) => [
                  `${value} lead${value === 1 ? "" : "s"}`,
                  "Leads",
                ]}
              />
              <Legend />
              <Bar dataKey="count" name="Leads">
                {chartData.map((entry) => (
                  <Cell key={entry.rawStatus} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
