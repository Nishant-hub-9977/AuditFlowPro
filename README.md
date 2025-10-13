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

## Docker

A multi-stage `Dockerfile` and a `docker-compose.yml` are provided for production deployments that include the application server and a PostgreSQL database. Refer to the comments in those files to tailor resource limits, secrets, and ports for your environment.
