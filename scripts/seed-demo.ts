import "dotenv/config";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { tenants, users } from "../shared/schema";

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

async function seedDemoUser(): Promise<void> {
  const email = "demo@auditflow.pro";
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    console.log("Demo user already present", email);
    return;
  }

  const tenantId = await ensureTenant();
  const passwordHash = await bcrypt.hash("demo1234", 10);

  await db
    .insert(users)
    .values({
      tenantId,
      username: "demo_admin",
      password: passwordHash,
      fullName: "Demo Administrator",
      email,
      role: "admin",
      isActive: true,
    })
    .onConflictDoNothing();

  console.log("Demo user created", email);
}

seedDemoUser()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
