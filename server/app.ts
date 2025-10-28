import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "dotenv/config";
import authRouter from "./authRoutes";
import apiRouter from "./routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:4173",
      "http://localhost:3000",
      "http://0.0.0.0:4173",
      "http://127.0.0.1:4173",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Auth routes
app.use("/api/auth", authRouter);

// API routes
app.use("/api", apiRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

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
