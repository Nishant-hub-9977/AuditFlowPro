import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { LeadKanban } from "@/components/LeadKanban";
import { CreateLeadDialog } from "@/components/CreateLeadDialog";
import { LeadDetailDialog } from "@/components/LeadDetailDialog";
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
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@shared/schema";

export default function Leads() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

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
        <div className="flex flex-wrap gap-2 justify-end">
          <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-lead">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Lead
          </Button>
          <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "table")}>
            <TabsList>
              <TabsTrigger value="kanban" data-testid="button-view-kanban">
                <LayoutGrid className="h-4 w-4 mr-2" aria-hidden="true" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="table" data-testid="button-view-table">
                <List className="h-4 w-4 mr-2" aria-hidden="true" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {view === "kanban" ? (
        <LeadKanban
          leads={leads}
          isLoading={isLoading}
          onLeadSelect={setSelectedLead}
          onCreateLead={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No leads found</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first lead to get started</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {leads.map((lead) => (
                  <Card key={lead.id} data-testid={`card-lead-${lead.id}`} className="hover-elevate">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-medium" data-testid={`text-lead-id-${lead.id}`}>{lead.leadNumber}</p>
                          <p className="text-lg font-semibold mt-1" data-testid={`text-company-${lead.id}`}>{lead.companyName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5" data-testid={`text-contact-${lead.id}`}>{lead.contactPerson}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant="outline" data-testid={`badge-status-${lead.id}`}>
                            {formatStatus(lead.status)}
                          </Badge>
                          <Badge variant={getPriorityVariant(lead.priority)} data-testid={`badge-priority-${lead.id}`}>
                            {formatPriority(lead.priority)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Value</p>
                          <p className="font-semibold mt-0.5" data-testid={`text-value-${lead.id}`}>
                            {formatCurrency(lead.estimatedValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium mt-0.5 truncate" data-testid={`text-email-${lead.id}`}>{lead.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2 border-t flex-wrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedLead(lead)}
                          data-testid={`button-view-${lead.id}`}
                        >
                          View Details
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
                        <TableHead>Lead ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                          <TableCell className="font-mono text-sm">{lead.leadNumber}</TableCell>
                          <TableCell>{lead.companyName}</TableCell>
                          <TableCell>{lead.contactPerson}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatStatus(lead.status)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(lead.priority)}>
                              {formatPriority(lead.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(lead.estimatedValue)}
                          </TableCell>
                          <TableCell>{lead.phone}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedLead(lead)}
                              data-testid={`button-view-${lead.id}`}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Create Lead Dialog */}
      <CreateLeadDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      
      {/* Lead Detail Dialog */}
      <LeadDetailDialog 
        lead={selectedLead} 
        open={selectedLead !== null} 
        onOpenChange={(open) => !open && setSelectedLead(null)} 
      />
    </div>
  );
}
