# Sosmed Monitoring Backend

Express API, Prisma schema, BullMQ workers, scheduler, and Playwright scraping skeleton for Instagram engagement monitoring.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:dev
npm run dev
```

Set `DATABASE_URL` to Supabase PostgreSQL. This project does not run a local PostgreSQL container.

## Docker

```bash
docker compose up --build
```

Services:

- `backend`
- `redis`
- `worker`
- `scheduler`

## Instagram Session

```bash
npm run instagram:login
```

The scraper uses `storage_state.json`. If the session is missing or expired, scraping jobs fail with a clear error and require manual login again.
