import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, PieChart, TrendingUp, FileSpreadsheet } from "lucide-react";

//todo: remove mock functionality
const reports = [
  {
    id: 1,
    title: "Audit Completion Report",
    description: "Summary of all completed audits with compliance scores",
    icon: FileText,
    lastRun: "2024-01-08",
  },
  {
    id: 2,
    title: "Lead Conversion Analytics",
    description: "Lead funnel and conversion rate analysis",
    icon: TrendingUp,
    lastRun: "2024-01-07",
  },
  {
    id: 3,
    title: "Industry-wise Distribution",
    description: "Audit distribution across different industries",
    icon: PieChart,
    lastRun: "2024-01-06",
  },
  {
    id: 4,
    title: "Auditor Performance",
    description: "Individual auditor metrics and KPIs",
    icon: BarChart3,
    lastRun: "2024-01-05",
  },
  {
    id: 5,
    title: "Compliance Status Report",
    description: "Overall compliance status and trends",
    icon: FileSpreadsheet,
    lastRun: "2024-01-04",
  },
  {
    id: 6,
    title: "Monthly Summary",
    description: "Monthly audit and lead summary report",
    icon: FileText,
    lastRun: "2024-01-01",
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-reports">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate and download comprehensive audit and lead reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} data-testid={`card-report-${report.id}`} className="hover-elevate">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle className="mt-4">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Last run: {report.lastRun}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" data-testid={`button-generate-${report.id}`}>
                  Generate
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-download-${report.id}`}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
