import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  Industry,
  AuditType,
  User,
  InsertUser,
  InsertIndustry,
  InsertAuditType,
  UserRole,
} from "@shared/schema";
import {
  insertUserSchema,
  insertIndustrySchema,
  insertAuditTypeSchema,
  userRoles,
} from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MasterData() {
  const { toast } = useToast();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [industryDialogOpen, setIndustryDialogOpen] = useState(false);
  const [auditTypeDialogOpen, setAuditTypeDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [editingAuditType, setEditingAuditType] = useState<AuditType | null>(
    null,
  );

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: industries = [], isLoading: industriesLoading } = useQuery<
    Industry[]
  >({
    queryKey: ["/api/industries"],
  });

  const { data: auditTypes = [], isLoading: auditTypesLoading } = useQuery<
    AuditType[]
  >({
    queryKey: ["/api/audit-types"],
  });

  // User form
  const userFormSchema = editingUser
    ? insertUserSchema
        .extend({ password: z.string().optional() })
        .omit({ tenantId: true })
    : insertUserSchema.omit({ tenantId: true });

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: editingUser
      ? {
          ...editingUser,
          password: undefined,
          role: editingUser.role as UserRole,
        }
      : {
          username: "",
          password: "",
          fullName: "",
          email: "",
          role: "auditor" as UserRole,
          isActive: true,
        },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User created successfully" });
      setUserDialogOpen(false);
      userForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InsertUser>;
    }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User updated successfully" });
      setUserDialogOpen(false);
      setEditingUser(null);
      userForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  // Industry form
  const industryForm = useForm<z.infer<typeof insertIndustrySchema>>({
    resolver: zodResolver(insertIndustrySchema.omit({ tenantId: true })),
    defaultValues: editingIndustry
      ? { ...editingIndustry, description: editingIndustry.description || "" }
      : {
          name: "",
          description: "",
        },
  });

  const createIndustryMutation = useMutation({
    mutationFn: async (data: InsertIndustry) => {
      const res = await apiRequest("POST", "/api/industries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/industries"] });
      toast({ title: "Industry created successfully" });
      setIndustryDialogOpen(false);
      industryForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create industry", variant: "destructive" });
    },
  });

  const updateIndustryMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InsertIndustry>;
    }) => {
      const res = await apiRequest("PUT", `/api/industries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/industries"] });
      toast({ title: "Industry updated successfully" });
      setIndustryDialogOpen(false);
      setEditingIndustry(null);
      industryForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update industry", variant: "destructive" });
    },
  });

  const deleteIndustryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/industries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/industries"] });
      toast({ title: "Industry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete industry", variant: "destructive" });
    },
  });

  // Audit Type form
  const auditTypeForm = useForm<z.infer<typeof insertAuditTypeSchema>>({
    resolver: zodResolver(insertAuditTypeSchema.omit({ tenantId: true })),
    defaultValues: editingAuditType
      ? { ...editingAuditType, description: editingAuditType.description || "" }
      : {
          name: "",
          description: "",
        },
  });

  const createAuditTypeMutation = useMutation({
    mutationFn: async (data: InsertAuditType) => {
      const res = await apiRequest("POST", "/api/audit-types", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-types"] });
      toast({ title: "Audit type created successfully" });
      setAuditTypeDialogOpen(false);
      auditTypeForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create audit type", variant: "destructive" });
    },
  });

  const updateAuditTypeMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InsertAuditType>;
    }) => {
      const res = await apiRequest("PUT", `/api/audit-types/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-types"] });
      toast({ title: "Audit type updated successfully" });
      setAuditTypeDialogOpen(false);
      setEditingAuditType(null);
      auditTypeForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update audit type", variant: "destructive" });
    },
  });

  const deleteAuditTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/audit-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-types"] });
      toast({ title: "Audit type deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete audit type", variant: "destructive" });
    },
  });

  const handleUserSubmit = (data: z.infer<typeof userFormSchema>) => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: data as Partial<InsertUser>,
      });
    } else {
      createUserMutation.mutate(data as InsertUser);
    }
  };

  const handleIndustrySubmit = (data: z.infer<typeof insertIndustrySchema>) => {
    if (editingIndustry) {
      updateIndustryMutation.mutate({
        id: editingIndustry.id,
        data: data as Partial<InsertIndustry>,
      });
    } else {
      createIndustryMutation.mutate(data as InsertIndustry);
    }
  };

  const handleAuditTypeSubmit = (
    data: z.infer<typeof insertAuditTypeSchema>,
  ) => {
    if (editingAuditType) {
      updateAuditTypeMutation.mutate({
        id: editingAuditType.id,
        data: data as Partial<InsertAuditType>,
      });
    } else {
      createAuditTypeMutation.mutate(data as InsertAuditType);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-semibold"
          data-testid="heading-master-data"
        >
          Master Data Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, industry types, audit types, and system configurations
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">
            Users
          </TabsTrigger>
          <TabsTrigger value="industry" data-testid="tab-industry">
            Industry Types
          </TabsTrigger>
          <TabsTrigger value="audit-types" data-testid="tab-audit-types">
            Audit Types
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
            <Button
              data-testid="button-add-user"
              onClick={() => {
                setEditingUser(null);
                userForm.reset({
                  username: "",
                  password: "",
                  fullName: "",
                  email: "",
                  role: "auditor" as UserRole,
                  isActive: true,
                });
                setUserDialogOpen(true);
              }}
            >
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
              <p className="text-sm text-muted-foreground mt-1">
                Add your first user to get started
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {users.map((user) => (
                  <Card
                    key={user.id}
                    data-testid={`card-user-${user.id}`}
                    className="hover-elevate"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-lg font-semibold"
                            data-testid={`text-name-${user.id}`}
                          >
                            {user.fullName}
                          </p>
                          <p
                            className="text-sm text-muted-foreground mt-0.5"
                            data-testid={`text-email-${user.id}`}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t gap-2">
                        <Badge
                          variant="outline"
                          data-testid={`badge-role-${user.id}`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-edit-user-${user.id}`}
                            onClick={() => {
                              setEditingUser(user);
                              userForm.reset({
                                ...user,
                                password: undefined,
                                role: user.role as UserRole,
                              });
                              setUserDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-delete-user-${user.id}`}
                            onClick={() => deleteUserMutation.mutate(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div
                className="hidden md:block overflow-x-auto"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
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
                        <TableRow
                          key={user.id}
                          data-testid={`row-user-${user.id}`}
                        >
                          <TableCell className="font-medium">
                            {user.fullName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-user-${user.id}`}
                                onClick={() => {
                                  setEditingUser(user);
                                  userForm.reset({
                                    ...user,
                                    password: undefined,
                                    role: user.role as UserRole,
                                  });
                                  setUserDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-delete-user-${user.id}`}
                                onClick={() =>
                                  deleteUserMutation.mutate(user.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* Industries Tab */}
        <TabsContent value="industry" className="space-y-4">
          <div className="flex justify-end">
            <Button
              data-testid="button-add-industry"
              onClick={() => {
                setEditingIndustry(null);
                industryForm.reset({ name: "", description: "" });
                setIndustryDialogOpen(true);
              }}
            >
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
              <p className="text-sm text-muted-foreground mt-1">
                Add your first industry to get started
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {industries.map((industry) => (
                  <Card
                    key={industry.id}
                    data-testid={`card-industry-${industry.id}`}
                    className="hover-elevate"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-lg font-semibold"
                            data-testid={`text-name-${industry.id}`}
                          >
                            {industry.name}
                          </p>
                          {industry.description && (
                            <p
                              className="text-sm text-muted-foreground mt-0.5"
                              data-testid={`text-description-${industry.id}`}
                            >
                              {industry.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t gap-2">
                        <p className="text-sm text-muted-foreground">
                          Added{" "}
                          {format(new Date(industry.createdAt), "MMM dd, yyyy")}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-edit-industry-${industry.id}`}
                            onClick={() => {
                              setEditingIndustry(industry);
                              industryForm.reset({
                                ...industry,
                                description: industry.description || "",
                              });
                              setIndustryDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-delete-industry-${industry.id}`}
                            onClick={() =>
                              deleteIndustryMutation.mutate(industry.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div
                className="hidden md:block overflow-x-auto"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
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
                        <TableRow
                          key={industry.id}
                          data-testid={`row-industry-${industry.id}`}
                        >
                          <TableCell className="font-medium">
                            {industry.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {industry.description || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(
                              new Date(industry.createdAt),
                              "MMM dd, yyyy",
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-industry-${industry.id}`}
                                onClick={() => {
                                  setEditingIndustry(industry);
                                  industryForm.reset({
                                    ...industry,
                                    description: industry.description || "",
                                  });
                                  setIndustryDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-delete-industry-${industry.id}`}
                                onClick={() =>
                                  deleteIndustryMutation.mutate(industry.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* Audit Types Tab */}
        <TabsContent value="audit-types" className="space-y-4">
          <div className="flex justify-end">
            <Button
              data-testid="button-add-audit-type"
              onClick={() => {
                setEditingAuditType(null);
                auditTypeForm.reset({ name: "", description: "" });
                setAuditTypeDialogOpen(true);
              }}
            >
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
              <p className="text-sm text-muted-foreground mt-1">
                Add your first audit type to get started
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {auditTypes.map((auditType) => (
                  <Card
                    key={auditType.id}
                    data-testid={`card-audit-type-${auditType.id}`}
                    className="hover-elevate"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-lg font-semibold"
                            data-testid={`text-name-${auditType.id}`}
                          >
                            {auditType.name}
                          </p>
                          {auditType.description && (
                            <p
                              className="text-sm text-muted-foreground mt-0.5"
                              data-testid={`text-description-${auditType.id}`}
                            >
                              {auditType.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t gap-2">
                        <p className="text-sm text-muted-foreground">
                          Added{" "}
                          {format(
                            new Date(auditType.createdAt),
                            "MMM dd, yyyy",
                          )}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-edit-audit-type-${auditType.id}`}
                            onClick={() => {
                              setEditingAuditType(auditType);
                              auditTypeForm.reset({
                                ...auditType,
                                description: auditType.description || "",
                              });
                              setAuditTypeDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-delete-audit-type-${auditType.id}`}
                            onClick={() =>
                              deleteAuditTypeMutation.mutate(auditType.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div
                className="hidden md:block overflow-x-auto"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
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
                        <TableRow
                          key={auditType.id}
                          data-testid={`row-audit-type-${auditType.id}`}
                        >
                          <TableCell className="font-medium">
                            {auditType.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {auditType.description || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(
                              new Date(auditType.createdAt),
                              "MMM dd, yyyy",
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-audit-type-${auditType.id}`}
                                onClick={() => {
                                  setEditingAuditType(auditType);
                                  auditTypeForm.reset({
                                    ...auditType,
                                    description: auditType.description || "",
                                  });
                                  setAuditTypeDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-delete-audit-type-${auditType.id}`}
                                onClick={() =>
                                  deleteAuditTypeMutation.mutate(auditType.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent data-testid="dialog-user-form">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user information below"
                : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form
              onSubmit={userForm.handleSubmit(handleUserSubmit)}
              className="space-y-4"
            >
              <FormField
                control={userForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-user-fullname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-user-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        data-testid="input-user-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {editingUser
                        ? "Password (leave blank to keep current)"
                        : "Password"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        data-testid="input-user-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-user-role">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="master_admin">
                          Master Admin
                        </SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="button-save-user"
                  disabled={
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                >
                  {editingUser ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Industry Dialog */}
      <Dialog open={industryDialogOpen} onOpenChange={setIndustryDialogOpen}>
        <DialogContent data-testid="dialog-industry-form">
          <DialogHeader>
            <DialogTitle>
              {editingIndustry ? "Edit Industry" : "Create New Industry"}
            </DialogTitle>
            <DialogDescription>
              {editingIndustry
                ? "Update industry information below"
                : "Add a new industry type"}
            </DialogDescription>
          </DialogHeader>
          <Form {...industryForm}>
            <form
              onSubmit={industryForm.handleSubmit(handleIndustrySubmit)}
              className="space-y-4"
            >
              <FormField
                control={industryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-industry-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={industryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        data-testid="input-industry-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIndustryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="button-save-industry"
                  disabled={
                    createIndustryMutation.isPending ||
                    updateIndustryMutation.isPending
                  }
                >
                  {editingIndustry ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Audit Type Dialog */}
      <Dialog open={auditTypeDialogOpen} onOpenChange={setAuditTypeDialogOpen}>
        <DialogContent data-testid="dialog-audit-type-form">
          <DialogHeader>
            <DialogTitle>
              {editingAuditType ? "Edit Audit Type" : "Create New Audit Type"}
            </DialogTitle>
            <DialogDescription>
              {editingAuditType
                ? "Update audit type information below"
                : "Add a new audit type"}
            </DialogDescription>
          </DialogHeader>
          <Form {...auditTypeForm}>
            <form
              onSubmit={auditTypeForm.handleSubmit(handleAuditTypeSubmit)}
              className="space-y-4"
            >
              <FormField
                control={auditTypeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-audit-type-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={auditTypeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        data-testid="input-audit-type-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAuditTypeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="button-save-audit-type"
                  disabled={
                    createAuditTypeMutation.isPending ||
                    updateAuditTypeMutation.isPending
                  }
                >
                  {editingAuditType ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
