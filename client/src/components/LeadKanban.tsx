import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, User } from "lucide-react";
import type { Lead } from "@shared/schema";
import { useMemo, type KeyboardEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type PriorityVariant = "default" | "secondary" | "destructive" | "outline";

const statusColumns: { id: string; title: string; emptyLabel: string }[] = [
  { id: "new", title: "New", emptyLabel: "No new leads" },
  { id: "qualified", title: "Qualified", emptyLabel: "No qualified leads" },
  {
    id: "in_progress",
    title: "In Progress",
    emptyLabel: "No in-progress leads",
  },
  { id: "converted", title: "Converted", emptyLabel: "No converted leads" },
  { id: "closed", title: "Closed", emptyLabel: "No closed leads" },
];

const priorityVariants: Record<Lead["priority"], PriorityVariant> = {
  low: "default",
  medium: "secondary",
  high: "outline",
  urgent: "destructive",
};

const formatCurrency = (value: number | null) => {
  if (value === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPriority = (priority: Lead["priority"]) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

interface LeadKanbanProps {
  leads: Lead[];
  isLoading?: boolean;
  onLeadSelect?: (lead: Lead) => void;
  onCreateLead?: () => void;
  onLeadView?: (lead: Lead) => void;
  onLeadEdit?: (lead: Lead) => void;
  onLeadAssign?: (lead: Lead) => void;
  onLeadConvert?: (lead: Lead) => void;
  onLeadClose?: (lead: Lead) => void;
}

export function LeadKanban({
  leads,
  isLoading,
  onLeadSelect,
  onCreateLead,
  onLeadView,
  onLeadEdit,
  onLeadAssign,
  onLeadConvert,
  onLeadClose,
}: LeadKanbanProps) {
  const groupedLeads = useMemo(() => {
    const columns = statusColumns.map((column) => ({
      ...column,
      leads: leads.filter((lead) => lead.status === column.id),
    }));

    const handledLeadIds = new Set<string>();
    columns.forEach((column) => {
      column.leads.forEach((lead) => handledLeadIds.add(lead.id));
    });

    const overflow = leads.filter((lead) => !handledLeadIds.has(lead.id));
    if (overflow.length > 0) {
      columns.push({
        id: "other",
        title: "Other",
        emptyLabel: "No uncategorized leads",
        leads: overflow,
      });
    }

    return columns;
  }, [leads]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-dashed">
            <CardHeader className="gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {groupedLeads.map((column) => (
        <div key={column.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-foreground/90">
              {column.title}
            </h3>
            <Badge variant="outline">{column.leads.length}</Badge>
          </div>
          <div className="space-y-2">
            {column.leads.map((lead) => {
              const handleCardKeyDown = (
                event: KeyboardEvent<HTMLDivElement>,
              ) => {
                if (
                  event.key === "Enter" ||
                  event.key === " " ||
                  event.key === "Spacebar" ||
                  event.key === "Space"
                ) {
                  event.preventDefault();
                  onLeadSelect?.(lead);
                }
              };

              return (
                <Card
                  key={lead.id}
                  className="hover-elevate cursor-pointer transition-shadow duration-150"
                  data-testid={`lead-card-${lead.id}`}
                  onClick={() => onLeadSelect?.(lead)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${lead.companyName} lead details`}
                  onKeyDown={handleCardKeyDown}
                >
                  <CardHeader className="flex flex-col gap-3 p-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold leading-tight">
                          {lead.companyName}
                        </p>
                        <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                          {lead.leadNumber}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            data-testid={`lead-actions-${lead.id}`}
                            onClick={(event) => event.stopPropagation()}
                            aria-label={`Lead actions for ${lead.companyName}`}
                            aria-haspopup="menu"
                          >
                            <MoreVertical
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onSelect={() => {
                              onLeadView?.(lead);
                              onLeadSelect?.(lead);
                            }}
                            data-testid={`action-view-${lead.id}`}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => onLeadEdit?.(lead)}
                            data-testid={`action-edit-${lead.id}`}
                          >
                            Edit Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => onLeadAssign?.(lead)}
                            data-testid={`action-assign-${lead.id}`}
                          >
                            Assign Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={
                              lead.status !== "in_progress" &&
                              lead.status !== "qualified"
                            }
                            onSelect={() => onLeadConvert?.(lead)}
                            data-testid={`action-convert-${lead.id}`}
                          >
                            Convert to Audit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={lead.status === "closed"}
                            onSelect={() => onLeadClose?.(lead)}
                            data-testid={`action-close-${lead.id}`}
                          >
                            Close Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" aria-hidden="true" />
                      <span className="truncate">{lead.contactPerson}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant={priorityVariants[lead.priority]}>
                        {formatPriority(lead.priority)}
                      </Badge>
                      <span className="text-sm font-semibold">
                        {formatCurrency(lead.estimatedValue ?? null)}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="truncate">{lead.email}</p>
                      {lead.phone && <p>{lead.phone}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {column.leads.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {column.emptyLabel}
                </p>
                {column.id === "new" && onCreateLead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={onCreateLead}
                    data-testid="button-kanban-create-lead"
                    aria-label="Create a new lead"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Create Lead
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
