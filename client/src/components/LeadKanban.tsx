import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, User } from "lucide-react";

//todo: remove mock functionality
const columns = [
  {
    id: "open",
    title: "Open",
    leads: [
      {
        id: "LEAD-001",
        company: "TechCorp Industries",
        contact: "John Doe",
        priority: "High",
        value: "$45,000",
      },
      {
        id: "LEAD-002",
        company: "Global Pharma",
        contact: "Jane Smith",
        priority: "Medium",
        value: "$32,000",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    leads: [
      {
        id: "LEAD-003",
        company: "ChemSafe Ltd",
        contact: "Mike Johnson",
        priority: "High",
        value: "$58,000",
      },
    ],
  },
  {
    id: "converted",
    title: "Converted",
    leads: [
      {
        id: "LEAD-004",
        company: "BioMed Corp",
        contact: "Sarah Williams",
        priority: "High",
        value: "$75,000",
      },
    ],
  },
  {
    id: "rejected",
    title: "Rejected",
    leads: [],
  },
];

const priorityColors: Record<string, "default" | "secondary" | "destructive"> = {
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};

export function LeadKanban() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="outline">{column.leads.length}</Badge>
          </div>
          <div className="space-y-2">
            {column.leads.map((lead) => (
              <Card
                key={lead.id}
                className="hover-elevate cursor-pointer"
                data-testid={`lead-card-${lead.id}`}
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{lead.company}</p>
                      <p className="text-xs font-mono text-muted-foreground">{lead.id}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{lead.contact}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={priorityColors[lead.priority]}>{lead.priority}</Badge>
                    <span className="font-semibold text-sm">{lead.value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {column.leads.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
                <p className="text-sm text-muted-foreground">No leads</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
