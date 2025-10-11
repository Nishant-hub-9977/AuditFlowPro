import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, CheckCircle, PlayCircle, XCircle, TrendingUp } from "lucide-react";
import { LeadKanban } from "@/components/LeadKanban";
import { CreateLeadDialog } from "@/components/CreateLeadDialog";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Lead } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Leads() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const qualifyMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest("POST", `/api/leads/${leadId}/qualify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Success", description: "Lead qualified" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to qualify lead", variant: "destructive" });
    },
  });

  const startProgressMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest("POST", `/api/leads/${leadId}/start-progress`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Success", description: "Lead moved to in progress" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to start progress", variant: "destructive" });
    },
  });

  const convertMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest("POST", `/api/leads/${leadId}/convert`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Success", description: "Lead converted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to convert lead", variant: "destructive" });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest("POST", `/api/leads/${leadId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Success", description: "Lead closed" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to close lead", variant: "destructive" });
    },
  });

  const canQualify = (lead: Lead) => lead.status === 'new';
  const canStartProgress = (lead: Lead) => lead.status === 'qualified';
  const canConvert = (lead: Lead) => lead.status === 'in_progress';
  const canClose = (lead: Lead) => lead.status !== 'converted' && lead.status !== 'closed';

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
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-lead">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
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
                        {canQualify(lead) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => qualifyMutation.mutate(lead.id)}
                            disabled={qualifyMutation.isPending}
                            data-testid={`button-qualify-${lead.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Qualify
                          </Button>
                        )}
                        {canStartProgress(lead) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startProgressMutation.mutate(lead.id)}
                            disabled={startProgressMutation.isPending}
                            data-testid={`button-start-progress-${lead.id}`}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {canConvert(lead) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => convertMutation.mutate(lead.id)}
                            disabled={convertMutation.isPending}
                            data-testid={`button-convert-${lead.id}`}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Convert
                          </Button>
                        )}
                        {canClose(lead) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => closeMutation.mutate(lead.id)}
                            disabled={closeMutation.isPending}
                            data-testid={`button-close-${lead.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Close
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" data-testid={`button-view-${lead.id}`}>
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
                            <div className="flex justify-end gap-2">
                              {canQualify(lead) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => qualifyMutation.mutate(lead.id)}
                                  disabled={qualifyMutation.isPending}
                                  data-testid={`button-qualify-${lead.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Qualify
                                </Button>
                              )}
                              {canStartProgress(lead) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => startProgressMutation.mutate(lead.id)}
                                  disabled={startProgressMutation.isPending}
                                  data-testid={`button-start-progress-${lead.id}`}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                              {canConvert(lead) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => convertMutation.mutate(lead.id)}
                                  disabled={convertMutation.isPending}
                                  data-testid={`button-convert-${lead.id}`}
                                >
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  Convert
                                </Button>
                              )}
                              {canClose(lead) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => closeMutation.mutate(lead.id)}
                                  disabled={closeMutation.isPending}
                                  data-testid={`button-close-${lead.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Close
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" data-testid={`button-view-${lead.id}`}>
                                View
                              </Button>
                            </div>
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
    </div>
  );
}
