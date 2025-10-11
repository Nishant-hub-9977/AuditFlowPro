import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, CheckCircle, XCircle, Archive, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateAuditDialog } from "@/components/CreateAuditDialog";
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
import type { Audit } from "@shared/schema";
import { format } from "date-fns";
import { useAuth } from "@/lib/authContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Audits() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: audits = [], isLoading } = useQuery<Audit[]>({
    queryKey: ["/api/audits"],
  });

  const submitForReviewMutation = useMutation({
    mutationFn: (auditId: string) => apiRequest(`/api/audits/${auditId}/submit-for-review`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Success", description: "Audit submitted for review" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to submit audit", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (auditId: string) => apiRequest(`/api/audits/${auditId}/approve`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Success", description: "Audit approved" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to approve audit", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (auditId: string) => apiRequest(`/api/audits/${auditId}/reject`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Success", description: "Audit rejected and returned to draft" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reject audit", variant: "destructive" });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (auditId: string) => apiRequest(`/api/audits/${auditId}/close`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Success", description: "Audit closed" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to close audit", variant: "destructive" });
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "review":
        return "secondary";
      case "draft":
        return "outline";
      case "closed":
        return "outline";
      case "rejected":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const canSubmitForReview = (audit: Audit) => audit.status === 'draft';
  const canApprove = (audit: Audit) => user?.role === 'admin' && audit.status === 'review';
  const canReject = (audit: Audit) => user?.role === 'admin' && audit.status === 'review';
  const canClose = (audit: Audit) => user?.role === 'admin' && audit.status === 'approved';

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading audits...</p>
        </div>
      ) : audits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No audits found</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first audit to get started</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {audits.map((audit) => (
              <Card key={audit.id} data-testid={`card-audit-${audit.id}`} className="hover-elevate">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium" data-testid={`text-audit-id-${audit.id}`}>{audit.auditNumber}</p>
                      <p className="text-lg font-semibold mt-1" data-testid={`text-customer-${audit.id}`}>{audit.customerName}</p>
                    </div>
                    <Badge variant={getStatusVariant(audit.status)} data-testid={`badge-status-${audit.id}`}>
                      {formatStatus(audit.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium mt-0.5" data-testid={`text-location-${audit.id}`}>{audit.siteLocation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium mt-0.5" data-testid={`text-date-${audit.id}`}>
                        {format(new Date(audit.auditDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Auditor</p>
                      <p className="font-medium mt-0.5" data-testid={`text-auditor-${audit.id}`}>{audit.auditorName}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2 border-t flex-wrap">
                    {canSubmitForReview(audit) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => submitForReviewMutation.mutate(audit.id)}
                        disabled={submitForReviewMutation.isPending}
                        data-testid={`button-submit-review-${audit.id}`}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Submit for Review
                      </Button>
                    )}
                    {canApprove(audit) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => approveMutation.mutate(audit.id)}
                        disabled={approveMutation.isPending}
                        data-testid={`button-approve-${audit.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {canReject(audit) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => rejectMutation.mutate(audit.id)}
                        disabled={rejectMutation.isPending}
                        data-testid={`button-reject-${audit.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    {canClose(audit) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => closeMutation.mutate(audit.id)}
                        disabled={closeMutation.isPending}
                        data-testid={`button-close-${audit.id}`}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    )}
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
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Auditor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id} data-testid={`row-audit-${audit.id}`}>
                      <TableCell className="font-mono text-sm">{audit.auditNumber}</TableCell>
                      <TableCell>{audit.customerName}</TableCell>
                      <TableCell>{audit.siteLocation}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(audit.status)}>
                          {formatStatus(audit.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(audit.auditDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{audit.auditorName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canSubmitForReview(audit) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => submitForReviewMutation.mutate(audit.id)}
                              disabled={submitForReviewMutation.isPending}
                              data-testid={`button-submit-review-${audit.id}`}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Submit
                            </Button>
                          )}
                          {canApprove(audit) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => approveMutation.mutate(audit.id)}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${audit.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {canReject(audit) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => rejectMutation.mutate(audit.id)}
                              disabled={rejectMutation.isPending}
                              data-testid={`button-reject-${audit.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          )}
                          {canClose(audit) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => closeMutation.mutate(audit.id)}
                              disabled={closeMutation.isPending}
                              data-testid={`button-close-${audit.id}`}
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Close
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" data-testid={`button-view-${audit.id}`}>
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

      {/* Create Audit Dialog */}
      <CreateAuditDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
