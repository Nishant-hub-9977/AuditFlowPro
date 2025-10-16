import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../server/app";

const handler = serverless(app);

export default function vercelHandler(req: VercelRequest, res: VercelResponse) {
	return handler(req as any, res as any);
}
