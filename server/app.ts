import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "dotenv/config";
import authRouter from "./authRoutes";
import apiRouter from "./routes";
import type { AuthRequest } from "./auth";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Auth routes
app.use("/api/auth", authRouter);

// API routes
app.use("/api", apiRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/whoami", (req, res) => res.json({ demo: process.env.DEMO_MODE, user: (req as AuthRequest).user ?? null }));

if (process.env.NODE_ENV === "development") {
  // Development-specific setup
}

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Global error handler:", err);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

export default app;
