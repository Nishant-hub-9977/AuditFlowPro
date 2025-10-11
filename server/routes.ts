import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
} from "@shared/schema";
import authRoutes from "./authRoutes";
import { authenticateToken, authorizeRoles, hashPassword, type AuthRequest } from "./auth";

// CSV escaping utility
function escapeCSVField(field: string | number): string {
  if (typeof field === 'number') {
    return field.toString();
  }
  
  const stringField = String(field);
  
  // Check if field needs escaping (contains comma, quote, or newline)
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    // Escape double quotes by doubling them and wrap in quotes
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes (public)
  app.use("/api/auth", authRoutes);
  
  // Protect all API routes except /api/auth
  app.use("/api/*", (req, res, next) => {
    if (req.path.startsWith("/api/auth")) {
      return next();
    }
    authenticateToken(req as AuthRequest, res, next);
  });
  
  // Dashboard Stats (protected by global middleware)
  app.get("/api/dashboard/stats", async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const stats = await storage.getDashboardStats(req.user.tenantId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Reports
  app.get("/api/reports/audits", async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const reports = await storage.getAuditReports(req.user.tenantId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit reports" });
    }
  });

  app.get("/api/reports/leads", async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const reports = await storage.getLeadReports(req.user.tenantId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead reports" });
    }
  });

  // CSV Export Endpoints
  app.get("/api/reports/audits/export/csv", async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const reports = await storage.getAuditReports(req.user.tenantId);
      
      // Generate CSV for audits by status
      let csv = "Audit Reports Export\n\n";
      csv += "Audits by Status\n";
      csv += "Status,Count\n";
      reports.auditsByStatus.forEach(row => {
        csv += `${escapeCSVField(row.status)},${escapeCSVField(row.count)}\n`;
      });
      
      csv += "\nAudits by Industry\n";
      csv += "Industry,Count\n";
      reports.auditsByIndustry.forEach(row => {
        csv += `${escapeCSVField(row.industryName)},${escapeCSVField(row.count)}\n`;
      });
      
      csv += "\nAudits by Type\n";
      csv += "Audit Type,Count\n";
      reports.auditsByType.forEach(row => {
        csv += `${escapeCSVField(row.auditTypeName)},${escapeCSVField(row.count)}\n`;
      });
      
      csv += `\nTotal Audits,${escapeCSVField(reports.totalAudits)}\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-reports.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export audit reports" });
    }
  });

  app.get("/api/reports/leads/export/csv", async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const reports = await storage.getLeadReports(req.user.tenantId);
      
      // Generate CSV for leads
      let csv = "Lead Reports Export\n\n";
      csv += "Leads by Status\n";
      csv += "Status,Count\n";
      reports.leadsByStatus.forEach(row => {
        csv += `${escapeCSVField(row.status)},${escapeCSVField(row.count)}\n`;
      });
      
      csv += "\nLeads by Industry\n";
      csv += "Industry,Count\n";
      reports.leadsByIndustry.forEach(row => {
        csv += `${escapeCSVField(row.industryName)},${escapeCSVField(row.count)}\n`;
      });
      
      csv += "\nLeads by Priority\n";
      csv += "Priority,Count\n";
      reports.leadsByPriority.forEach(row => {
        csv += `${escapeCSVField(row.priority)},${escapeCSVField(row.count)}\n`;
      });
      
      csv += "\nSummary Metrics\n";
      csv += "Metric,Value\n";
      csv += `${escapeCSVField("Total Leads")},${escapeCSVField(reports.totalLeads)}\n`;
      csv += `${escapeCSVField("Conversion Rate")},${escapeCSVField(reports.conversionRate + "%")}\n`;
      csv += `${escapeCSVField("Total Estimated Value")},${escapeCSVField("$" + reports.totalEstimatedValue)}\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=lead-reports.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export lead reports" });
    }
  });

  // Users (Admin only for list, authenticated for own profile)
  app.get("/api/users", authenticateToken, authorizeRoles("admin"), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers(req.user!.tenantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.params.id, req.user!.tenantId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", authenticateToken, authorizeRoles("admin"), async (req: AuthRequest, res) => {
    try {
      const validated = insertUserSchema.omit({ tenantId: true }).parse(req.body);
      const hashedPassword = await hashPassword(validated.password);
      const user = await storage.createUser({
        ...validated,
        password: hashedPassword,
        tenantId: req.user!.tenantId,
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/users/:id", authenticateToken, authorizeRoles("admin"), async (req: AuthRequest, res) => {
    try {
      const validated = insertUserSchema.omit({ tenantId: true }).partial().parse(req.body);
      const updateData = { ...validated };
      
      // Hash password if it's being updated
      if (validated.password) {
        updateData.password = await hashPassword(validated.password);
      }
      
      const user = await storage.updateUser(req.params.id, req.user!.tenantId, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, authorizeRoles("admin"), async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id, req.user!.tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Industries (Protected)
  app.get("/api/industries", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const industries = await storage.getAllIndustries(req.user!.tenantId);
      res.json(industries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch industries" });
    }
  });

  app.get("/api/industries/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const industry = await storage.getIndustry(req.params.id, req.user!.tenantId);
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.json(industry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch industry" });
    }
  });

  app.post("/api/industries", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validated = insertIndustrySchema.omit({ tenantId: true }).parse(req.body);
      const industry = await storage.createIndustry({
        ...validated,
        tenantId: req.user!.tenantId,
      });
      res.status(201).json(industry);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/industries/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validated = insertIndustrySchema.omit({ tenantId: true }).partial().parse(req.body);
      const industry = await storage.updateIndustry(req.params.id, req.user!.tenantId, validated);
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.json(industry);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/industries/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteIndustry(req.params.id, req.user!.tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete industry" });
    }
  });

  // Audit Types
  app.get("/api/audit-types", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const auditTypes = await storage.getAllAuditTypes(req.user!.tenantId);
      res.json(auditTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit types" });
    }
  });

  app.get("/api/audit-types/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const auditType = await storage.getAuditType(req.params.id, req.user!.tenantId);
      if (!auditType) {
        return res.status(404).json({ message: "Audit type not found" });
      }
      res.json(auditType);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit type" });
    }
  });

  app.post("/api/audit-types", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validated = insertAuditTypeSchema.omit({ tenantId: true }).parse(req.body);
      const auditType = await storage.createAuditType({
        ...validated,
        tenantId: req.user!.tenantId,
      });
      res.status(201).json(auditType);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/audit-types/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validated = insertAuditTypeSchema.omit({ tenantId: true }).partial().parse(req.body);
      const auditType = await storage.updateAuditType(req.params.id, req.user!.tenantId, validated);
      if (!auditType) {
        return res.status(404).json({ message: "Audit type not found" });
      }
      res.json(auditType);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/audit-types/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteAuditType(req.params.id, req.user!.tenantId);
      if (!deleted) {
        return res.status(404).json({ message: "Audit type not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audit type" });
    }
  });

  // Checklists
  app.get("/api/checklists", async (req, res) => {
    try {
      const { auditTypeId } = req.query;
      const checklists = auditTypeId 
        ? await storage.getChecklistsByAuditType(auditTypeId as string)
        : await storage.getAllChecklists();
      res.json(checklists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklists" });
    }
  });

  app.get("/api/checklists/:id", async (req, res) => {
    try {
      const checklist = await storage.getChecklist(req.params.id);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklist" });
    }
  });

  app.post("/api/checklists", async (req, res) => {
    try {
      const validated = insertChecklistSchema.parse(req.body);
      const checklist = await storage.createChecklist(validated);
      res.status(201).json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/checklists/:id", async (req, res) => {
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
  });

  app.delete("/api/checklists/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChecklist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete checklist" });
    }
  });

  // Checklist Items
  app.get("/api/checklist-items", async (req, res) => {
    try {
      const { checklistId } = req.query;
      if (!checklistId) {
        return res.status(400).json({ message: "checklistId is required" });
      }
      const items = await storage.getChecklistItemsByChecklist(checklistId as string);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklist items" });
    }
  });

  app.get("/api/checklist-items/:id", async (req, res) => {
    try {
      const item = await storage.getChecklistItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklist item" });
    }
  });

  app.post("/api/checklist-items", async (req, res) => {
    try {
      const validated = insertChecklistItemSchema.parse(req.body);
      const item = await storage.createChecklistItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/checklist-items/:id", async (req, res) => {
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
  });

  app.delete("/api/checklist-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChecklistItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete checklist item" });
    }
  });

  // Audits
  app.get("/api/audits", async (req, res) => {
    try {
      const { status, auditorId } = req.query;
      let audits;
      if (status) {
        audits = await storage.getAuditsByStatus(status as string);
      } else if (auditorId) {
        audits = await storage.getAuditsByAuditor(auditorId as string);
      } else {
        audits = await storage.getAllAudits();
      }
      res.json(audits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audits" });
    }
  });

  app.get("/api/audits/:id", async (req, res) => {
    try {
      const audit = await storage.getAudit(req.params.id);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit" });
    }
  });

  app.post("/api/audits", async (req, res) => {
    try {
      const validated = insertAuditSchema.parse(req.body);
      const audit = await storage.createAudit(validated);
      res.status(201).json(audit);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/audits/:id", async (req, res) => {
    try {
      const validated = insertAuditSchema.partial().parse(req.body);
      const audit = await storage.updateAudit(req.params.id, validated);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/audits/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAudit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audit" });
    }
  });

  // Audit Workflow Transitions
  app.post("/api/audits/:id/submit-for-review", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const audit = await storage.submitAuditForReview(req.params.id, req.user.tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to submit audit for review" });
    }
  });

  app.post("/api/audits/:id/approve", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can approve audits" });
      }
      const audit = await storage.approveAudit(req.params.id, req.user.tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to approve audit" });
    }
  });

  app.post("/api/audits/:id/reject", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can reject audits" });
      }
      const audit = await storage.rejectAudit(req.params.id, req.user.tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to reject audit" });
    }
  });

  app.post("/api/audits/:id/close", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can close audits" });
      }
      const audit = await storage.closeAudit(req.params.id, req.user.tenantId);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(audit);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to close audit" });
    }
  });

  // Audit Checklist Responses
  app.get("/api/audit-checklist-responses", async (req, res) => {
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
  });

  app.post("/api/audit-checklist-responses", async (req, res) => {
    try {
      const validated = insertAuditChecklistResponseSchema.parse(req.body);
      const response = await storage.createAuditChecklistResponse(validated);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/audit-checklist-responses/:id", async (req, res) => {
    try {
      const validated = insertAuditChecklistResponseSchema.partial().parse(req.body);
      const response = await storage.updateAuditChecklistResponse(req.params.id, validated);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/audit-checklist-responses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAuditChecklistResponse(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Response not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete response" });
    }
  });

  // Observations
  app.get("/api/observations", async (req, res) => {
    try {
      const { auditId } = req.query;
      if (!auditId) {
        return res.status(400).json({ message: "auditId is required" });
      }
      const observations = await storage.getObservationsByAudit(auditId as string);
      res.json(observations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch observations" });
    }
  });

  app.post("/api/observations", async (req, res) => {
    try {
      const validated = insertObservationSchema.parse(req.body);
      const observation = await storage.createObservation(validated);
      res.status(201).json(observation);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/observations/:id", async (req, res) => {
    try {
      const validated = insertObservationSchema.partial().parse(req.body);
      const observation = await storage.updateObservation(req.params.id, validated);
      if (!observation) {
        return res.status(404).json({ message: "Observation not found" });
      }
      res.json(observation);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/observations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteObservation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Observation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete observation" });
    }
  });

  // Business Intelligence
  app.get("/api/business-intelligence", async (req, res) => {
    try {
      const { auditId } = req.query;
      if (!auditId) {
        return res.status(400).json({ message: "auditId is required" });
      }
      const bi = await storage.getBusinessIntelligenceByAudit(auditId as string);
      res.json(bi);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business intelligence" });
    }
  });

  app.post("/api/business-intelligence", async (req, res) => {
    try {
      const validated = insertBusinessIntelligenceSchema.parse(req.body);
      const bi = await storage.createBusinessIntelligence(validated);
      res.status(201).json(bi);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/business-intelligence/:id", async (req, res) => {
    try {
      const validated = insertBusinessIntelligenceSchema.partial().parse(req.body);
      const bi = await storage.updateBusinessIntelligence(req.params.id, validated);
      if (!bi) {
        return res.status(404).json({ message: "Business intelligence not found" });
      }
      res.json(bi);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/business-intelligence/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBusinessIntelligence(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Business intelligence not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete business intelligence" });
    }
  });

  // Leads
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, assignedTo } = req.query;
      let leads;
      if (status) {
        leads = await storage.getLeadsByStatus(status as string);
      } else if (assignedTo) {
        leads = await storage.getLeadsByAssignedUser(assignedTo as string);
      } else {
        leads = await storage.getAllLeads();
      }
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validated = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validated);
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const validated = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, validated);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Lead Workflow Transitions
  app.post("/api/leads/:id/qualify", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'lead_manager') {
        return res.status(403).json({ message: "Only admins and lead managers can qualify leads" });
      }
      const lead = await storage.qualifyLead(req.params.id, req.user.tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to qualify lead" });
    }
  });

  app.post("/api/leads/:id/start-progress", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'lead_manager') {
        return res.status(403).json({ message: "Only admins and lead managers can start lead progress" });
      }
      const lead = await storage.startLeadProgress(req.params.id, req.user.tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to start lead progress" });
    }
  });

  app.post("/api/leads/:id/convert", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'lead_manager') {
        return res.status(403).json({ message: "Only admins and lead managers can convert leads" });
      }
      const lead = await storage.convertLead(req.params.id, req.user.tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to convert lead" });
    }
  });

  app.post("/api/leads/:id/close", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'lead_manager') {
        return res.status(403).json({ message: "Only admins and lead managers can close leads" });
      }
      const lead = await storage.closeLead(req.params.id, req.user.tenantId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to close lead" });
    }
  });

  // Files
  app.get("/api/files", async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "entityType and entityId are required" });
      }
      const files = await storage.getFilesByEntity(entityType as string, entityId as string);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const validated = insertFileSchema.parse(req.body);
      const file = await storage.createFile(validated);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Follow-up Actions
  app.get("/api/follow-up-actions", async (req, res) => {
    try {
      const { auditId } = req.query;
      if (!auditId) {
        return res.status(400).json({ message: "auditId is required" });
      }
      const actions = await storage.getFollowUpActionsByAudit(auditId as string);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-up actions" });
    }
  });

  app.post("/api/follow-up-actions", async (req, res) => {
    try {
      const validated = insertFollowUpActionSchema.parse(req.body);
      const action = await storage.createFollowUpAction(validated);
      res.status(201).json(action);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put("/api/follow-up-actions/:id", async (req, res) => {
    try {
      const validated = insertFollowUpActionSchema.partial().parse(req.body);
      const action = await storage.updateFollowUpAction(req.params.id, validated);
      if (!action) {
        return res.status(404).json({ message: "Follow-up action not found" });
      }
      res.json(action);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/follow-up-actions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFollowUpAction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Follow-up action not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete follow-up action" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
