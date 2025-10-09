import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

//todo: remove mock functionality
const users = [
  { id: 1, name: "John Smith", email: "john@example.com", role: "Auditor", status: "Active" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", role: "Admin", status: "Active" },
  { id: 3, name: "Mike Davis", email: "mike@example.com", role: "Auditor", status: "Active" },
];

const customers = [
  { id: 1, name: "PharmaCorp Ltd", industry: "Pharma", audits: 12, status: "Active" },
  { id: 2, name: "ChemTech Industries", industry: "Chemical", audits: 8, status: "Active" },
  { id: 3, name: "BioMed Systems", industry: "Pharma", audits: 15, status: "Active" },
];

const industryTypes = [
  { id: 1, name: "Pharmaceutical", code: "PHARMA", audits: 45 },
  { id: 2, name: "Chemical", code: "CHEM", audits: 32 },
  { id: 3, name: "Manufacturing", code: "MFG", audits: 28 },
];

export default function MasterData() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-master-data">
          Master Data Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, customers, and system configurations
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">Customers</TabsTrigger>
          <TabsTrigger value="industry" data-testid="tab-industry">Industry Types</TabsTrigger>
          <TabsTrigger value="audit-types" data-testid="tab-audit-types">Audit Types</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
            <Button data-testid="button-add-user">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="rounded-lg border min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-user-${user.id}`}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-end">
            <Button data-testid="button-add-customer">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="rounded-lg border min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Total Audits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.industry}</TableCell>
                      <TableCell>{customer.audits}</TableCell>
                      <TableCell>
                        <Badge variant="default">{customer.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-customer-${customer.id}`}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="industry" className="space-y-4">
          <div className="flex justify-end">
            <Button data-testid="button-add-industry">
              <Plus className="h-4 w-4 mr-2" />
              Add Industry Type
            </Button>
          </div>
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="rounded-lg border min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Industry Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Total Audits</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {industryTypes.map((industry) => (
                    <TableRow key={industry.id} data-testid={`row-industry-${industry.id}`}>
                      <TableCell>{industry.name}</TableCell>
                      <TableCell className="font-mono">{industry.code}</TableCell>
                      <TableCell>{industry.audits}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-industry-${industry.id}`}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit-types" className="space-y-4">
          <div className="flex justify-end">
            <Button data-testid="button-add-audit-type">
              <Plus className="h-4 w-4 mr-2" />
              Add Audit Type
            </Button>
          </div>
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            Audit type configuration coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
