import "dotenv/config";
import bcrypt from "bcrypt";
import { eq, and } from "drizzle-orm";
import { db } from "../server/db";
import { tenants, users, industries, auditTypes, leads, audits } from "../shared/schema";

type InsertUser = typeof users.$inferInsert;

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

async function ensureTenant(): Promise<string> {
  const [existing] = await db.select().from(tenants).where(eq(tenants.id, DEMO_TENANT_ID)).limit(1);
  if (existing) return existing.id;

  const [tenant] = await db
    .insert(tenants)
    .values({
      id: DEMO_TENANT_ID,
      name: "Demo Organization",
      subdomain: "demo",
      isActive: true,
    })
    .returning();

  return tenant.id;
}

async function createOrUpdateDemoUser(email: string, password: string, overrides: Partial<InsertUser> = {}) {
  const tenantId = await ensureTenant();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await db
      .update(users)
      .set({
        password: passwordHash,
        isActive: true,
        ...overrides,
      })
      .where(eq(users.id, existing.id));
    console.log("✓ Demo user refreshed:", email);
    return existing;
  }

  const [user] = await db
    .insert(users)
    .values({
      tenantId,
      username: overrides.username ?? email.split("@")[0],
      password: passwordHash,
      fullName: overrides.fullName ?? "Demo User",
      email,
      role: overrides.role ?? "admin",
      isActive: true,
    })
    .returning();

  console.log("✓ Demo user created:", email);
  return user;
}

async function seedDemo(): Promise<void> {
  await db.transaction(async (tx) => {
    const tenantId = await ensureTenant();

    // 1) Ensure users exist
    const admin = await createOrUpdateDemoUser("demo@auditflow.pro", "demo1234", {
      username: "demo_admin",
      fullName: "Demo Administrator",
      role: "admin",
    });

    await createOrUpdateDemoUser("guest@auditflow.pro", "guest1234", {
      username: "demo_guest",
      fullName: "Guest Viewer",
      role: "client",
    });

    // 2) Seed industries
    const industryNames = [
      "Technology",
      "Manufacturing",
      "Healthcare",
      "Retail",
      "Finance",
      "Logistics",
    ];

    for (const name of industryNames) {
      await tx
        .insert(industries)
        .values({ tenantId, name })
        .onConflictDoNothing();
    }
    console.log(`✓ Seeded ${industryNames.length} industries`);

    // 3) Seed audit types
    const typeNames = [
      "ISO 9001",
      "ISO 27001",
      "HIPAA",
      "GDPR",
      "SOC 2",
      "Internal",
    ];

    for (const name of typeNames) {
      await tx
        .insert(auditTypes)
        .values({ tenantId, name })
        .onConflictDoNothing();
    }
    console.log(`✓ Seeded ${typeNames.length} audit types`);

    // 4) Helper to fetch ID by name
    async function industryIdByName(name: string) {
      const [row] = await tx
        .select({ id: industries.id })
        .from(industries)
        .where(and(eq(industries.name, name), eq(industries.tenantId, tenantId)))
        .limit(1);
      return row?.id;
    }

    async function auditTypeIdByName(name: string) {
      const [row] = await tx
        .select({ id: auditTypes.id })
        .from(auditTypes)
        .where(and(eq(auditTypes.name, name), eq(auditTypes.tenantId, tenantId)))
        .limit(1);
      return row?.id;
    }

    // 5) Seed leads (10 mixed statuses)
    const sampleLeads = [
      {
        companyName: "Acme Tech",
        contactPerson: "Riya Shah",
        email: "riya@acme.io",
        phone: "+1-555-0101",
        status: "new" as const,
        priority: "high" as const,
        industryName: "Technology",
      },
      {
        companyName: "MFG Dynamics",
        contactPerson: "Arjun Mehta",
        email: "arjun@mfg.com",
        phone: "+1-555-0102",
        status: "in_progress" as const,
        priority: "high" as const,
        industryName: "Manufacturing",
      },
      {
        companyName: "CarePlus",
        contactPerson: "Dr Patel",
        email: "patel@careplus.health",
        phone: "+1-555-0103",
        status: "converted" as const,
        priority: "medium" as const,
        industryName: "Healthcare",
        estimatedValue: 50000,
      },
      {
        companyName: "RetailX",
        contactPerson: "Neha Jain",
        email: "neha@retailx.store",
        phone: "+1-555-0104",
        status: "closed" as const,
        priority: "low" as const,
        industryName: "Retail",
      },
      {
        companyName: "FinGuard",
        contactPerson: "Karan Shah",
        email: "karan@finguard.fin",
        phone: "+1-555-0105",
        status: "new" as const,
        priority: "urgent" as const,
        industryName: "Finance",
      },
      {
        companyName: "LogiPro",
        contactPerson: "Meera Iyer",
        email: "meera@logipro.io",
        phone: "+1-555-0106",
        status: "in_progress" as const,
        priority: "high" as const,
        industryName: "Logistics",
        estimatedValue: 75000,
      },
      {
        companyName: "TechZen",
        contactPerson: "Sahil Rana",
        email: "sahil@techzen.dev",
        phone: "+1-555-0107",
        status: "new" as const,
        priority: "medium" as const,
        industryName: "Technology",
      },
      {
        companyName: "RetailHub",
        contactPerson: "Asha Nair",
        email: "asha@retailhub.store",
        phone: "+1-555-0108",
        status: "in_progress" as const,
        priority: "medium" as const,
        industryName: "Retail",
        estimatedValue: 40000,
      },
      {
        companyName: "MediServe",
        contactPerson: "Dr Singh",
        email: "singh@mediserve.health",
        phone: "+1-555-0109",
        status: "converted" as const,
        priority: "high" as const,
        industryName: "Healthcare",
        estimatedValue: 120000,
      },
      {
        companyName: "FinAxis",
        contactPerson: "Ishita Rao",
        email: "ishita@finaxis.fin",
        phone: "+1-555-0110",
        status: "closed" as const,
        priority: "medium" as const,
        industryName: "Finance",
      },
    ];

    for (const l of sampleLeads) {
      const industryId = await industryIdByName(l.industryName);
      await tx
        .insert(leads)
        .values({
          tenantId,
          leadNumber: `LEAD-${Math.random().toString(36).substring(7).toUpperCase()}`,
          companyName: l.companyName,
          contactPerson: l.contactPerson,
          email: l.email,
          phone: l.phone,
          industryId,
          status: l.status,
          priority: l.priority,
          estimatedValue: l.estimatedValue ?? null,
          assignedTo: admin.id,
        })
        .onConflictDoNothing();
    }
    console.log(`✓ Seeded ${sampleLeads.length} leads`);

    // 6) Seed audits (5, within ±45 days)
    const now = new Date();
    const days = (n: number) =>
      new Date(now.getTime() + n * 24 * 3600 * 1000);

    const iso9001Id = await auditTypeIdByName("ISO 9001");
    const iso27001Id = await auditTypeIdByName("ISO 27001");
    const hipaaId = await auditTypeIdByName("HIPAA");

    const sampleAudits = [
      {
        auditNumber: "AUD-001",
        customerId: "CUST-001",
        customerName: "Acme Tech",
        siteLocation: "San Francisco, CA",
        auditTypeId: iso9001Id,
        status: "draft" as const,
        auditDate: days(10),
      },
      {
        auditNumber: "AUD-002",
        customerId: "CUST-002",
        customerName: "MFG Dynamics",
        siteLocation: "Detroit, MI",
        auditTypeId: iso27001Id,
        status: "review" as const,
        auditDate: days(30),
      },
      {
        auditNumber: "AUD-003",
        customerId: "CUST-003",
        customerName: "CarePlus",
        siteLocation: "Boston, MA",
        auditTypeId: hipaaId,
        status: "approved" as const,
        auditDate: days(-14),
      },
      {
        auditNumber: "AUD-004",
        customerId: "CUST-004",
        customerName: "RetailX",
        siteLocation: "New York, NY",
        auditTypeId: iso9001Id,
        status: "draft" as const,
        auditDate: days(5),
      },
      {
        auditNumber: "AUD-005",
        customerId: "CUST-005",
        customerName: "FinGuard",
        siteLocation: "Chicago, IL",
        auditTypeId: iso27001Id,
        status: "closed" as const,
        auditDate: days(-2),
      },
    ];

    for (const a of sampleAudits) {
      await tx
        .insert(audits)
        .values({
          tenantId,
          auditNumber: a.auditNumber,
          customerId: a.customerId,
          customerName: a.customerName,
          siteLocation: a.siteLocation,
          auditTypeId: a.auditTypeId,
          auditorId: admin.id,
          auditorName: admin.fullName,
          auditDate: a.auditDate,
          status: a.status,
        })
        .onConflictDoNothing();
    }
    console.log(`✓ Seeded ${sampleAudits.length} audits`);
  });

  console.log("\n✅ Seed complete!\n");
}

seedDemo()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
