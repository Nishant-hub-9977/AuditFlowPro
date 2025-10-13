import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, PlayCircle, XCircle, TrendingUp } from "lucide-react";
import type { Lead } from "@shared/schema";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailDialog({ lead, open, onOpenChange }: LeadDetailDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const qualifyMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest("POST", `/api/leads/${leadId}/qualify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Success", description: "Lead qualified" });
      onOpenChange(false);
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
      onOpenChange(false);
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
      onOpenChange(false);
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
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to close lead", variant: "destructive" });
    },
  });

  if (!lead) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "converted":
        return "default";
      case "in_progress":
        return "secondary";
      case "qualified":
        return "outline";
      case "new":
        return "outline";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

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

  const canQualify = lead.status === 'new' && (user?.role === 'admin' || user?.role === 'master_admin');
  const canStartProgress = lead.status === 'qualified' && (user?.role === 'admin' || user?.role === 'master_admin');
  const canConvert = lead.status === 'in_progress' && (user?.role === 'admin' || user?.role === 'master_admin');
  const canClose = (lead.status !== 'converted' && lead.status !== 'closed') && (user?.role === 'admin' || user?.role === 'master_admin');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-lead-detail">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle data-testid="text-lead-detail-company">{lead.companyName}</DialogTitle>
              <DialogDescription data-testid="text-lead-detail-contact">
                {lead.contactPerson} • {lead.email}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={getStatusVariant(lead.status)} data-testid="badge-lead-detail-status">
                {formatStatus(lead.status)}
              </Badge>
              <Badge variant={getPriorityVariant(lead.priority)} data-testid="badge-lead-detail-priority">
                {formatPriority(lead.priority)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="mt-1" data-testid="text-lead-detail-phone">{lead.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Priority</p>
              <p className="mt-1" data-testid="text-lead-detail-priority-text">{formatPriority(lead.priority)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Value</p>
              <p className="mt-1" data-testid="text-lead-detail-value">{formatCurrency(lead.estimatedValue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="mt-1" data-testid="text-lead-detail-created">
                {format(new Date(lead.createdAt), "MMMM dd, yyyy")}
              </p>
            </div>
            {lead.notes && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm" data-testid="text-lead-detail-notes">{lead.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {canQualify && (
              <Button 
                variant="outline" 
                onClick={() => qualifyMutation.mutate(lead.id)}
                disabled={qualifyMutation.isPending}
                data-testid="button-qualify"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Qualify Lead
              </Button>
            )}
            {canStartProgress && (
              <Button 
                variant="outline" 
                onClick={() => startProgressMutation.mutate(lead.id)}
                disabled={startProgressMutation.isPending}
                data-testid="button-start-progress"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Progress
              </Button>
            )}
            {canConvert && (
              <Button 
                variant="outline" 
                onClick={() => convertMutation.mutate(lead.id)}
                disabled={convertMutation.isPending}
                data-testid="button-convert"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Convert
              </Button>
            )}
            {canClose && (
              <Button 
                variant="outline" 
                onClick={() => closeMutation.mutate(lead.id)}
                disabled={closeMutation.isPending}
                data-testid="button-close-lead"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
