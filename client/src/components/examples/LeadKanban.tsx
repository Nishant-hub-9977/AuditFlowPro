import type { Lead } from "@shared/schema";
import { LeadKanban } from "../LeadKanban";

const exampleLeads: Lead[] = [
  {
    id: "1",
    tenantId: "demo",
    leadNumber: "LEAD-001",
    auditId: null,
    companyName: "TechCorp Industries",
    contactPerson: "Jane Doe",
    email: "jane@techcorp.com",
    phone: "+1 111 222 3333",
    industryId: null,
    status: "new",
    priority: "high",
    estimatedValue: 45000,
    notes: null,
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    tenantId: "demo",
    leadNumber: "LEAD-002",
    auditId: null,
    companyName: "Global Pharma",
    contactPerson: "John Smith",
    email: "john@globalpharma.com",
    phone: "+1 444 555 6666",
    industryId: null,
    status: "qualified",
    priority: "medium",
    estimatedValue: 32000,
    notes: null,
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function LeadKanbanExample() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <LeadKanban leads={exampleLeads} />
    </div>
  );
}
