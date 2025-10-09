import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuditFormWizard } from "@/components/AuditFormWizard";
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
const mockAudits = [
  {
    id: "AUD-2024-001",
    customer: "PharmaCorp Ltd",
    industry: "Pharma",
    type: "Fire Safety",
    status: "Completed",
    date: "2024-01-08",
    auditor: "John Smith",
  },
  {
    id: "AUD-2024-002",
    customer: "ChemTech Industries",
    industry: "Chemical",
    type: "Compliance",
    status: "In Progress",
    date: "2024-01-07",
    auditor: "Sarah Johnson",
  },
  {
    id: "AUD-2024-003",
    customer: "BioMed Systems",
    industry: "Pharma",
    type: "Electrical",
    status: "Planning",
    date: "2024-01-06",
    auditor: "Mike Davis",
  },
];

export default function Audits() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-audits">
            Audit Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan, execute, and manage all audits
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-audit">
          <Plus className="h-4 w-4 mr-2" />
          Create Audit
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audits..."
            className="pl-10"
            data-testid="input-search-audits"
          />
        </div>
        <Button variant="outline" data-testid="button-filter">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Audits Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Audit ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAudits.map((audit) => (
              <TableRow key={audit.id} data-testid={`row-audit-${audit.id}`}>
                <TableCell className="font-mono text-sm">{audit.id}</TableCell>
                <TableCell>{audit.customer}</TableCell>
                <TableCell>{audit.industry}</TableCell>
                <TableCell>{audit.type}</TableCell>
                <TableCell>
                  <Badge variant="outline">{audit.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{audit.date}</TableCell>
                <TableCell>{audit.auditor}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" data-testid={`button-view-${audit.id}`}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Audit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Audit</DialogTitle>
            <DialogDescription>
              Fill in the audit details through the multi-step wizard
            </DialogDescription>
          </DialogHeader>
          <AuditFormWizard />
        </DialogContent>
      </Dialog>
    </div>
  );
}
