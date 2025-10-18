import express from "express";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { db } from "./db";
import * as schema from "../shared/schema";
import { and, eq } from "drizzle-orm";
import {
  authenticateToken,
  clearAuthCookies,
  comparePasswords,
  getValidRefreshToken,
  hashPassword,
  hashRefreshToken,
  issueTokens,
  persistRefreshToken,
  revokeRefreshToken,
  setAccessCookie,
  setRefreshCookie,
} from "./auth";

const router = express.Router();

type AuthenticatedRequest = ExpressRequest & { user?: import("./auth").TokenPayload };

interface RefreshCookiePayload {
  userId: string;
  token: string;
}

function encodeRefreshCookie(payload: RefreshCookiePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

function decodeRefreshCookie(value: unknown): RefreshCookiePayload | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as Partial<RefreshCookiePayload>;
    if (typeof parsed.userId === "string" && typeof parsed.token === "string") {
      return { userId: parsed.userId, token: parsed.token };
    }
    return null;
  } catch {
    return null;
  }
}

// Register new user
router.post("/register", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const data = schema.registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.select().from(schema.users)
      .where(eq(schema.users.email, data.email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create tenant if tenantName provided, otherwise use default
    let tenantId: string;
    
    if (data.tenantName) {
      const [newTenant] = await db.insert(schema.tenants).values({
        name: data.tenantName,
        isActive: true,
      }).returning();
      tenantId = newTenant.id;
    } else {
      // Use default tenant
      const [defaultTenant] = await db.select().from(schema.tenants)
        .where(eq(schema.tenants.subdomain, "default"))
        .limit(1);
      
      if (!defaultTenant) {
        return res.status(500).json({ error: "Default tenant not found" });
      }
      tenantId = defaultTenant.id;
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const [newUser] = await db.insert(schema.users).values({
      tenantId,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      role: "auditor", // Default role
      isActive: true,
    }).returning();

    const tokens = issueTokens({ id: newUser.id, role: newUser.role, tenantId: newUser.tenantId });
    await persistRefreshToken(newUser.id, await hashRefreshToken(tokens.refreshToken));

    setAccessCookie(res, tokens.accessToken);
    setRefreshCookie(res, encodeRefreshCookie({ userId: newUser.id, token: tokens.refreshToken }));

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message || "Registration failed" });
  }
});

// Login
router.post("/login", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const data = schema.loginSchema.parse(req.body);

    // Find user by email
    const [user] = await db.select().from(schema.users)
      .where(and(
        eq(schema.users.email, data.email),
        eq(schema.users.isActive, true)
      ))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await comparePasswords(data.password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const tokens = issueTokens({ id: user.id, role: user.role, tenantId: user.tenantId });
    await persistRefreshToken(user.id, await hashRefreshToken(tokens.refreshToken));

    setAccessCookie(res, tokens.accessToken);
    setRefreshCookie(res, encodeRefreshCookie({ userId: user.id, token: tokens.refreshToken }));

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Guest/Demo login - automatically log in as guest user
router.post("/guest-login", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    // Find guest user
    const [guestUser] = await db.select().from(schema.users)
      .where(and(
        eq(schema.users.email, "guest@auditflow.pro"),
        eq(schema.users.isActive, true)
      ))
      .limit(1);

    if (!guestUser) {
      return res.status(404).json({ error: "Guest user not found" });
    }

    const tokens = issueTokens({ id: guestUser.id, role: guestUser.role, tenantId: guestUser.tenantId });
    await persistRefreshToken(guestUser.id, await hashRefreshToken(tokens.refreshToken));

    setAccessCookie(res, tokens.accessToken);
    setRefreshCookie(res, encodeRefreshCookie({ userId: guestUser.id, token: tokens.refreshToken }));

    res.status(200).json({
      user: {
        id: guestUser.id,
        email: guestUser.email,
        role: guestUser.role,
      },
    });
  } catch (error: any) {
    console.error("Guest login error:", error);
    res.status(500).json({ error: "Guest login failed" });
  }
});

// Refresh token
router.post("/refresh", async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const cookiePayload = decodeRefreshCookie(req.cookies?.refreshToken);

    if (!cookiePayload) {
      clearAuthCookies(res);
      return res.status(401).json({ error: "Refresh token missing" });
    }

    const record = await getValidRefreshToken(cookiePayload.userId, cookiePayload.token);

    if (!record) {
      clearAuthCookies(res);
      return res.status(401).json({ error: "Refresh token invalid" });
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, cookiePayload.userId))
      .limit(1);

    if (!user || !user.isActive) {
      await revokeRefreshToken(cookiePayload.userId, record.token);
      clearAuthCookies(res);
      return res.status(403).json({ error: "User not found or inactive" });
    }

    await revokeRefreshToken(cookiePayload.userId, record.token);

    const tokens = issueTokens({ id: user.id, role: user.role, tenantId: user.tenantId });
    await persistRefreshToken(user.id, await hashRefreshToken(tokens.refreshToken));

    setAccessCookie(res, tokens.accessToken);
    setRefreshCookie(res, encodeRefreshCookie({ userId: user.id, token: tokens.refreshToken }));

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(400).json({ error: error.message || "Token refresh failed" });
  }
});

// Logout
router.post("/logout", authenticateToken, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const cookiePayload = decodeRefreshCookie(req.cookies?.refreshToken);
    if (cookiePayload) {
      const record = await getValidRefreshToken(cookiePayload.userId, cookiePayload.token);
      if (record) {
        await revokeRefreshToken(cookiePayload.userId, record.token);
      }
    }

    clearAuthCookies(res);
    res.status(204).end();
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Get current user
router.get("/me", authenticateToken, (req: AuthenticatedRequest, res: ExpressResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  res.json({ user: req.user });
});

export default router;
