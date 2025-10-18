import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit } from "lucide-react";

type ActivityType = "Audit" | "Lead";

type ActivityItem = {
  id: string;
  reference: string;
  type: ActivityType;
  customer: string;
  industry: string | null;
  status: string;
  date: string;
  owner: string | null;
};

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  review: "secondary",
  approved: "default",
  closed: "default",
  closing: "default",
  closed_audit: "default",
  completed: "default",
  pending: "outline",
  open: "outline",
  new: "outline",
  qualified: "secondary",
  in_progress: "secondary",
  converted: "default",
  closed_lead: "destructive",
  rejected: "destructive",
};

function formatStatus(status: string): string {
  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function RecentActivityTable() {
  const { data, isLoading, isError } = useQuery<ActivityItem[]>({
    queryKey: ["/api/dashboard/activity"],
  });

  const activity = useMemo(() => data ?? [], [data]);
  const hasActivity = activity.length > 0;

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
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`activity-skeleton-${index}`}>
                      <TableCell colSpan={8} className="py-6">
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      <div className="space-y-2">
                        <p className="font-medium text-destructive">
                          Unable to load activity right now
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Please refresh the page or try again later.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : hasActivity ? (
                  activity.map((item) => (
                    <TableRow
                      key={`${item.type}-${item.id}`}
                      data-testid={`row-activity-${item.reference}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.reference}
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell>{item.industry ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            statusColors[item.status.toLowerCase()] ||
                            (item.status.toLowerCase().includes("close")
                              ? "default"
                              : "outline")
                          }
                        >
                          {formatStatus(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell>{item.owner ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-view-${item.reference}`}
                            aria-label={`View ${item.reference}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-edit-${item.reference}`}
                            aria-label={`Edit ${item.reference}`}
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
