import "dotenv/config";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { tenants, users } from "../shared/schema";

type InsertUser = typeof users.$inferInsert;

async function ensureTenant(): Promise<string> {
  const [tenant] = await db.select().from(tenants).limit(1);
  if (tenant) {
    return tenant.id;
  }

  const [created] = await db
    .insert(tenants)
    .values({
      name: "Demo Organization",
      subdomain: "demo",
      isActive: true,
    })
    .returning();

  return created.id;
}

async function createOrUpdateDemoUser(email: string, password: string, overrides: Partial<InsertUser> = {}) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const tenantId = await ensureTenant();
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
    console.log("Demo user refreshed", email);
    return;
  }

  await db
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
    .onConflictDoNothing();

  console.log("Demo user created", email);
}

async function runSeed(): Promise<void> {
  await createOrUpdateDemoUser("demo@auditflow.pro", "demo1234", {
    username: "demo_admin",
    fullName: "Demo Administrator",
    role: "admin",
  });

  await createOrUpdateDemoUser("guest@auditflow.pro", "guest1234", {
    username: "demo_guest",
    fullName: "Guest Viewer",
    role: "client",
  });

  console.log("Seed complete");
}

runSeed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
