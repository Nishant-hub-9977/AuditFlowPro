import { db } from "./db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Default tenant ID for no-auth mode
  const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

  // Get or create default tenant
  console.log("Getting or creating default tenant...");
  
  // First, check if the specific ID exists
  let defaultTenant = await db.select().from(schema.tenants)
    .where(eq(schema.tenants.id, DEFAULT_TENANT_ID))
    .limit(1);

  if (defaultTenant.length === 0) {
    // Check if subdomain "default" exists with a different ID
    const existingDefault = await db.select().from(schema.tenants)
      .where(eq(schema.tenants.subdomain, "default"))
      .limit(1);
    
    if (existingDefault.length > 0) {
      // Delete the old tenant (this will cascade delete all related data)
      console.log("Deleting old default tenant and all related data...");
      await db.delete(schema.tenants)
        .where(eq(schema.tenants.subdomain, "default"));
    }
    
    // Create the new tenant with the specific ID
    const [newTenant] = await db.insert(schema.tenants).values({
      id: DEFAULT_TENANT_ID,
      name: "Default Organization",
      subdomain: "default",
      isActive: true,
    }).returning();
    defaultTenant = [newTenant];
  }

  const tenantId = defaultTenant[0].id;

  // Create default admin user (master_admin role)
  console.log("Creating default master admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(schema.users).values({
    tenantId,
    username: "admin",
    password: hashedPassword,
    fullName: "System Administrator",
    email: "admin@example.com",
    role: "master_admin",
    isActive: true,
  }).onConflictDoNothing();

  // Create demo users with demo123 password
  console.log("Creating demo users...");
  const hashedDemoPassword = await bcrypt.hash("demo123", 10);
  
  // Create admin user (admin role)
  await db.insert(schema.users).values({
    tenantId,
    username: "admin_user",
    password: hashedDemoPassword,
    fullName: "Admin User",
    email: "admin_user@example.com",
    role: "admin",
    isActive: true,
  }).onConflictDoNothing();

  // Create client user
  await db.insert(schema.users).values({
    tenantId,
    username: "client_user",
    password: hashedDemoPassword,
    fullName: "Client User",
    email: "client_user@example.com",
    role: "client",
    isActive: true,
  }).onConflictDoNothing();

  // Create auditor user
  await db.insert(schema.users).values({
    tenantId,
    username: "auditor_user",
    password: hashedDemoPassword,
    fullName: "Auditor User",
    email: "auditor_user@example.com",
    role: "auditor",
    isActive: true,
  }).onConflictDoNothing();

  // Create guest user for demo mode
  console.log("Creating guest user for demo mode...");
  const hashedGuestPassword = await bcrypt.hash("guest123", 10);
  await db.insert(schema.users).values({
    tenantId,
    username: "guest",
    password: hashedGuestPassword,
    fullName: "Guest User",
    email: "guest@demo.com",
    role: "admin", // Give full access for demo
    isActive: true,
  }).onConflictDoNothing();

  // Seed Industries
  const industries = [
    { tenantId, name: "Manufacturing", description: "Manufacturing and production facilities" },
    { tenantId, name: "Healthcare", description: "Healthcare and medical facilities" },
    { tenantId, name: "Retail", description: "Retail stores and shopping centers" },
    { tenantId, name: "Food & Beverage", description: "Restaurants, cafes, and food processing" },
    { tenantId, name: "Construction", description: "Construction sites and infrastructure" },
    { tenantId, name: "Logistics", description: "Warehousing and distribution centers" },
    { tenantId, name: "Education", description: "Schools, colleges, and training centers" },
    { tenantId, name: "Hospitality", description: "Hotels, resorts, and accommodation" },
    { tenantId, name: "Technology", description: "IT companies and data centers" },
    { tenantId, name: "Agriculture", description: "Farms and agricultural facilities" },
  ];

  console.log("Creating industries...");
  for (const industry of industries) {
    await db.insert(schema.industries).values(industry).onConflictDoNothing();
  }

  // Seed Audit Types
  const auditTypes = [
    { tenantId, name: "Safety Audit", description: "Comprehensive workplace safety inspection" },
    { tenantId, name: "Quality Audit", description: "Product and process quality assessment" },
    { tenantId, name: "Environmental Audit", description: "Environmental compliance and sustainability audit" },
    { tenantId, name: "Compliance Audit", description: "Regulatory and legal compliance audit" },
    { tenantId, name: "Financial Audit", description: "Financial controls and accounting audit" },
    { tenantId, name: "Operational Audit", description: "Operational efficiency and process audit" },
    { tenantId, name: "Security Audit", description: "Physical and information security audit" },
    { tenantId, name: "Fire Safety Audit", description: "Fire safety systems and procedures audit" },
  ];

  console.log("Creating audit types...");
  for (const auditType of auditTypes) {
    await db.insert(schema.auditTypes).values(auditType).onConflictDoNothing();
  }

  // Get the first audit type for sample checklist
  const [safetyAuditType] = await db.select().from(schema.auditTypes).where(
    eq(schema.auditTypes.name, "Safety Audit")
  ).limit(1);

  if (safetyAuditType) {
    console.log("Creating sample checklist...");
    
    // Create a sample Safety Audit checklist
    const [checklist] = await db.insert(schema.checklists).values({
      tenantId,
      name: "General Safety Audit Checklist",
      auditTypeId: safetyAuditType.id,
      isActive: true,
    }).returning();

    if (checklist) {
      console.log("Creating checklist items...");
      
      // Sample checklist items
      const checklistItems = [
        { checklistId: checklist.id, question: "Are fire extinguishers properly located and accessible?", category: "Fire Safety", orderIndex: 1 },
        { checklistId: checklist.id, question: "Are emergency exits clearly marked and unobstructed?", category: "Fire Safety", orderIndex: 2 },
        { checklistId: checklist.id, question: "Are employees wearing appropriate PPE?", category: "Personal Safety", orderIndex: 3 },
        { checklistId: checklist.id, question: "Are work areas clean and free from hazards?", category: "Housekeeping", orderIndex: 4 },
        { checklistId: checklist.id, question: "Are safety signs and labels clearly visible?", category: "Signage", orderIndex: 5 },
        { checklistId: checklist.id, question: "Are electrical panels properly covered and labeled?", category: "Electrical Safety", orderIndex: 6 },
        { checklistId: checklist.id, question: "Are chemical storage areas properly ventilated?", category: "Chemical Safety", orderIndex: 7 },
        { checklistId: checklist.id, question: "Are machinery guards in place and functioning?", category: "Machine Safety", orderIndex: 8 },
        { checklistId: checklist.id, question: "Is first aid equipment readily available?", category: "Emergency Preparedness", orderIndex: 9 },
        { checklistId: checklist.id, question: "Are safety procedures documented and accessible?", category: "Documentation", orderIndex: 10 },
      ];

      for (const item of checklistItems) {
        await db.insert(schema.checklistItems).values(item);
      }
    }
  }

  // Get Quality Audit type for another sample checklist
  const [qualityAuditType] = await db.select().from(schema.auditTypes).where(
    eq(schema.auditTypes.name, "Quality Audit")
  ).limit(1);

  if (qualityAuditType) {
    console.log("Creating quality audit checklist...");
    
    const [qualityChecklist] = await db.insert(schema.checklists).values({
      tenantId,
      name: "ISO 9001 Quality Management Checklist",
      auditTypeId: qualityAuditType.id,
      isActive: true,
    }).returning();

    if (qualityChecklist) {
      const qualityItems = [
        { checklistId: qualityChecklist.id, question: "Are quality objectives documented and measurable?", category: "Quality Planning", orderIndex: 1 },
        { checklistId: qualityChecklist.id, question: "Is there a documented quality management system?", category: "Documentation", orderIndex: 2 },
        { checklistId: qualityChecklist.id, question: "Are quality records maintained and accessible?", category: "Record Keeping", orderIndex: 3 },
        { checklistId: qualityChecklist.id, question: "Are inspection procedures followed consistently?", category: "Quality Control", orderIndex: 4 },
        { checklistId: qualityChecklist.id, question: "Is there a process for handling non-conforming products?", category: "Non-Conformance", orderIndex: 5 },
        { checklistId: qualityChecklist.id, question: "Are customer complaints tracked and resolved?", category: "Customer Satisfaction", orderIndex: 6 },
        { checklistId: qualityChecklist.id, question: "Is corrective action process effective?", category: "Continuous Improvement", orderIndex: 7 },
        { checklistId: qualityChecklist.id, question: "Are suppliers evaluated and monitored?", category: "Supplier Management", orderIndex: 8 },
      ];

      for (const item of qualityItems) {
        await db.insert(schema.checklistItems).values(item);
      }
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("📝 Demo user credentials:");
  console.log("   Master Admin: admin@example.com / admin123");
  console.log("   Admin: admin_user@example.com / demo123");
  console.log("   Client: client_user@example.com / demo123");
  console.log("   Auditor: auditor_user@example.com / demo123");
  console.log("   Guest: Use 'Try Demo' button on login page");
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
