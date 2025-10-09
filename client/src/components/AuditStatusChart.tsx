import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

//todo: remove mock functionality
const mockData = [
  { name: "Completed", value: 45, color: "hsl(var(--chart-2))" },
  { name: "In Progress", value: 32, color: "hsl(var(--chart-3))" },
  { name: "Planning", value: 18, color: "hsl(var(--chart-1))" },
  { name: "Pending", value: 15, color: "hsl(var(--chart-4))" },
];

export function AuditStatusChart() {
  return (
    <Card data-testid="chart-audit-status">
      <CardHeader>
        <CardTitle>Audit Status Distribution</CardTitle>
        <CardDescription>Current audit stages across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
