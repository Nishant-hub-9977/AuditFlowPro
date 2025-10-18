import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Industry, AuditType } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const auditFormSchema = z.object({
  auditNumber: z.string().min(1, "Audit number is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  siteLocation: z.string().min(1, "Site location is required"),
  industryId: z.string().optional(),
  auditTypeId: z.string().optional(),
  auditorName: z.string().min(1, "Auditor name is required"),
  auditDate: z.string().min(1, "Audit date is required"),
  geoLocation: z.string().optional(),
});

type AuditFormData = z.infer<typeof auditFormSchema>;

interface CreateAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAuditDialog({
  open,
  onOpenChange,
}: CreateAuditDialogProps) {
  const { toast } = useToast();

  const { data: industries = [] } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
  });

  const { data: auditTypes = [] } = useQuery<AuditType[]>({
    queryKey: ["/api/audit-types"],
  });

  const form = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      auditNumber: `AUD-${Date.now()}`,
      customerId: "",
      customerName: "",
      siteLocation: "",
      industryId: "",
      auditTypeId: "",
      auditorName: "",
      auditDate: new Date().toISOString().split("T")[0],
      geoLocation: "",
    },
  });

  const createAuditMutation = useMutation({
    mutationFn: async (data: AuditFormData) => {
      // Convert auditDate string to ISO timestamp
      const auditPayload = {
        ...data,
        auditDate: new Date(data.auditDate).toISOString(),
        auditorId: null,
        industryId: data.industryId || null,
        auditTypeId: data.auditTypeId || null,
      };
      const res = await apiRequest("POST", "/api/audits", auditPayload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/audits"] });
      toast({
        title: "Success",
        description: "Audit created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Audit creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create audit",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AuditFormData) => {
    createAuditMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-create-audit"
      >
        <DialogHeader>
          <DialogTitle>Create New Audit</DialogTitle>
          <DialogDescription>Enter the audit details below</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="auditNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Number</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-audit-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="auditDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        data-testid="input-audit-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter customer name"
                      data-testid="input-customer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter customer ID"
                      data-testid="input-customer-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter site location"
                      data-testid="input-site-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auditorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auditor Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter auditor name"
                      data-testid="input-auditor-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-industry">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.id} value={industry.id}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auditTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-audit-type">
                          <SelectValue placeholder="Select audit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {auditTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="geoLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geo-Location (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter geo-location coordinates or address"
                      data-testid="input-geo-location"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-audit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAuditMutation.isPending}
                data-testid="button-submit-audit"
              >
                {createAuditMutation.isPending ? "Creating..." : "Create Audit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
