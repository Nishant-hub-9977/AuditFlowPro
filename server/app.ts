import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "dotenv/config";
import authRouter from "./authRoutes";
import apiRouter from "./routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
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

export default app;
