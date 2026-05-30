# Instagram Engagement Monitoring Dashboard - Backend

Backend Express TypeScript untuk MVP **Instagram Engagement Monitoring Dashboard**.

Sistem ini memantau apakah 11 akun wajib sudah memberikan engagement berupa like dan comment ke post terbaru akun target Instagram.

## Fokus MVP

- Platform hanya Instagram
- Engagement hanya:
  - Like
  - Comment
- Monitored account: 11 akun wajib
- Target account: akun DPC/DPD/DPP/official
- Backend menyediakan API dashboard, queue worker, scheduler, scoring, dan Playwright scraping skeleton

## Stack

- Express.js
- TypeScript
- Prisma ORM
- Supabase PostgreSQL
- Redis
- BullMQ
- Playwright Node.js
- Docker Compose

## Struktur Folder

```text
backend/
├── prisma/
│   └── schema.prisma
├── session/
│   └── .gitkeep
├── src/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── queues/
│   ├── routes/
│   ├── scheduler/
│   ├── scraping/
│   ├── services/
│   ├── utils/
│   ├── workers/
│   ├── app.ts
│   └── server.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Database

Backend memakai **Supabase PostgreSQL** melalui `DATABASE_URL`.

Penting:

- Tidak ada PostgreSQL container lokal.
- Docker Compose hanya menjalankan backend, Redis, worker, dan scheduler.
- Database tetap connect ke Supabase PostgreSQL.

## Tables

Prisma schema berisi:

- `monitored_accounts`
- `target_accounts`
- `instagram_posts`
- `engagements`
- `account_post_status`
- `scrape_jobs`

Enum utama:

- `EngagementType`: `LIKE`, `COMMENT`
- `PostStatus`: `COMPLETE`, `LIKE_ONLY`, `COMMENT_ONLY`, `MISSING`
- `ScrapeJobType`: `POST_DISCOVERY`, `ENGAGEMENT_FETCH`, `SCORING`
- `ScrapeJobStatus`: `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`

## Scoring

- Like = 1
- Comment = 3

Status engagement per post:

- `COMPLETE`: sudah like dan comment
- `LIKE_ONLY`: baru like
- `COMMENT_ONLY`: baru comment
- `MISSING`: belum like dan belum comment

## Environment Variables

Copy file example:

```bash
cp .env.example .env
```

Isi environment:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=1"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=4000
NODE_ENV=development
INSTAGRAM_STORAGE_STATE=./storage_state.json
SCHEDULER_DISCOVER_CRON_MS=900000
SCHEDULER_ENGAGEMENT_CRON_MS=1200000
SCHEDULER_SCORING_CRON_MS=600000
```

## Setup Supabase

1. Buat project di Supabase.
2. Buka **Project Settings > Database**.
3. Copy connection string PostgreSQL.
4. Masukkan ke `.env` sebagai `DATABASE_URL`.
5. Pastikan connection string menggunakan SSL, misalnya `sslmode=require`.
6. Untuk Supabase session pooler, tambahkan `connection_limit=1` supaya backend, worker, dan scheduler tidak cepat memenuhi batas koneksi free/shared pooler.

## Install Dependency

```bash
npm install
```

## Generate Prisma Client

```bash
npm run prisma:generate
```

## Migrasi Database

Untuk development:

```bash
npm run prisma:dev
```

Untuk deployment atau environment production-like:

```bash
npm run prisma:migrate
```

## Menjalankan Lokal

API:

```bash
npm run dev
```

Worker:

```bash
npm run worker:dev
```

Scheduler:

```bash
npm run scheduler:dev
```

API health:

```text
http://localhost:4000/health
```

## Menjalankan Dengan Docker Compose

Pastikan `.env` sudah ada dan `DATABASE_URL` sudah terisi.

```bash
docker compose up --build
```

Services:

- `backend`
- `redis`
- `worker`
- `scheduler`

API:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

## API Endpoints

Health:

- `GET /health`

Dashboard:

- `GET /api/overview`
- `GET /api/ranking`

Monitored accounts:

- `GET /api/monitored-accounts`
- `POST /api/monitored-accounts`
- `PUT /api/monitored-accounts/:id`
- `DELETE /api/monitored-accounts/:id`

Target accounts:

- `GET /api/target-accounts`
- `POST /api/target-accounts`
- `PUT /api/target-accounts/:id`
- `DELETE /api/target-accounts/:id`

Posts:

- `GET /api/posts`
- `POST /api/posts/track`
- `GET /api/posts/:id/status`

Jobs:

- `POST /api/jobs/discover-posts`
- `POST /api/jobs/fetch-engagements`
- `POST /api/jobs/recalculate-score`

## Worker System

Queue:

- `post-discovery`
- `engagement-fetch`
- `scoring`

Worker functions:

- `discoverInstagramPosts(targetAccountId)`
- `fetchPostEngagement(postId)`
- `recalculatePostStatus(postId)`
- `recalculateAllScores()`

Untuk akun target yang memiliki ratusan post, gunakan `POST /api/posts/track` dengan URL post tertentu. Dengan cara ini admin tidak perlu discovery seluruh timeline; post yang dipilih langsung masuk `instagram_posts` dan bisa diproses oleh `POST /api/jobs/fetch-engagements` menggunakan `postId`.

BullMQ job behavior:

- Retry mechanism
- Exponential backoff
- Failed job handling
- Simple JSON logging
- Job status stored in `scrape_jobs`

## Scheduler

Scheduler melakukan enqueue otomatis:

- Check new posts
- Fetch engagements
- Recalculate score

Interval dikontrol lewat:

- `SCHEDULER_DISCOVER_CRON_MS`
- `SCHEDULER_ENGAGEMENT_CRON_MS`
- `SCHEDULER_SCORING_CRON_MS`

## Playwright Instagram Session

Scraper tidak menyimpan credential Instagram.

Generate session manual:

```bash
npm run instagram:login
```

Langkah:

1. Browser Playwright terbuka.
2. Login Instagram manual.
3. Selesaikan verifikasi normal jika ada.
4. Kembali ke terminal.
5. Tekan Enter.
6. `storage_state.json` tersimpan sesuai `INSTAGRAM_STORAGE_STATE`.

Untuk Docker Compose, copy session ke folder mounted:

```bash
mkdir session
copy storage_state.json session\storage_state.json
```

## Scraping Status

Sudah ada:

- `InstagramScraper.loadSession()`
- `InstagramScraper.discoverPosts(username)`
- Error handling session missing
- Error handling session expired
- Guard untuk private/unavailable account

Extractor engagement:

- `InstagramScraper.fetchLikes(postUrl)`
- `InstagramScraper.fetchComments(postUrl)`

Keduanya memakai Playwright UI extraction dengan session valid. Extractor membuka post, membaca komentar yang terlihat setelah scroll terbatas, lalu membuka modal likes dan scroll terbatas untuk membaca username. Karena UI Instagram bisa berubah, hasil tetap perlu divalidasi berkala dengan akun worker dan target public.

## Batasan Scraping

- Jangan scrape private account.
- Jangan bypass CAPTCHA.
- Jangan fake engagement.
- Jangan hardcode credential.
- Jangan login berulang-ulang.
- Gunakan persistent Playwright session.
- Jika session expired, login manual ulang.

## Git Branch

Repo backend ini dipush ke branch:

```text
BE
```

Remote:

```text
https://github.com/YafiRiifdah/Sosmed_Monitoring.git
```

## Catatan

- Jangan commit `.env`.
- Jangan commit `node_modules`.
- Jangan commit `dist`.
- Jangan commit `storage_state.json`.
- Jangan commit `session/storage_state.json`.
