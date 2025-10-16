import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction,
} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "@shared/schema";

function getRequiredEnv(name: "JWT_SECRET" | "REFRESH_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

let cachedJwtSecret: string | null = null;
let cachedRefreshSecret: string | null = null;

function getJwtSecret(): string {
  if (!cachedJwtSecret) {
    cachedJwtSecret = getRequiredEnv("JWT_SECRET");
  }

  return cachedJwtSecret;
}

function getRefreshSecret(): string {
  if (!cachedRefreshSecret) {
    cachedRefreshSecret = getRequiredEnv("REFRESH_SECRET");
  }

  return cachedRefreshSecret;
}

export interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends ExpressRequest {
  user?: TokenPayload;
}

export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
}

export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getRefreshSecret(), { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
  const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "string" || !decoded) {
      return null;
    }

    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
  const decoded = jwt.verify(token, getRefreshSecret());
    if (typeof decoded === "string" || !decoded) {
      return null;
    }

    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function authenticateToken(
  req: AuthRequest,
  res: ExpressResponse,
  next: ExpressNextFunction,
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = payload;
  next();
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (
    req: AuthRequest,
    res: ExpressResponse,
    next: ExpressNextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

export function ensureTenantAccess(
  req: AuthRequest,
  res: ExpressResponse,
  next: ExpressNextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  next();
}
