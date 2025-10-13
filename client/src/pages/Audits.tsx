import { memo, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Audit } from "@shared/schema";
import { format } from "date-fns";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateAuditDialog } from "@/components/CreateAuditDialog";
import { AuditDetailDialog } from "@/components/AuditDetailDialog";

const statusOptions: { label: string; value: string }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "review" },
  { label: "Approved", value: "approved" },
  { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" },
];

const formatStatus = (status: string) =>
  status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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
      return "destructive";
    default:
      return "outline";
  }
};

type AuditListProps = {
  audits: Audit[];
  onSelect: (audit: Audit) => void;
};

const AuditMobileList = memo(({ audits, onSelect }: AuditListProps) => (
  <div className="md:hidden space-y-3">
    {audits.map((audit) => (
      <Card
        key={audit.id}
        data-testid={`card-audit-${audit.id}`}
        className="hover-elevate"
      >
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p
                className="font-mono text-sm font-medium"
                data-testid={`text-audit-id-${audit.id}`}
              >
                {audit.auditNumber}
              </p>
              <p
                className="mt-1 text-lg font-semibold"
                data-testid={`text-customer-${audit.id}`}
              >
                {audit.customerName}
              </p>
            </div>
            <Badge
              variant={getStatusVariant(audit.status)}
              data-testid={`badge-status-${audit.id}`}
            >
              {formatStatus(audit.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Location</p>
              <p
                className="mt-0.5 font-medium"
                data-testid={`text-location-${audit.id}`}
              >
                {audit.siteLocation}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p
                className="mt-0.5 font-medium"
                data-testid={`text-date-${audit.id}`}
              >
                {format(new Date(audit.auditDate), "MMM dd, yyyy")}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Auditor</p>
              <p
                className="mt-0.5 font-medium"
                data-testid={`text-auditor-${audit.id}`}
              >
                {audit.auditorName}
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(audit)}
              data-testid={`button-view-${audit.id}`}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
));
AuditMobileList.displayName = "AuditMobileList";

const AuditTable = memo(({ audits, onSelect }: AuditListProps) => (
  <div className="hidden overflow-x-auto md:block" style={{ WebkitOverflowScrolling: "touch" }}>
    <div className="min-w-[900px] rounded-lg border">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(audit)}
                  data-testid={`button-view-${audit.id}`}
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
));
AuditTable.displayName = "AuditTable";

export default function Audits() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  const { data: audits = [], isLoading, isError } = useQuery<Audit[]>({
    queryKey: ["/api/audits"],
  });

  const filteredAudits = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return audits
      .filter((audit) =>
        statusFilter === "all" ? true : audit.status === statusFilter,
      )
      .filter((audit) => {
        if (!normalizedTerm) return true;
        return [
          audit.auditNumber,
          audit.customerName,
          audit.siteLocation,
          audit.auditorName,
        ]
          .filter(
            (value): value is string => typeof value === "string" && value.length > 0,
          )
          .some((value) => value.toLowerCase().includes(normalizedTerm));
      })
      .sort(
        (a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime(),
      );
  }, [audits, searchTerm, statusFilter]);

  const handleSelectAudit = useCallback((audit: Audit) => {
    setSelectedAudit(audit);
  }, []);

  const statusLabel = useMemo(
    () => statusOptions.find((option) => option.value === statusFilter)?.label ?? "All Statuses",
    [statusFilter],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-audits">
            Audit Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review active audits, monitor statuses, and assign follow-ups
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-audit">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Create Audit
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by audit number, customer, or location"
            className="pl-9"
            data-testid="input-search-audits"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="dropdown-status-filter">
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              {statusLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              {statusOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading audits…</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-destructive">Unable to load audits. Please try again.</p>
        </div>
      ) : filteredAudits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-audits">
          <p className="text-muted-foreground">No audits matched your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust the filters or create a new audit to get started
          </p>
        </div>
      ) : (
        <>
          <AuditMobileList audits={filteredAudits} onSelect={handleSelectAudit} />
          <AuditTable audits={filteredAudits} onSelect={handleSelectAudit} />
        </>
      )}

      <CreateAuditDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <AuditDetailDialog
        audit={selectedAudit}
        open={selectedAudit !== null}
        onOpenChange={(open) => !open && setSelectedAudit(null)}
      />
    </div>
  );
}
