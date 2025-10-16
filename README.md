# AuditFlowPro

AuditFlowPro is a full-stack audit and lead management platform built with a React + Vite client and an Express API powered by Drizzle ORM.

## Production Build Notes

- Browserslist targets are specified in `package.json` to silence the previous Browserslist warning while keeping compatibility with modern evergreen browsers.
- Vite occasionally emits a PostCSS `from` warning when third-party plugins omit metadata; this build pins the default configuration and the warning no longer appears in CI. If it resurfaces with future plugins, see <https://github.com/postcss/postcss/wiki/PostCSS-8-for-end-users#how-to-silence-warning-about-source-map> for mitigation options.

## Environment Configuration

The production configuration expects the following variables (see `.env.production`):

```env
API_BASE_URL=https://api.auditflowpro.com
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auditflowpro
JWT_SECRET=please-change-me-in-production
```

Update these values to match your deployment target before building images or running Docker Compose.

## Helpful Commands

- `pnpm run lint` – static analysis with ESLint
- `pnpm run typecheck` – TypeScript project validation
- `pnpm run build` – generates the production client bundle and server artifacts
- `pnpm start` – launches the compiled server (after `pnpm run build`)
- `pnpm preview` – serves the built client for smoke testing

## Deploying to Vercel

The repository ships with a `vercel.json` configuration that builds both the client and API when deployed on Vercel:

1. Ensure the required environment variables (`DATABASE_URL`, `JWT_SECRET`, `REFRESH_SECRET`, etc.) are defined in the Vercel dashboard under **Project Settings → Environment Variables**.
2. Push changes to the `main` branch (or whichever branch is connected to Vercel). The provided `pnpm run build` command performs two steps:
   - `vite build` outputs the static React bundle to `dist/public` for Vercel to serve.
   - `esbuild server/index.ts` bundles the Express app that backs the serverless entry point (`api/index.ts`).
3. Requests under `/api` are handled by the Express serverless function, while all other routes rewrite to the SPA entry (`index.html`) so router-based deep links resolve correctly.
4. If you need a clean deployment, use “Redeploy without cache” in the Vercel UI or run `vercel --prod --force` from the CLI.

## Docker

A multi-stage `Dockerfile` and a `docker-compose.yml` are provided for production deployments that include the application server and a PostgreSQL database. Refer to the comments in those files to tailor resource limits, secrets, and ports for your environment.
