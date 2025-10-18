import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

//todo: remove mock functionality
const mockData = [
  { stage: "Open", count: 120 },
  { stage: "Contacted", count: 85 },
  { stage: "Qualified", count: 62 },
  { stage: "Proposal", count: 38 },
  { stage: "Converted", count: 24 },
];

export function LeadConversionChart() {
  return (
    <Card data-testid="chart-lead-conversion">
      <CardHeader>
        <CardTitle>Lead Conversion Funnel</CardTitle>
        <CardDescription>Lead progression through sales stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="stage"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--popover-border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
