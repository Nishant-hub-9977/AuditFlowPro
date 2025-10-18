import { db } from "./db";
import { eq, desc, and, like, sql } from "drizzle-orm";
import * as schema from "../shared/schema";
import type {
  User,
  InsertUser,
  Industry,
  InsertIndustry,
  AuditType,
  InsertAuditType,
  Checklist,
  InsertChecklist,
  ChecklistItem,
  InsertChecklistItem,
  Audit,
  InsertAudit,
  AuditChecklistResponse,
  InsertAuditChecklistResponse,
  Observation,
  InsertObservation,
  BusinessIntelligence,
  InsertBusinessIntelligence,
  Lead,
  InsertLead,
  File,
  InsertFile,
  FollowUpAction,
  InsertFollowUpAction,
} from "../shared/schema";

export interface IStorage {
  // Users
  getUser(id: string, tenantId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(tenantId: string): Promise<User[]>;
  updateUser(
    id: string,
    tenantId: string,
    user: Partial<InsertUser>,
  ): Promise<User | undefined>;
  deleteUser(id: string, tenantId: string): Promise<boolean>;

  // Industries
  getIndustry(id: string, tenantId: string): Promise<Industry | undefined>;
  createIndustry(industry: InsertIndustry): Promise<Industry>;
  getAllIndustries(tenantId: string): Promise<Industry[]>;
  updateIndustry(
    id: string,
    tenantId: string,
    industry: Partial<InsertIndustry>,
  ): Promise<Industry | undefined>;
  deleteIndustry(id: string, tenantId: string): Promise<boolean>;

  // Audit Types
  getAuditType(id: string, tenantId: string): Promise<AuditType | undefined>;
  createAuditType(auditType: InsertAuditType): Promise<AuditType>;
  getAllAuditTypes(tenantId: string): Promise<AuditType[]>;
  updateAuditType(
    id: string,
    tenantId: string,
    auditType: Partial<InsertAuditType>,
  ): Promise<AuditType | undefined>;
  deleteAuditType(id: string, tenantId: string): Promise<boolean>;

  // Checklists
  getChecklist(id: string): Promise<Checklist | undefined>;
  createChecklist(checklist: InsertChecklist): Promise<Checklist>;
  getAllChecklists(): Promise<Checklist[]>;
  getChecklistsByAuditType(auditTypeId: string): Promise<Checklist[]>;
  updateChecklist(
    id: string,
    checklist: Partial<InsertChecklist>,
  ): Promise<Checklist | undefined>;
  deleteChecklist(id: string): Promise<boolean>;

  // Checklist Items
  getChecklistItem(id: string): Promise<ChecklistItem | undefined>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  getChecklistItemsByChecklist(checklistId: string): Promise<ChecklistItem[]>;
  updateChecklistItem(
    id: string,
    item: Partial<InsertChecklistItem>,
  ): Promise<ChecklistItem | undefined>;
  deleteChecklistItem(id: string): Promise<boolean>;

  // Audits
  getAudit(id: string, tenantId: string): Promise<Audit | undefined>;
  createAudit(audit: InsertAudit): Promise<Audit>;
  getAllAudits(tenantId: string): Promise<Audit[]>;
  getAuditsByStatus(status: string, tenantId: string): Promise<Audit[]>;
  getAuditsByAuditor(auditorId: string, tenantId: string): Promise<Audit[]>;
  updateAudit(
    id: string,
    tenantId: string,
    audit: Partial<InsertAudit>,
  ): Promise<Audit | undefined>;
  deleteAudit(id: string, tenantId: string): Promise<boolean>;

  // Audit Workflow Transitions
  submitAuditForReview(
    id: string,
    tenantId: string,
  ): Promise<Audit | undefined>;
  approveAudit(id: string, tenantId: string): Promise<Audit | undefined>;
  rejectAudit(id: string, tenantId: string): Promise<Audit | undefined>;
  closeAudit(id: string, tenantId: string): Promise<Audit | undefined>;

  // Audit Checklist Responses
  getAuditChecklistResponse(
    id: string,
  ): Promise<AuditChecklistResponse | undefined>;
  createAuditChecklistResponse(
    response: InsertAuditChecklistResponse,
  ): Promise<AuditChecklistResponse>;
  getResponsesByAudit(auditId: string): Promise<AuditChecklistResponse[]>;
  updateAuditChecklistResponse(
    id: string,
    response: Partial<InsertAuditChecklistResponse>,
  ): Promise<AuditChecklistResponse | undefined>;
  deleteAuditChecklistResponse(id: string): Promise<boolean>;

  // Observations
  getObservation(id: string): Promise<Observation | undefined>;
  createObservation(observation: InsertObservation): Promise<Observation>;
  getObservationsByAudit(auditId: string): Promise<Observation[]>;
  updateObservation(
    id: string,
    observation: Partial<InsertObservation>,
  ): Promise<Observation | undefined>;
  deleteObservation(id: string): Promise<boolean>;

  // Business Intelligence
  getBusinessIntelligence(
    id: string,
  ): Promise<BusinessIntelligence | undefined>;
  createBusinessIntelligence(
    bi: InsertBusinessIntelligence,
  ): Promise<BusinessIntelligence>;
  getBusinessIntelligenceByAudit(
    auditId: string,
  ): Promise<BusinessIntelligence | undefined>;
  updateBusinessIntelligence(
    id: string,
    bi: Partial<InsertBusinessIntelligence>,
  ): Promise<BusinessIntelligence | undefined>;
  deleteBusinessIntelligence(id: string): Promise<boolean>;

  // Leads
  getLead(id: string, tenantId: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  getAllLeads(tenantId: string): Promise<Lead[]>;
  getLeadsByStatus(status: string, tenantId: string): Promise<Lead[]>;
  getLeadsByAssignedUser(userId: string, tenantId: string): Promise<Lead[]>;
  updateLead(
    id: string,
    tenantId: string,
    lead: Partial<InsertLead>,
  ): Promise<Lead | undefined>;
  deleteLead(id: string, tenantId: string): Promise<boolean>;

  // Lead Workflow Transitions
  qualifyLead(id: string, tenantId: string): Promise<Lead | undefined>;
  startLeadProgress(id: string, tenantId: string): Promise<Lead | undefined>;
  convertLead(id: string, tenantId: string): Promise<Lead | undefined>;
  closeLead(id: string, tenantId: string): Promise<Lead | undefined>;

  // Files
  getFile(id: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  getFilesByEntity(entityType: string, entityId: string): Promise<File[]>;
  deleteFile(id: string): Promise<boolean>;

  // Follow-up Actions
  getFollowUpAction(id: string): Promise<FollowUpAction | undefined>;
  createFollowUpAction(action: InsertFollowUpAction): Promise<FollowUpAction>;
  getFollowUpActionsByAudit(auditId: string): Promise<FollowUpAction[]>;
  updateFollowUpAction(
    id: string,
    action: Partial<InsertFollowUpAction>,
  ): Promise<FollowUpAction | undefined>;
  deleteFollowUpAction(id: string): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(tenantId: string): Promise<{
    totalAudits: number;
    pendingAudits: number;
    completedAudits: number;
    totalLeads: number;
  }>;

  // Reports
  getAuditReports(tenantId: string): Promise<{
    auditsByStatus: { status: string; count: number }[];
    auditsByIndustry: { industryName: string; count: number }[];
    auditsByType: { auditTypeName: string; count: number }[];
    totalAudits: number;
  }>;

  getLeadReports(tenantId: string): Promise<{
    leadsByStatus: { status: string; count: number }[];
    leadsByIndustry: { industryName: string; count: number }[];
    leadsByPriority: { priority: string; count: number }[];
    conversionRate: number;
    totalEstimatedValue: number;
    totalLeads: number;
  }>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string, tenantId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, id), eq(schema.users.tenantId, tenantId)));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!insertUser.tenantId) {
      throw new Error("tenantId is required to create a user");
    }
    const [user] = await db
      .insert(schema.users)
      .values(insertUser as schema.InsertUser & { tenantId: string })
      .returning();
    return user;
  }

  async getAllUsers(tenantId: string): Promise<User[]> {
    return await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.tenantId, tenantId))
      .orderBy(desc(schema.users.createdAt));
  }

  async updateUser(
    id: string,
    tenantId: string,
    user: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(schema.users)
      .set(user)
      .where(and(eq(schema.users.id, id), eq(schema.users.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async deleteUser(id: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(schema.users)
      .where(and(eq(schema.users.id, id), eq(schema.users.tenantId, tenantId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Industries
  async getIndustry(
    id: string,
    tenantId: string,
  ): Promise<Industry | undefined> {
    const [industry] = await db
      .select()
      .from(schema.industries)
      .where(
        and(
          eq(schema.industries.id, id),
          eq(schema.industries.tenantId, tenantId),
        ),
      );
    return industry;
  }

  async createIndustry(insertIndustry: InsertIndustry): Promise<Industry> {
    if (!insertIndustry.tenantId) {
      throw new Error("tenantId is required to create an industry");
    }
    const [industry] = await db
      .insert(schema.industries)
      .values(insertIndustry as schema.InsertIndustry & { tenantId: string })
      .returning();
    return industry;
  }

  async getAllIndustries(tenantId: string): Promise<Industry[]> {
    return await db
      .select()
      .from(schema.industries)
      .where(eq(schema.industries.tenantId, tenantId))
      .orderBy(schema.industries.name);
  }

  async updateIndustry(
    id: string,
    tenantId: string,
    industry: Partial<InsertIndustry>,
  ): Promise<Industry | undefined> {
    const [updated] = await db
      .update(schema.industries)
      .set(industry)
      .where(
        and(
          eq(schema.industries.id, id),
          eq(schema.industries.tenantId, tenantId),
        ),
      )
      .returning();
    return updated;
  }

  async deleteIndustry(id: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(schema.industries)
      .where(
        and(
          eq(schema.industries.id, id),
          eq(schema.industries.tenantId, tenantId),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Audit Types
  async getAuditType(
    id: string,
    tenantId: string,
  ): Promise<AuditType | undefined> {
    const [auditType] = await db
      .select()
      .from(schema.auditTypes)
      .where(
        and(
          eq(schema.auditTypes.id, id),
          eq(schema.auditTypes.tenantId, tenantId),
        ),
      );
    return auditType;
  }

  async createAuditType(insertAuditType: InsertAuditType): Promise<AuditType> {
    if (!insertAuditType.tenantId) {
      throw new Error("tenantId is required to create an audit type");
    }
    const [auditType] = await db
      .insert(schema.auditTypes)
      .values(insertAuditType as schema.InsertAuditType & { tenantId: string })
      .returning();
    return auditType;
  }

  async getAllAuditTypes(tenantId: string): Promise<AuditType[]> {
    return await db
      .select()
      .from(schema.auditTypes)
      .where(eq(schema.auditTypes.tenantId, tenantId))
      .orderBy(schema.auditTypes.name);
  }

  async updateAuditType(
    id: string,
    tenantId: string,
    auditType: Partial<InsertAuditType>,
  ): Promise<AuditType | undefined> {
    const [updated] = await db
      .update(schema.auditTypes)
      .set(auditType)
      .where(
        and(
          eq(schema.auditTypes.id, id),
          eq(schema.auditTypes.tenantId, tenantId),
        ),
      )
      .returning();
    return updated;
  }

  async deleteAuditType(id: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(schema.auditTypes)
      .where(
        and(
          eq(schema.auditTypes.id, id),
          eq(schema.auditTypes.tenantId, tenantId),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Checklists
  async getChecklist(id: string): Promise<Checklist | undefined> {
    const [checklist] = await db
      .select()
      .from(schema.checklists)
      .where(eq(schema.checklists.id, id));
    return checklist;
  }

  async createChecklist(insertChecklist: InsertChecklist): Promise<Checklist> {
    if (!insertChecklist.tenantId) {
      throw new Error("tenantId is required to create a checklist");
    }
    const [checklist] = await db
      .insert(schema.checklists)
      .values(insertChecklist as schema.InsertChecklist & { tenantId: string })
      .returning();
    return checklist;
  }

  async getAllChecklists(): Promise<Checklist[]> {
    return await db
      .select()
      .from(schema.checklists)
      .orderBy(desc(schema.checklists.createdAt));
  }

  async getChecklistsByAuditType(auditTypeId: string): Promise<Checklist[]> {
    return await db
      .select()
      .from(schema.checklists)
      .where(eq(schema.checklists.auditTypeId, auditTypeId));
  }

  async updateChecklist(
    id: string,
    checklist: Partial<InsertChecklist>,
  ): Promise<Checklist | undefined> {
    const [updated] = await db
      .update(schema.checklists)
      .set(checklist)
      .where(eq(schema.checklists.id, id))
      .returning();
    return updated;
  }

  async deleteChecklist(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.checklists)
      .where(eq(schema.checklists.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Checklist Items
  async getChecklistItem(id: string): Promise<ChecklistItem | undefined> {
    const [item] = await db
      .select()
      .from(schema.checklistItems)
      .where(eq(schema.checklistItems.id, id));
    return item;
  }

  async createChecklistItem(
    insertItem: InsertChecklistItem,
  ): Promise<ChecklistItem> {
    const [item] = await db
      .insert(schema.checklistItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async getChecklistItemsByChecklist(
    checklistId: string,
  ): Promise<ChecklistItem[]> {
    return await db
      .select()
      .from(schema.checklistItems)
      .where(eq(schema.checklistItems.checklistId, checklistId))
      .orderBy(schema.checklistItems.orderIndex);
  }

  async updateChecklistItem(
    id: string,
    item: Partial<InsertChecklistItem>,
  ): Promise<ChecklistItem | undefined> {
    const [updated] = await db
      .update(schema.checklistItems)
      .set(item)
      .where(eq(schema.checklistItems.id, id))
      .returning();
    return updated;
  }

  async deleteChecklistItem(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.checklistItems)
      .where(eq(schema.checklistItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Audits
  async getAudit(id: string, tenantId: string): Promise<Audit | undefined> {
    const [audit] = await db
      .select()
      .from(schema.audits)
      .where(
        and(eq(schema.audits.id, id), eq(schema.audits.tenantId, tenantId)),
      );
    return audit;
  }

  async createAudit(insertAudit: InsertAudit): Promise<Audit> {
    if (!insertAudit.tenantId) {
      throw new Error("tenantId is required to create an audit");
    }
    const [audit] = await db
      .insert(schema.audits)
      .values(insertAudit as schema.InsertAudit & { tenantId: string })
      .returning();
    return audit;
  }

  async getAllAudits(tenantId: string): Promise<Audit[]> {
    return await db
      .select()
      .from(schema.audits)
      .where(eq(schema.audits.tenantId, tenantId))
      .orderBy(desc(schema.audits.auditDate));
  }

  async getAuditsByStatus(status: string, tenantId: string): Promise<Audit[]> {
    return await db
      .select()
      .from(schema.audits)
      .where(
        and(
          eq(schema.audits.status, status),
          eq(schema.audits.tenantId, tenantId),
        ),
      )
      .orderBy(desc(schema.audits.auditDate));
  }

  async getAuditsByAuditor(
    auditorId: string,
    tenantId: string,
  ): Promise<Audit[]> {
    return await db
      .select()
      .from(schema.audits)
      .where(
        and(
          eq(schema.audits.auditorId, auditorId),
          eq(schema.audits.tenantId, tenantId),
        ),
      )
      .orderBy(desc(schema.audits.auditDate));
  }

  async updateAudit(
    id: string,
    tenantId: string,
    audit: Partial<InsertAudit>,
  ): Promise<Audit | undefined> {
    const [updated] = await db
      .update(schema.audits)
      .set({ ...audit, updatedAt: new Date() })
      .where(
        and(eq(schema.audits.id, id), eq(schema.audits.tenantId, tenantId)),
      )
      .returning();
    return updated;
  }

  async deleteAudit(id: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(schema.audits)
      .where(
        and(eq(schema.audits.id, id), eq(schema.audits.tenantId, tenantId)),
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Audit Workflow Transitions
  async submitAuditForReview(
    id: string,
    tenantId: string,
  ): Promise<Audit | undefined> {
    const audit = await this.getAudit(id, tenantId);
    if (!audit) return undefined;
    if (audit.status !== "draft") {
      throw new Error("Only draft audits can be submitted for review");
    }
    const [updated] = await db
      .update(schema.audits)
      .set({ status: "review", updatedAt: new Date() })
      .where(
        and(eq(schema.audits.id, id), eq(schema.audits.tenantId, tenantId)),
      )
      .returning();
    return updated;
  }

  async approveAudit(id: string, tenantId: string): Promise<Audit | undefined> {
    const audit = await this.getAudit(id, tenantId);
    if (!audit) return undefined;
    if (audit.status !== "review") {
      throw new Error("Only audits in review can be approved");
    }
    const [updated] = await db
      .update(schema.audits)
      .set({ status: "approved", updatedAt: new Date() })
      .where(
        and(eq(schema.audits.id, id), eq(schema.audits.tenantId, tenantId)),
      )
      .returning();
    return updated;
  }

  async rejectAudit(id: string, tenantId: string): Promise<Audit | undefined> {
    const audit = await this.getAudit(id, tenantId);
    if (!audit) return undefined;
    if (audit.status !== "review") {
      throw new Error("Only audits in review can be rejected");
    }
    const [updated] = await db
      .update(schema.audits)
      .set({ status: "draft", updatedAt: new Date() })
      .where(
        and(eq(schema.audits.id, id), eq(schema.audits.tenantId, tenantId)),
      )
      .returning();
    return updated;
  }

  async closeAudit(id: string, tenantId: string): Promise<Audit | undefined> {
    const audit = await this.getAudit(id, tenantId);
    if (!audit) return undefined;
    if (audit.status !== "approved") {
      throw new Error("Only approved audits can be closed");
    }
    const [updated] = await db
      .update(schema.audits)
      .set({ status: "closed", updatedAt: new Date() })
      .where(
        and(eq(schema.audits.id, id), eq(schema.audits.tenantId, tenantId)),
      )
      .returning();
    return updated;
  }

  // Audit Checklist Responses
  async getAuditChecklistResponse(
    id: string,
  ): Promise<AuditChecklistResponse | undefined> {
    const [response] = await db
      .select()
      .from(schema.auditChecklistResponses)
      .where(eq(schema.auditChecklistResponses.id, id));
    return response;
  }

  async createAuditChecklistResponse(
    insertResponse: InsertAuditChecklistResponse,
  ): Promise<AuditChecklistResponse> {
    const [response] = await db
      .insert(schema.auditChecklistResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponsesByAudit(
    auditId: string,
  ): Promise<AuditChecklistResponse[]> {
    return await db
      .select()
      .from(schema.auditChecklistResponses)
      .where(eq(schema.auditChecklistResponses.auditId, auditId));
  }

  async updateAuditChecklistResponse(
    id: string,
    response: Partial<InsertAuditChecklistResponse>,
  ): Promise<AuditChecklistResponse | undefined> {
    const [updated] = await db
      .update(schema.auditChecklistResponses)
      .set(response)
      .where(eq(schema.auditChecklistResponses.id, id))
      .returning();
    return updated;
  }

  async deleteAuditChecklistResponse(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.auditChecklistResponses)
      .where(eq(schema.auditChecklistResponses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Observations
  async getObservation(id: string): Promise<Observation | undefined> {
    const [observation] = await db
      .select()
      .from(schema.observations)
      .where(eq(schema.observations.id, id));
    return observation;
  }

  async createObservation(
    insertObservation: InsertObservation,
  ): Promise<Observation> {
    const [observation] = await db
      .insert(schema.observations)
      .values(insertObservation)
      .returning();
    return observation;
  }

  async getObservationsByAudit(auditId: string): Promise<Observation[]> {
    return await db
      .select()
      .from(schema.observations)
      .where(eq(schema.observations.auditId, auditId))
      .orderBy(desc(schema.observations.createdAt));
  }

  async updateObservation(
    id: string,
    observation: Partial<InsertObservation>,
  ): Promise<Observation | undefined> {
    const [updated] = await db
      .update(schema.observations)
      .set(observation)
      .where(eq(schema.observations.id, id))
      .returning();
    return updated;
  }

  async deleteObservation(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.observations)
      .where(eq(schema.observations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Business Intelligence
  async getBusinessIntelligence(
    id: string,
  ): Promise<BusinessIntelligence | undefined> {
    const [bi] = await db
      .select()
      .from(schema.businessIntelligence)
      .where(eq(schema.businessIntelligence.id, id));
    return bi;
  }

  async createBusinessIntelligence(
    insertBi: InsertBusinessIntelligence,
  ): Promise<BusinessIntelligence> {
    const [bi] = await db
      .insert(schema.businessIntelligence)
      .values(insertBi)
      .returning();
    return bi;
  }

  async getBusinessIntelligenceByAudit(
    auditId: string,
  ): Promise<BusinessIntelligence | undefined> {
    const [bi] = await db
      .select()
      .from(schema.businessIntelligence)
      .where(eq(schema.businessIntelligence.auditId, auditId));
    return bi;
  }

  async updateBusinessIntelligence(
    id: string,
    bi: Partial<InsertBusinessIntelligence>,
  ): Promise<BusinessIntelligence | undefined> {
    const [updated] = await db
      .update(schema.businessIntelligence)
      .set(bi)
      .where(eq(schema.businessIntelligence.id, id))
      .returning();
    return updated;
  }

  async deleteBusinessIntelligence(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.businessIntelligence)
      .where(eq(schema.businessIntelligence.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Leads
  async getLead(id: string, tenantId: string): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(schema.leads)
      .where(and(eq(schema.leads.id, id), eq(schema.leads.tenantId, tenantId)));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    if (!insertLead.tenantId) {
      throw new Error("tenantId is required to create a lead");
    }
    const [lead] = await db
      .insert(schema.leads)
      .values(insertLead as schema.InsertLead & { tenantId: string })
      .returning();
    return lead;
  }

  async getAllLeads(tenantId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(schema.leads)
      .where(eq(schema.leads.tenantId, tenantId))
      .orderBy(desc(schema.leads.createdAt));
  }

  async getLeadsByStatus(status: string, tenantId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(schema.leads)
      .where(
        and(
          eq(schema.leads.status, status),
          eq(schema.leads.tenantId, tenantId),
        ),
      )
      .orderBy(desc(schema.leads.createdAt));
  }

  async getLeadsByAssignedUser(
    userId: string,
    tenantId: string,
  ): Promise<Lead[]> {
    return await db
      .select()
      .from(schema.leads)
      .where(
        and(
          eq(schema.leads.assignedTo, userId),
          eq(schema.leads.tenantId, tenantId),
        ),
      )
      .orderBy(desc(schema.leads.createdAt));
  }

  async updateLead(
    id: string,
    tenantId: string,
    lead: Partial<InsertLead>,
  ): Promise<Lead | undefined> {
    const [updated] = await db
      .update(schema.leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(and(eq(schema.leads.id, id), eq(schema.leads.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async deleteLead(id: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(schema.leads)
      .where(and(eq(schema.leads.id, id), eq(schema.leads.tenantId, tenantId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Lead Workflow Transitions
  async qualifyLead(id: string, tenantId: string): Promise<Lead | undefined> {
    const lead = await this.getLead(id, tenantId);
    if (!lead) return undefined;
    if (lead.status !== "new") {
      throw new Error("Only new leads can be qualified");
    }
    const [updated] = await db
      .update(schema.leads)
      .set({ status: "qualified", updatedAt: new Date() })
      .where(and(eq(schema.leads.id, id), eq(schema.leads.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async startLeadProgress(
    id: string,
    tenantId: string,
  ): Promise<Lead | undefined> {
    const lead = await this.getLead(id, tenantId);
    if (!lead) return undefined;
    if (lead.status !== "qualified") {
      throw new Error("Only qualified leads can be moved to in progress");
    }
    const [updated] = await db
      .update(schema.leads)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(and(eq(schema.leads.id, id), eq(schema.leads.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async convertLead(id: string, tenantId: string): Promise<Lead | undefined> {
    const lead = await this.getLead(id, tenantId);
    if (!lead) return undefined;
    if (lead.status !== "in_progress") {
      throw new Error("Only leads in progress can be converted");
    }
    const [updated] = await db
      .update(schema.leads)
      .set({ status: "converted", updatedAt: new Date() })
      .where(and(eq(schema.leads.id, id), eq(schema.leads.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async closeLead(id: string, tenantId: string): Promise<Lead | undefined> {
    const lead = await this.getLead(id, tenantId);
    if (!lead) return undefined;
    if (lead.status === "converted" || lead.status === "closed") {
      throw new Error("Cannot close a converted or already closed lead");
    }
    const [updated] = await db
      .update(schema.leads)
      .set({ status: "closed", updatedAt: new Date() })
      .where(and(eq(schema.leads.id, id), eq(schema.leads.tenantId, tenantId)))
      .returning();
    return updated;
  }

  // Files
  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(schema.files)
      .where(eq(schema.files.id, id));
    return file;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db.insert(schema.files).values(insertFile).returning();
    return file;
  }

  async getFilesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<File[]> {
    return await db
      .select()
      .from(schema.files)
      .where(
        and(
          eq(schema.files.entityType, entityType),
          eq(schema.files.entityId, entityId),
        ),
      )
      .orderBy(desc(schema.files.createdAt));
  }

  async deleteFile(id: string): Promise<boolean> {
    const result = await db.delete(schema.files).where(eq(schema.files.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Follow-up Actions
  async getFollowUpAction(id: string): Promise<FollowUpAction | undefined> {
    const [action] = await db
      .select()
      .from(schema.followUpActions)
      .where(eq(schema.followUpActions.id, id));
    return action;
  }

  async createFollowUpAction(
    insertAction: InsertFollowUpAction,
  ): Promise<FollowUpAction> {
    const [action] = await db
      .insert(schema.followUpActions)
      .values(insertAction)
      .returning();
    return action;
  }

  async getFollowUpActionsByAudit(auditId: string): Promise<FollowUpAction[]> {
    return await db
      .select()
      .from(schema.followUpActions)
      .where(eq(schema.followUpActions.auditId, auditId))
      .orderBy(schema.followUpActions.dueDate);
  }

  async updateFollowUpAction(
    id: string,
    action: Partial<InsertFollowUpAction>,
  ): Promise<FollowUpAction | undefined> {
    const [updated] = await db
      .update(schema.followUpActions)
      .set(action)
      .where(eq(schema.followUpActions.id, id))
      .returning();
    return updated;
  }

  async deleteFollowUpAction(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.followUpActions)
      .where(eq(schema.followUpActions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Dashboard stats
  async getDashboardStats(tenantId: string): Promise<{
    totalAudits: number;
    pendingAudits: number;
    completedAudits: number;
    totalLeads: number;
  }> {
    const [totalAuditsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.audits)
      .where(eq(schema.audits.tenantId, tenantId));

    const [pendingAuditsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.audits)
      .where(
        and(
          eq(schema.audits.tenantId, tenantId),
          eq(schema.audits.status, "planning"),
        ),
      );

    const [completedAuditsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.audits)
      .where(
        and(
          eq(schema.audits.tenantId, tenantId),
          eq(schema.audits.status, "completed"),
        ),
      );

    const [totalLeadsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.leads)
      .where(eq(schema.leads.tenantId, tenantId));

    return {
      totalAudits: Number(totalAuditsResult.count),
      pendingAudits: Number(pendingAuditsResult.count),
      completedAudits: Number(completedAuditsResult.count),
      totalLeads: Number(totalLeadsResult.count),
    };
  }

  // Reports
  async getAuditReports(tenantId: string): Promise<{
    auditsByStatus: { status: string; count: number }[];
    auditsByIndustry: { industryName: string; count: number }[];
    auditsByType: { auditTypeName: string; count: number }[];
    totalAudits: number;
  }> {
    // Audits by status
    const auditsByStatus = await db
      .select({
        status: schema.audits.status,
        count: sql<number>`count(*)`,
      })
      .from(schema.audits)
      .where(eq(schema.audits.tenantId, tenantId))
      .groupBy(schema.audits.status);

    // Audits by industry
    const auditsByIndustry = await db
      .select({
        industryName: schema.industries.name,
        count: sql<number>`count(*)`,
      })
      .from(schema.audits)
      .leftJoin(
        schema.industries,
        eq(schema.audits.industryId, schema.industries.id),
      )
      .where(eq(schema.audits.tenantId, tenantId))
      .groupBy(schema.industries.name);

    // Audits by audit type
    const auditsByType = await db
      .select({
        auditTypeName: schema.auditTypes.name,
        count: sql<number>`count(*)`,
      })
      .from(schema.audits)
      .leftJoin(
        schema.auditTypes,
        eq(schema.audits.auditTypeId, schema.auditTypes.id),
      )
      .where(eq(schema.audits.tenantId, tenantId))
      .groupBy(schema.auditTypes.name);

    // Total audits
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.audits)
      .where(eq(schema.audits.tenantId, tenantId));

    return {
      auditsByStatus: auditsByStatus.map(
        ({ status, count }: { status: string | null; count: number }) => ({
          status: status || "unknown",
          count: Number(count),
        }),
      ),
      auditsByIndustry: auditsByIndustry.map(
        ({
          industryName,
          count,
        }: {
          industryName: string | null;
          count: number;
        }) => ({
          industryName: industryName || "Unknown",
          count: Number(count),
        }),
      ),
      auditsByType: auditsByType.map(
        ({
          auditTypeName,
          count,
        }: {
          auditTypeName: string | null;
          count: number;
        }) => ({
          auditTypeName: auditTypeName || "Unknown",
          count: Number(count),
        }),
      ),
      totalAudits: Number(totalResult.count),
    };
  }

  async getLeadReports(tenantId: string): Promise<{
    leadsByStatus: { status: string; count: number }[];
    leadsByIndustry: { industryName: string; count: number }[];
    leadsByPriority: { priority: string; count: number }[];
    conversionRate: number;
    totalEstimatedValue: number;
    totalLeads: number;
  }> {
    // Leads by status
    const leadsByStatus = await db
      .select({
        status: schema.leads.status,
        count: sql<number>`count(*)`,
      })
      .from(schema.leads)
      .where(eq(schema.leads.tenantId, tenantId))
      .groupBy(schema.leads.status);

    // Leads by industry
    const leadsByIndustry = await db
      .select({
        industryName: schema.industries.name,
        count: sql<number>`count(*)`,
      })
      .from(schema.leads)
      .leftJoin(
        schema.industries,
        eq(schema.leads.industryId, schema.industries.id),
      )
      .where(eq(schema.leads.tenantId, tenantId))
      .groupBy(schema.industries.name);

    // Leads by priority
    const leadsByPriority = await db
      .select({
        priority: schema.leads.priority,
        count: sql<number>`count(*)`,
      })
      .from(schema.leads)
      .where(eq(schema.leads.tenantId, tenantId))
      .groupBy(schema.leads.priority);

    // Total leads
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.leads)
      .where(eq(schema.leads.tenantId, tenantId));

    // Converted leads
    const [convertedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.leads)
      .where(
        and(
          eq(schema.leads.tenantId, tenantId),
          eq(schema.leads.status, "converted"),
        ),
      );

    // Total estimated value
    const [valueResult] = await db
      .select({ total: sql<number>`sum(${schema.leads.estimatedValue})` })
      .from(schema.leads)
      .where(eq(schema.leads.tenantId, tenantId));

    const totalLeads = Number(totalResult.count);
    const convertedLeads = Number(convertedResult.count);
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      leadsByStatus: leadsByStatus.map(
        ({ status, count }: { status: string | null; count: number }) => ({
          status: status || "unknown",
          count: Number(count),
        }),
      ),
      leadsByIndustry: leadsByIndustry.map(
        ({
          industryName,
          count,
        }: {
          industryName: string | null;
          count: number;
        }) => ({
          industryName: industryName || "Unknown",
          count: Number(count),
        }),
      ),
      leadsByPriority: leadsByPriority.map(
        ({ priority, count }: { priority: string | null; count: number }) => ({
          priority: priority || "unknown",
          count: Number(count),
        }),
      ),
      conversionRate: Number(conversionRate.toFixed(2)),
      totalEstimatedValue: Number(valueResult.total) || 0,
      totalLeads,
    };
  }
}

export const storage = new DbStorage();
