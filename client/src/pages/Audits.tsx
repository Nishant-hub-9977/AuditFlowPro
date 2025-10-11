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
import { Card, CardContent } from "@/components/ui/card";

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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {mockAudits.map((audit) => (
          <Card key={audit.id} data-testid={`card-audit-${audit.id}`} className="hover-elevate">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium" data-testid={`text-audit-id-${audit.id}`}>{audit.id}</p>
                  <p className="text-lg font-semibold mt-1" data-testid={`text-customer-${audit.id}`}>{audit.customer}</p>
                </div>
                <Badge variant="outline" data-testid={`badge-status-${audit.id}`}>{audit.status}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Industry</p>
                  <p className="font-medium mt-0.5" data-testid={`text-industry-${audit.id}`}>{audit.industry}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium mt-0.5" data-testid={`text-type-${audit.id}`}>{audit.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium mt-0.5" data-testid={`text-date-${audit.id}`}>{audit.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Auditor</p>
                  <p className="font-medium mt-0.5" data-testid={`text-auditor-${audit.id}`}>{audit.auditor}</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-2 border-t">
                <Button variant="ghost" size="sm" data-testid={`button-view-${audit.id}`}>
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="rounded-lg border min-w-[800px]">
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
      </div>

      {/* Create Audit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle>Create New Audit</DialogTitle>
              <DialogDescription>
                Fill in the audit details through the multi-step wizard
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6">
            <AuditFormWizard />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
