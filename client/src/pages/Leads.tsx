import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { LeadKanban } from "@/components/LeadKanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

//todo: remove mock functionality
const mockLeads = [
  {
    id: "LEAD-001",
    company: "TechCorp Industries",
    contact: "John Doe",
    status: "Open",
    priority: "High",
    value: "$45,000",
    source: "Audit",
  },
  {
    id: "LEAD-002",
    company: "Global Pharma",
    contact: "Jane Smith",
    status: "In Progress",
    priority: "Medium",
    value: "$32,000",
    source: "Direct",
  },
];

export default function Leads() {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-leads">
            Lead Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and convert leads from audits
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "table")}>
            <TabsList>
              <TabsTrigger value="kanban" data-testid="button-view-kanban">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="table" data-testid="button-view-table">
                <List className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button data-testid="button-create-lead">
            <Plus className="h-4 w-4 mr-2" />
            Create Lead
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <LeadKanban />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeads.map((lead) => (
                <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                  <TableCell className="font-mono text-sm">{lead.id}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.contact}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.priority}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{lead.value}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" data-testid={`button-view-${lead.id}`}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
