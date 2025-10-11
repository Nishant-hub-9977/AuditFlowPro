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

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Completed: "default",
  "In Progress": "secondary",
  Open: "outline",
  Rejected: "destructive",
};

export function RecentActivityTable() {
  return (
    <Card data-testid="table-recent-activity">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="outline" size="sm" data-testid="button-view-all">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto px-6 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockActivities.map((activity) => (
                  <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                    <TableCell className="font-mono text-sm">{activity.id}</TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>{activity.customer}</TableCell>
                    <TableCell>{activity.industry}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[activity.status] || "outline"}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{activity.date}</TableCell>
                    <TableCell>{activity.auditor}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" data-testid={`button-view-${activity.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-edit-${activity.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
