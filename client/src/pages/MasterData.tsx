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
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Industry, AuditType, User } from "@shared/schema";
import { format } from "date-fns";

export default function MasterData() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: industries = [], isLoading: industriesLoading } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
  });

  const { data: auditTypes = [], isLoading: auditTypesLoading } = useQuery<AuditType[]>({
    queryKey: ["/api/audit-types"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-master-data">
          Master Data Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, industry types, audit types, and system configurations
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
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

          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No users found</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first user to get started</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {users.map((user) => (
                  <Card key={user.id} data-testid={`card-user-${user.id}`} className="hover-elevate">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold" data-testid={`text-name-${user.id}`}>{user.fullName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5" data-testid={`text-email-${user.id}`}>{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant="outline" data-testid={`badge-role-${user.id}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-user-${user.id}`}>
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="rounded-lg border min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="font-mono text-sm">{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
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
            </>
          )}
        </TabsContent>

        <TabsContent value="industry" className="space-y-4">
          <div className="flex justify-end">
            <Button data-testid="button-add-industry">
              <Plus className="h-4 w-4 mr-2" />
              Add Industry Type
            </Button>
          </div>

          {industriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading industries...</p>
            </div>
          ) : industries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No industries found</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first industry to get started</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {industries.map((industry) => (
                  <Card key={industry.id} data-testid={`card-industry-${industry.id}`} className="hover-elevate">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold" data-testid={`text-name-${industry.id}`}>{industry.name}</p>
                          {industry.description && (
                            <p className="text-sm text-muted-foreground mt-0.5" data-testid={`text-description-${industry.id}`}>
                              {industry.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Added {format(new Date(industry.createdAt), "MMM dd, yyyy")}
                        </p>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-industry-${industry.id}`}>
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="rounded-lg border min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {industries.map((industry) => (
                        <TableRow key={industry.id} data-testid={`row-industry-${industry.id}`}>
                          <TableCell className="font-medium">{industry.name}</TableCell>
                          <TableCell className="text-muted-foreground">{industry.description || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(industry.createdAt), "MMM dd, yyyy")}
                          </TableCell>
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
            </>
          )}
        </TabsContent>

        <TabsContent value="audit-types" className="space-y-4">
          <div className="flex justify-end">
            <Button data-testid="button-add-audit-type">
              <Plus className="h-4 w-4 mr-2" />
              Add Audit Type
            </Button>
          </div>

          {auditTypesLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading audit types...</p>
            </div>
          ) : auditTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No audit types found</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first audit type to get started</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {auditTypes.map((auditType) => (
                  <Card key={auditType.id} data-testid={`card-audit-type-${auditType.id}`} className="hover-elevate">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold" data-testid={`text-name-${auditType.id}`}>{auditType.name}</p>
                          {auditType.description && (
                            <p className="text-sm text-muted-foreground mt-0.5" data-testid={`text-description-${auditType.id}`}>
                              {auditType.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Added {format(new Date(auditType.createdAt), "MMM dd, yyyy")}
                        </p>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-audit-type-${auditType.id}`}>
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="rounded-lg border min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditTypes.map((auditType) => (
                        <TableRow key={auditType.id} data-testid={`row-audit-type-${auditType.id}`}>
                          <TableCell className="font-medium">{auditType.name}</TableCell>
                          <TableCell className="text-muted-foreground">{auditType.description || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(auditType.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-audit-type-${auditType.id}`}>
                              Edit
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
