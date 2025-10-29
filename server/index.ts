import "dotenv/config";
import app from "./app";
import type { Request, Response } from "express";

app.get("/", (_req: Request, res: Response) => res.send("AuditFlowPro API is running. Try /api/health"));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✓ API listening on :${PORT}`);
});

server.on("error", (err) => {
    console.error("Server startup error:", err);
});


