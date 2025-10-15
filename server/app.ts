import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from './authRoutes';
import apiRouter from './routes';
import { ViteDevServer } from 'vite';

const app = express();

const allowed = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({ origin: allowed, credentials: true }));

app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);

// API routes
app.use('/api', apiRouter);

if (process.env.NODE_ENV === 'development') {
    // Development-specific setup
}

export default app;
