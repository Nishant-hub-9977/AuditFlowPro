import { Router, type Request, type Response } from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateToken,
  type AuthRequest,
} from "./auth";

const router = Router();

// Register new user
router.post("/register", async (req: Request, res: Response) => {
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

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(schema.refreshTokens).values({
      userId: newUser.id,
      token: refreshToken,
      expiresAt,
    });

    // Return user data (without password) and tokens
    const { password, ...userWithoutPassword } = newUser;
    
    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message || "Registration failed" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
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
    const isValidPassword = await comparePassword(data.password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    // Return user data (without password) and tokens
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(400).json({ error: error.message || "Login failed" });
  }
});

// Guest/Demo login - automatically log in as guest user
router.post("/guest-login", async (req: Request, res: Response) => {
  try {
    // Find guest user
    const [guestUser] = await db.select().from(schema.users)
      .where(and(
        eq(schema.users.email, "guest@demo.com"),
        eq(schema.users.isActive, true)
      ))
      .limit(1);

    if (!guestUser) {
      return res.status(404).json({ error: "Guest user not found" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(guestUser);
    const refreshToken = generateRefreshToken(guestUser);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(schema.refreshTokens).values({
      userId: guestUser.id,
      token: refreshToken,
      expiresAt,
    });

    const { password, ...userWithoutPassword } = guestUser;
    
    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Guest login error:", error);
    res.status(500).json({ error: "Guest login failed" });
  }
});

// Refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Check if refresh token exists in database
    const [storedToken] = await db.select().from(schema.refreshTokens)
      .where(and(
        eq(schema.refreshTokens.token, refreshToken),
        eq(schema.refreshTokens.userId, payload.userId)
      ))
      .limit(1);

    if (!storedToken) {
      return res.status(403).json({ error: "Refresh token not found" });
    }

    // Check if token is expired
    if (new Date() > new Date(storedToken.expiresAt)) {
      await db.delete(schema.refreshTokens)
        .where(eq(schema.refreshTokens.id, storedToken.id));
      return res.status(403).json({ error: "Refresh token expired" });
    }

    // Get user
    const [user] = await db.select().from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user || !user.isActive) {
      return res.status(403).json({ error: "User not found or inactive" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(400).json({ error: error.message || "Token refresh failed" });
  }
});

// Logout
router.post("/logout", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token from database
      await db.delete(schema.refreshTokens)
        .where(eq(schema.refreshTokens.token, refreshToken));
    }

    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db.select().from(schema.users)
      .where(eq(schema.users.id, req.user!.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
