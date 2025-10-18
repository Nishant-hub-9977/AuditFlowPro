import express from "express";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction,
} from "express";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  insertUserSchema,
  insertAuditSchema,
  insertLeadSchema,
  insertIndustrySchema,
  insertAuditTypeSchema,
  insertChecklistSchema,
  insertChecklistItemSchema,
  insertAuditChecklistResponseSchema,
  insertObservationSchema,
  insertBusinessIntelligenceSchema,
  insertFileSchema,
  insertFollowUpActionSchema,
  tenants,
} from "../shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  type AuthRequest,
  hashPassword,
} from "./auth";
import { storage } from "./storage";

const apiRouter = express.Router();

// Default tenant ID for no-auth mode
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

function getTenantFromLocals(res: ExpressResponse): string {
  return (res.locals.tenantId as string) ?? DEFAULT_TENANT_ID;
}

function getUserRoleFromLocals(res: ExpressResponse): string {
  return (res.locals.userRole as string) ?? "auditor";
}

function getUserIdFromLocals(res: ExpressResponse): string | null {
  const value = res.locals.userId as string | null | undefined;
  return value ?? null;
}

// CSV escaping utility
function escapeCSVField(field: string | number): string {
  if (typeof field === "number") {
    return field.toString();
  }

  const stringField = String(field);

  // Check if field needs escaping (contains comma, quote, or newline)
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n")
  ) {
    // Escape double quotes by doubling them and wrap in quotes
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

apiRouter.use(
  (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    if (!req.path.startsWith("/api") || req.path.startsWith("/api/auth")) {
      return next();
    }

    return authenticateToken(req as AuthRequest, res, () => {
      const authReq = req as AuthRequest;
      res.locals.tenantId = authReq.user?.tenantId ?? DEFAULT_TENANT_ID;
      res.locals.userRole = authReq.user?.role ?? "auditor";
      res.locals.userId = authReq.user?.userId ?? null;
      next();
    });
  },
);

// Dashboard Stats
apiRouter.get(
  "/dashboard/stats",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const stats = await storage.getDashboardStats(tenantId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  },
);

apiRouter.get(
  "/settings/overview",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);

      const [tenant] = await db
        .select({
          id: tenants.id,
          name: tenants.name,
          subdomain: tenants.subdomain,
          createdAt: tenants.createdAt,
        })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      const users = await storage.getAllUsers(tenantId);
      const stats = await storage.getDashboardStats(tenantId);

      const sortedUsers = [...users].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      const primaryUser = sortedUsers[0]
        ? {
            id: sortedUsers[0].id,
            fullName: sortedUsers[0].fullName,
            email: sortedUsers[0].email,
            role: sortedUsers[0].role,
            phone: null,
            createdAt: sortedUsers[0].createdAt.toISOString(),
          }
        : null;

      res.json({
        organization: tenant
          ? {
              ...tenant,
              createdAt:
                tenant.createdAt instanceof Date
                  ? tenant.createdAt.toISOString()
                  : tenant.createdAt,
            }
          : null,
        primaryUser,
        totals: {
          users: users.length,
          audits: stats.totalAudits,
          leads: stats.totalLeads,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings overview" });
    }
  },
);

// Reports
apiRouter.get(
  "/reports/audits",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const reports = await storage.getAuditReports(tenantId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit reports" });
    }
  },
);

apiRouter.get(
  "/reports/leads",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const reports = await storage.getLeadReports(tenantId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead reports" });
    }
  },
);

// CSV Export Endpoints
apiRouter.get(
  "/reports/audits/export/csv",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const reports = await storage.getAuditReports(tenantId);

      // Generate CSV for audits by status
      let csv = "Audit Reports Export\n\n";
      csv += "Audits by Status\n";
      csv += "Status,Count\n";
      reports.auditsByStatus.forEach((row) => {
        csv += `${escapeCSVField(row.status)},${escapeCSVField(row.count)}\n`;
      });

      csv += "\nAudits by Industry\n";
      csv += "Industry,Count\n";
      reports.auditsByIndustry.forEach((row) => {
        csv += `${escapeCSVField(row.industryName)},${escapeCSVField(row.count)}\n`;
      });

      csv += "\nAudits by Type\n";
      csv += "Audit Type,Count\n";
      reports.auditsByType.forEach((row) => {
        csv += `${escapeCSVField(row.auditTypeName)},${escapeCSVField(row.count)}\n`;
      });

      csv += `\nTotal Audits,${escapeCSVField(reports.totalAudits)}\n`;

      res.set("Content-Type", "text/csv");
      res.set("Content-Disposition", "attachment; filename=audit-reports.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export audit reports" });
    }
  },
);

apiRouter.get(
  "/reports/leads/export/csv",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const reports = await storage.getLeadReports(tenantId);

      // Generate CSV for leads
      let csv = "Lead Reports Export\n\n";
      csv += "Leads by Status\n";
      csv += "Status,Count\n";
      reports.leadsByStatus.forEach((row) => {
        csv += `${escapeCSVField(row.status)},${escapeCSVField(row.count)}\n`;
      });

      csv += "\nLeads by Industry\n";
      csv += "Industry,Count\n";
      reports.leadsByIndustry.forEach((row) => {
        csv += `${escapeCSVField(row.industryName)},${escapeCSVField(row.count)}\n`;
      });

      csv += "\nLeads by Priority\n";
      csv += "Priority,Count\n";
      reports.leadsByPriority.forEach((row) => {
        csv += `${escapeCSVField(row.priority)},${escapeCSVField(row.count)}\n`;
      });

      csv += "\nSummary Metrics\n";
      csv += "Metric,Value\n";
      csv += `${escapeCSVField("Total Leads")},${escapeCSVField(reports.totalLeads)}\n`;
      csv += `${escapeCSVField("Conversion Rate")},${escapeCSVField(reports.conversionRate + "%")}\n`;
      csv += `${escapeCSVField("Total Estimated Value")},${escapeCSVField("$" + reports.totalEstimatedValue)}\n`;

      res.set("Content-Type", "text/csv");
      res.set("Content-Disposition", "attachment; filename=lead-reports.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export lead reports" });
    }
  },
);

// Users
apiRouter.get(
  "/users",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const users = await storage.getAllUsers(tenantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  },
);

apiRouter.get(
  "/users/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const user = await storage.getUser(req.params.id, tenantId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  },
);

apiRouter.post(
  "/users",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(validated.password);
      const user = await storage.createUser({
        ...validated,
        password: hashedPassword,
        tenantId,
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/users/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertUserSchema.partial().parse(req.body);
      const updateData = { ...validated };

      // Hash password if it's being updated
      if (validated.password) {
        updateData.password = await hashPassword(validated.password);
      }

      const user = await storage.updateUser(
        req.params.id,
        tenantId,
        updateData,
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/users/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const deleted = await storage.deleteUser(req.params.id, tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  },
);

// Industries
apiRouter.get(
  "/industries",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const industries = await storage.getAllIndustries(tenantId);
      res.json(industries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch industries" });
    }
  },
);

apiRouter.get(
  "/industries/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const industry = await storage.getIndustry(req.params.id, tenantId);
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.json(industry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch industry" });
    }
  },
);

apiRouter.post(
  "/industries",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertIndustrySchema.parse(req.body);
      const industry = await storage.createIndustry({
        ...validated,
        tenantId,
      });
      res.status(201).json(industry);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/industries/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertIndustrySchema.partial().parse(req.body);
      const industry = await storage.updateIndustry(
        req.params.id,
        tenantId,
        validated,
      );
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.json(industry);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/industries/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const deleted = await storage.deleteIndustry(req.params.id, tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete industry" });
    }
  },
);

// Audit Types
apiRouter.get(
  "/audit-types",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const auditTypes = await storage.getAllAuditTypes(tenantId);
      res.json(auditTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit types" });
    }
  },
);

apiRouter.get(
  "/audit-types/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const auditType = await storage.getAuditType(req.params.id, tenantId);
      if (!auditType) {
        return res.status(404).json({ message: "Audit type not found" });
      }
      res.json(auditType);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit type" });
    }
  },
);

apiRouter.post(
  "/audit-types",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertAuditTypeSchema.parse(req.body);
      const auditType = await storage.createAuditType({
        ...validated,
        tenantId,
      });
      res.status(201).json(auditType);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/audit-types/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertAuditTypeSchema.partial().parse(req.body);
      const auditType = await storage.updateAuditType(
        req.params.id,
        tenantId,
        validated,
      );
      if (!auditType) {
        return res.status(404).json({ message: "Audit type not found" });
      }
      res.json(auditType);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/audit-types/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const deleted = await storage.deleteAuditType(req.params.id, tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "Audit type not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audit type" });
    }
  },
);

// Checklists
apiRouter.get(
  "/checklists",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const { auditTypeId } = req.query;
      const checklists = auditTypeId
        ? await storage.getChecklistsByAuditType(auditTypeId as string)
        : await storage.getAllChecklists();
      res.json(checklists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklists" });
    }
  },
);

apiRouter.get(
  "/checklists/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const checklist = await storage.getChecklist(req.params.id);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklist" });
    }
  },
);

apiRouter.post(
  "/checklists",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertChecklistSchema.parse(req.body);
      const checklist = await storage.createChecklist({
        ...validated,
        tenantId: DEFAULT_TENANT_ID,
      });
      res.status(201).json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/checklists/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertChecklistSchema.partial().parse(req.body);
      const checklist = await storage.updateChecklist(req.params.id, validated);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/checklists/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const deleted = await storage.deleteChecklist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete checklist" });
    }
  },
);

// Checklist Items
apiRouter.get(
  "/checklist-items",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const { checklistId } = req.query;
      if (!checklistId) {
        return res.status(400).json({ message: "checklistId is required" });
      }
      const items = await storage.getChecklistItemsByChecklist(
        checklistId as string,
      );
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklist items" });
    }
  },
);

apiRouter.get(
  "/checklist-items/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const item = await storage.getChecklistItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklist item" });
    }
  },
);

apiRouter.post(
  "/checklist-items",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertChecklistItemSchema.parse(req.body);
      const item = await storage.createChecklistItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/checklist-items/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertChecklistItemSchema.partial().parse(req.body);
      const item = await storage.updateChecklistItem(req.params.id, validated);
      if (!item) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/checklist-items/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const deleted = await storage.deleteChecklistItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete checklist item" });
    }
  },
);

// Audits
apiRouter.get("/audits", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const tenantId = getTenantFromLocals(res);
    const { status, auditorId } = req.query;
    let audits;
    if (status) {
      audits = await storage.getAuditsByStatus(status as string, tenantId);
    } else if (auditorId) {
      audits = await storage.getAuditsByAuditor(auditorId as string, tenantId);
    } else {
      audits = await storage.getAllAudits(tenantId);
    }
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audits" });
  }
});

apiRouter.get(
  "/audits/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const audit = await storage.getAudit(req.params.id, tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit" });
    }
  },
);

apiRouter.post(
  "/audits",
  authorizeRoles("master_admin", "admin", "auditor"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      // Convert auditDate from ISO string to Date object before parsing
      const dataToValidate = {
        ...req.body,
        auditDate: req.body.auditDate
          ? new Date(req.body.auditDate)
          : undefined,
      };
      const validated = insertAuditSchema.parse(dataToValidate);
      const audit = await storage.createAudit({
        ...validated,
        tenantId,
      });
      res.status(201).json(audit);
    } catch (error: any) {
      console.error("Audit creation validation error:", error);
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  },
);

apiRouter.put(
  "/audits/:id",
  authorizeRoles("master_admin", "admin", "auditor"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertAuditSchema.partial().parse(req.body);
      const audit = await storage.updateAudit(
        req.params.id,
        tenantId,
        validated,
      );
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/audits/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const deleted = await storage.deleteAudit(req.params.id, tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audit" });
    }
  },
);

// Audit Workflow Transitions
apiRouter.post(
  "/audits/:id/submit-for-review",
  authorizeRoles("auditor", "admin", "master_admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const audit = await storage.submitAuditForReview(req.params.id, tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res
        .status(400)
        .json({
          message: error.message || "Failed to submit audit for review",
        });
    }
  },
);

apiRouter.post(
  "/audits/:id/approve",
  authorizeRoles("admin", "master_admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const audit = await storage.approveAudit(req.params.id, tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to approve audit" });
    }
  },
);

apiRouter.post(
  "/audits/:id/reject",
  authorizeRoles("admin", "master_admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const audit = await storage.rejectAudit(req.params.id, tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to reject audit" });
    }
  },
);

apiRouter.post(
  "/audits/:id/close",
  authorizeRoles("admin", "master_admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const audit = await storage.closeAudit(req.params.id, tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to close audit" });
    }
  },
);

// Audit Checklist Responses
apiRouter.get(
  "/audit-checklist-responses",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const { auditId } = req.query;
      if (!auditId) {
        return res.status(400).json({ message: "auditId is required" });
      }
      const responses = await storage.getResponsesByAudit(auditId as string);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  },
);

apiRouter.post(
  "/audit-checklist-responses",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertAuditChecklistResponseSchema.parse(req.body);
      const response = await storage.createAuditChecklistResponse(validated);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/audit-checklist-responses/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertAuditChecklistResponseSchema
        .partial()
        .parse(req.body);
      const response = await storage.updateAuditChecklistResponse(
        req.params.id,
        validated,
      );
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/audit-checklist-responses/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const deleted = await storage.deleteAuditChecklistResponse(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Response not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete response" });
    }
  },
);

// Observations
apiRouter.get(
  "/observations",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const { auditId } = req.query;
      if (!auditId) {
        return res.status(400).json({ message: "auditId is required" });
      }
      const observations = await storage.getObservationsByAudit(
        auditId as string,
      );
      res.json(observations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch observations" });
    }
  },
);

apiRouter.post(
  "/observations",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertObservationSchema.parse(req.body);
      const observation = await storage.createObservation(validated);
      res.status(201).json(observation);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/observations/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertObservationSchema.partial().parse(req.body);
      const observation = await storage.updateObservation(
        req.params.id,
        validated,
      );
      if (!observation) {
        return res.status(404).json({ message: "Observation not found" });
      }
      res.json(observation);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/observations/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const deleted = await storage.deleteObservation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Observation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete observation" });
    }
  },
);

// Business Intelligence
apiRouter.get(
  "/business-intelligence",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const { auditId } = req.query;
      if (!auditId) {
        return res.status(400).json({ message: "auditId is required" });
      }
      const bi = await storage.getBusinessIntelligenceByAudit(
        auditId as string,
      );
      res.json(bi);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch business intelligence" });
    }
  },
);

apiRouter.post(
  "/business-intelligence",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertBusinessIntelligenceSchema.parse(req.body);
      const bi = await storage.createBusinessIntelligence(validated);
      res.status(201).json(bi);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/business-intelligence/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertBusinessIntelligenceSchema
        .partial()
        .parse(req.body);
      const bi = await storage.updateBusinessIntelligence(
        req.params.id,
        validated,
      );
      if (!bi) {
        return res
          .status(404)
          .json({ message: "Business intelligence not found" });
      }
      res.json(bi);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/business-intelligence/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const deleted = await storage.deleteBusinessIntelligence(req.params.id);
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Business intelligence not found" });
      }
      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete business intelligence" });
    }
  },
);

// Leads
apiRouter.get("/leads", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const tenantId = getTenantFromLocals(res);
    const { status, assignedTo } = req.query;
    let leads;
    if (status) {
      leads = await storage.getLeadsByStatus(status as string, tenantId);
    } else if (assignedTo) {
      leads = await storage.getLeadsByAssignedUser(
        assignedTo as string,
        tenantId,
      );
    } else {
      leads = await storage.getAllLeads(tenantId);
    }
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

apiRouter.get(
  "/leads/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const lead = await storage.getLead(req.params.id, tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  },
);

apiRouter.post(
  "/leads",
  authorizeRoles("master_admin", "admin", "sales_rep"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead({
        ...validated,
        tenantId,
      });
      res.status(201).json(lead);
    } catch (error: any) {
      console.error("Lead creation validation error:", error);
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  },
);

apiRouter.put(
  "/leads/:id",
  authorizeRoles("master_admin", "admin", "sales_rep"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const validated = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, tenantId, validated);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/leads/:id",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const deleted = await storage.deleteLead(req.params.id, tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  },
);

// Lead Workflow Transitions
apiRouter.post(
  "/leads/:id/qualify",
  authorizeRoles("master_admin", "admin", "sales_rep"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const lead = await storage.qualifyLead(req.params.id, tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to qualify lead" });
    }
  },
);

apiRouter.post(
  "/leads/:id/start-progress",
  authorizeRoles("master_admin", "admin", "sales_rep"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const lead = await storage.startLeadProgress(req.params.id, tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to start lead progress" });
    }
  },
);

apiRouter.post(
  "/leads/:id/convert",
  authorizeRoles("master_admin", "admin", "sales_rep"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const lead = await storage.convertLead(req.params.id, tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to convert lead" });
    }
  },
);

apiRouter.post(
  "/leads/:id/close",
  authorizeRoles("master_admin", "admin"),
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const tenantId = getTenantFromLocals(res);
      const lead = await storage.closeLead(req.params.id, tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to close lead" });
    }
  },
);

// Files
apiRouter.get("/files", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) {
      return res
        .status(400)
        .json({ message: "entityType and entityId are required" });
    }
    const files = await storage.getFilesByEntity(
      entityType as string,
      entityId as string,
    );
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

apiRouter.post("/files", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const validated = insertFileSchema.parse(req.body);
    const file = await storage.createFile(validated);
    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ message: "Invalid data" });
  }
});

apiRouter.delete(
  "/files/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const deleted = await storage.deleteFile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  },
);

// Follow-up Actions
apiRouter.get(
  "/follow-up-actions",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const { auditId } = req.query;
      if (!auditId) {
        return res.status(400).json({ message: "auditId is required" });
      }
      const actions = await storage.getFollowUpActionsByAudit(
        auditId as string,
      );
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-up actions" });
    }
  },
);

apiRouter.post(
  "/follow-up-actions",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertFollowUpActionSchema.parse(req.body);
      const action = await storage.createFollowUpAction(validated);
      res.status(201).json(action);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.put(
  "/follow-up-actions/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const validated = insertFollowUpActionSchema.partial().parse(req.body);
      const action = await storage.updateFollowUpAction(
        req.params.id,
        validated,
      );
      if (!action) {
        return res.status(404).json({ message: "Follow-up action not found" });
      }
      res.json(action);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  },
);

apiRouter.delete(
  "/follow-up-actions/:id",
  async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const deleted = await storage.deleteFollowUpAction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Follow-up action not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete follow-up action" });
    }
  },
);

export default apiRouter;
