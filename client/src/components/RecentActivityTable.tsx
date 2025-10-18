import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";

//todo: remove mock functionality
const mockActivities = [
  {
    id: "AUD-2024-001",
    type: "Audit",
    customer: "PharmaCorp Ltd",
    industry: "Pharma",
    status: "Completed",
    date: "2024-01-08",
    auditor: "John Smith",
  },
  {
    id: "LEAD-2024-045",
    type: "Lead",
    customer: "ChemTech Industries",
    industry: "Chemical",
    status: "Open",
    date: "2024-01-07",
    auditor: "Sarah Johnson",
  },
  {
    id: "AUD-2024-002",
    type: "Audit",
    customer: "BioMed Systems",
    industry: "Pharma",
    status: "In Progress",
    date: "2024-01-06",
    auditor: "Mike Davis",
  },
];

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Completed: "default",
  "In Progress": "secondary",
  Open: "outline",
  Rejected: "destructive",
};

export function RecentActivityTable() {
  const hasActivity = mockActivities.length > 0;

  return (
    <Card data-testid="table-recent-activity">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Recent Activity
        </CardTitle>
        <Button variant="outline" size="sm" data-testid="button-view-all">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="overflow-x-auto px-6 pb-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="min-w-[800px]">
            <Table>
              <caption className="sr-only">
                Summary of recent audit and lead activity with actions to view
                or edit each record.
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">ID</TableHead>
                  <TableHead scope="col">Type</TableHead>
                  <TableHead scope="col">Customer</TableHead>
                  <TableHead scope="col">Industry</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Date</TableHead>
                  <TableHead scope="col">Auditor</TableHead>
                  <TableHead scope="col" className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasActivity ? (
                  mockActivities.map((activity) => (
                    <TableRow
                      key={activity.id}
                      data-testid={`row-activity-${activity.id}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {activity.id}
                      </TableCell>
                      <TableCell>{activity.type}</TableCell>
                      <TableCell>{activity.customer}</TableCell>
                      <TableCell>{activity.industry}</TableCell>
                      <TableCell>
                        <Badge
                          variant={statusColors[activity.status] || "outline"}
                        >
                          {activity.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {activity.date}
                      </TableCell>
                      <TableCell>{activity.auditor}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-view-${activity.id}`}
                            aria-label={`View ${activity.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-edit-${activity.id}`}
                            aria-label={`Edit ${activity.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      <div className="space-y-2">
                        <p className="font-medium text-foreground/90">
                          No activity yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Recent audits and leads will appear here once the team
                          starts working.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
