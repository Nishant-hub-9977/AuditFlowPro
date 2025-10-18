import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "./db";
import { refreshTokens } from "../shared/schema";

const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";
const isProduction = process.env.NODE_ENV === "production";

function requireSecret(name: "JWT_SECRET" | "REFRESH_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

const JWT_SECRET = requireSecret("JWT_SECRET");
const REFRESH_SECRET = requireSecret("REFRESH_SECRET");

export const REFRESH_SECRET_VALUE = REFRESH_SECRET;

export type TokenPayload = {
  userId: string;
  role: string;
  tenantId?: string;
};

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

type RefreshTokenRecord = typeof refreshTokens.$inferSelect;

export function issueTokens(user: {
  id: string;
  role: string;
  tenantId?: string;
}) {
  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId ?? undefined,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = crypto.randomBytes(32).toString("hex");

  return { accessToken, refreshToken };
}

export function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function persistRefreshToken(
  userId: string,
  hashedToken: string,
  ttlDays = 14,
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  await db
    .insert(refreshTokens)
    .values({ userId, token: hashedToken, expiresAt })
    .onConflictDoNothing();
}

export async function revokeRefreshToken(
  userId: string,
  hashedToken: string,
): Promise<void> {
  await db
    .delete(refreshTokens)
    .where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.token, hashedToken),
      ),
    );
}

async function getActiveRefreshTokens(
  userId: string,
): Promise<RefreshTokenRecord[]> {
  const now = new Date();
  return db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.userId, userId), gt(refreshTokens.expiresAt, now)),
    )
    .orderBy(desc(refreshTokens.createdAt));
}

export async function getValidRefreshToken(
  userId: string,
  token: string,
): Promise<RefreshTokenRecord | null> {
  const candidates = await getActiveRefreshTokens(userId);
  for (const entry of candidates) {
    const matches = await bcrypt.compare(token, entry.token);
    if (matches) {
      return entry;
    }
  }
  return null;
}

export async function verifyRefreshToken(
  userId: string,
  token: string,
): Promise<boolean> {
  return (await getValidRefreshToken(userId, token)) !== null;
}

function resolveAuthToken(req: Request): string | undefined {
  const headerToken = req.headers.authorization?.split(" ")[1];
  const cookieToken = req.cookies?.[ACCESS_COOKIE_NAME];
  return headerToken ?? cookieToken;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = resolveAuthToken(req);

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired access token" });
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

function buildCookieOptions(maxAgeSeconds: number, path: string) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isProduction,
    path,
    maxAge: maxAgeSeconds * 1000,
  };
}

export function setAccessCookie(res: Response, token: string): void {
  res.cookie(ACCESS_COOKIE_NAME, token, buildCookieOptions(15 * 60, "/"));
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(
    REFRESH_COOKIE_NAME,
    token,
    buildCookieOptions(14 * 24 * 60 * 60, "/auth"),
  );
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: "/" });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
