// api/index.ts
import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../server/app';

// Vercel hint: don’t parse body twice
export const config = { api: { bodyParser: false } };

export default serverless(app);
