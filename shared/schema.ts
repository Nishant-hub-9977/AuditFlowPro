import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role types
export const userRoles = ["master_admin", "admin", "client", "auditor"] as const;
export type UserRole = typeof userRoles[number];

// Tenants table for multi-tenancy
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subdomain: text("subdomain").unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("auditor"), // master_admin, admin, client, auditor
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Industries master data
export const industries = pgTable("industries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit Types master data
export const auditTypes = pgTable("audit_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Checklists (templates)
export const checklists = pgTable("checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  auditTypeId: varchar("audit_type_id").references(() => auditTypes.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Checklist Items
export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checklistId: varchar("checklist_id").notNull().references(() => checklists.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  category: text("category"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audits
export const audits = pgTable("audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  auditNumber: text("audit_number").notNull(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  siteLocation: text("site_location").notNull(),
  industryId: varchar("industry_id").references(() => industries.id),
  auditTypeId: varchar("audit_type_id").references(() => auditTypes.id),
  auditorId: varchar("auditor_id").references(() => users.id),
  auditorName: text("auditor_name").notNull(),
  auditDate: timestamp("audit_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, review, approved, closed, rejected
  geoLocation: text("geo_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit Checklist Responses
export const auditChecklistResponses = pgTable("audit_checklist_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").notNull().references(() => audits.id, { onDelete: 'cascade' }),
  checklistItemId: varchar("checklist_item_id").notNull().references(() => checklistItems.id),
  response: varchar("response", { length: 50 }).notNull(), // yes, no, na, partial
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Observations
export const observations = pgTable("observations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").notNull().references(() => audits.id, { onDelete: 'cascade' }),
  category: text("category").notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 50 }).notNull(), // critical, high, medium, low
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Business Intelligence Data
export const businessIntelligence = pgTable("business_intelligence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").notNull().references(() => audits.id, { onDelete: 'cascade' }),
  marketPotential: varchar("market_potential", { length: 50 }),
  competitorPresence: text("competitor_presence"),
  customerFeedback: text("customer_feedback"),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leads
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  leadNumber: text("lead_number").notNull(),
  auditId: varchar("audit_id").references(() => audits.id),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  industryId: varchar("industry_id").references(() => industries.id),
  status: varchar("status", { length: 50 }).notNull().default("new"), // new, qualified, in_progress, converted, closed
  priority: varchar("priority", { length: 50 }).notNull().default("medium"), // low, medium, high, urgent
  estimatedValue: integer("estimated_value"),
  notes: text("notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Files/Attachments
export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // audit, lead, observation
  entityId: varchar("entity_id").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Follow-up Actions
export const followUpActions = pgTable("follow_up_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").notNull().references(() => audits.id, { onDelete: 'cascade' }),
  action: text("action").notNull(),
  assignedTo: text("assigned_to").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Refresh Tokens for JWT management
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas and types
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  role: z.enum(userRoles).default("auditor"),
});

export const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  createdAt: true,
});

export const insertAuditTypeSchema = createInsertSchema(auditTypes).omit({
  id: true,
  createdAt: true,
});

export const insertChecklistSchema = createInsertSchema(checklists).omit({
  id: true,
  createdAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  createdAt: true,
});

export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditChecklistResponseSchema = createInsertSchema(auditChecklistResponses).omit({
  id: true,
  createdAt: true,
});

export const insertObservationSchema = createInsertSchema(observations).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessIntelligenceSchema = createInsertSchema(businessIntelligence).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
});

export const insertFollowUpActionSchema = createInsertSchema(followUpActions).omit({
  id: true,
  createdAt: true,
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  username: z.string().min(3),
  tenantName: z.string().min(1).optional(),
});

// Select types
export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type AuditType = typeof auditTypes.$inferSelect;
export type Checklist = typeof checklists.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type Audit = typeof audits.$inferSelect;
export type AuditChecklistResponse = typeof auditChecklistResponses.$inferSelect;
export type Observation = typeof observations.$inferSelect;
export type BusinessIntelligence = typeof businessIntelligence.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type File = typeof files.$inferSelect;
export type FollowUpAction = typeof followUpActions.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;

// Insert types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type InsertAuditType = z.infer<typeof insertAuditTypeSchema>;
export type InsertChecklist = z.infer<typeof insertChecklistSchema>;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type InsertAuditChecklistResponse = z.infer<typeof insertAuditChecklistResponseSchema>;
export type InsertObservation = z.infer<typeof insertObservationSchema>;
export type InsertBusinessIntelligence = z.infer<typeof insertBusinessIntelligenceSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type InsertFollowUpAction = z.infer<typeof insertFollowUpActionSchema>;

// Auth types
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
