import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create default tenant
  console.log("Creating default tenant...");
  const [defaultTenant] = await db.insert(schema.tenants).values({
    name: "Default Organization",
    subdomain: "default",
    isActive: true,
  }).returning().onConflictDoNothing();

  const tenantId = defaultTenant.id;

  // Create default admin user
  console.log("Creating default admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(schema.users).values({
    tenantId,
    username: "admin",
    password: hashedPassword,
    fullName: "System Administrator",
    email: "admin@example.com",
    role: "admin",
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
  console.log("📝 Default admin credentials:");
  console.log("   Email: admin@example.com");
  console.log("   Password: admin123");
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
