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
import { CheckCircle, XCircle, Archive, Send } from "lucide-react";
import type { Audit } from "@shared/schema";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuditDetailDialogProps {
  audit: Audit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailDialog({
  audit,
  open,
  onOpenChange,
}: AuditDetailDialogProps) {
  const { toast } = useToast();

  const submitForReviewMutation = useMutation({
    mutationFn: (auditId: string) =>
      apiRequest("POST", `/api/audits/${auditId}/submit-for-review`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Success", description: "Audit submitted for review" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit audit",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (auditId: string) =>
      apiRequest("POST", `/api/audits/${auditId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Success", description: "Audit approved" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve audit",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (auditId: string) =>
      apiRequest("POST", `/api/audits/${auditId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({
        title: "Success",
        description: "Audit rejected and returned to draft",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject audit",
        variant: "destructive",
      });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (auditId: string) =>
      apiRequest("POST", `/api/audits/${auditId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Success", description: "Audit closed" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close audit",
        variant: "destructive",
      });
    },
  });

  if (!audit) return null;

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
      default:
        return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const canSubmitForReview = audit.status === "draft";
  const canApprove = audit.status === "review";
  const canReject = audit.status === "review";
  const canClose = audit.status === "approved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-audit-detail">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle data-testid="text-audit-detail-id">
                {audit.auditNumber}
              </DialogTitle>
              <DialogDescription data-testid="text-audit-detail-customer">
                {audit.customerName}
              </DialogDescription>
            </div>
            <Badge
              variant={getStatusVariant(audit.status)}
              data-testid="badge-audit-detail-status"
            >
              {formatStatus(audit.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Location
              </p>
              <p className="mt-1" data-testid="text-audit-detail-location">
                {audit.siteLocation}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="mt-1" data-testid="text-audit-detail-date">
                {format(new Date(audit.auditDate), "MMMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Auditor
              </p>
              <p className="mt-1" data-testid="text-audit-detail-auditor">
                {audit.auditorName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Industry ID
              </p>
              <p className="mt-1" data-testid="text-audit-detail-industry">
                {audit.industryId || "N/A"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Audit Type ID
              </p>
              <p className="mt-1" data-testid="text-audit-detail-audit-type">
                {audit.auditTypeId || "N/A"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {canSubmitForReview && (
              <Button
                variant="outline"
                onClick={() => submitForReviewMutation.mutate(audit.id)}
                disabled={submitForReviewMutation.isPending}
                data-testid="button-submit-for-review"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}
            {canApprove && (
              <Button
                variant="outline"
                onClick={() => approveMutation.mutate(audit.id)}
                disabled={approveMutation.isPending}
                data-testid="button-approve"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {canReject && (
              <Button
                variant="outline"
                onClick={() => rejectMutation.mutate(audit.id)}
                disabled={rejectMutation.isPending}
                data-testid="button-reject"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            {canClose && (
              <Button
                variant="outline"
                onClick={() => closeMutation.mutate(audit.id)}
                disabled={closeMutation.isPending}
                data-testid="button-close"
              >
                <Archive className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
