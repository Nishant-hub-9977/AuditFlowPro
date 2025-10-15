/// <reference types="express" />
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from 'express';
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret-key-change-in-production";

export interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

// Generate access token (15 minutes)
export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

// Generate refresh token (7 days)
export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

// Verify access token
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Auth middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const payload = verifyAccessToken(token);
  
  if (!payload) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = payload;
  next();
}

// Role-based authorization middleware
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Tenant isolation middleware
export function ensureTenantAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // This middleware ensures all queries are scoped to the user's tenant
  // The actual tenant filtering will be done in the storage layer
  next();
}
