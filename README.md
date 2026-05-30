# Instagram Engagement Monitoring Dashboard - Frontend

Frontend React untuk MVP **Instagram Engagement Monitoring Dashboard**.

Dashboard ini dipakai admin untuk memantau apakah 11 akun wajib sudah melakukan engagement ke akun target Instagram.

## Fokus MVP

- Platform: Instagram
- Engagement: like dan comment
- Monitored account: 11 akun wajib
- Target account: akun DPC/DPD/DPP/official
- Dashboard admin untuk melihat status engagement, completion percentage, post detail, dan ranking

## Stack

- React.js
- Vite
- TypeScript
- TailwindCSS
- Lucide React icons
- Docker Compose

## Struktur Folder

```text
frontend/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Halaman Dashboard

1. Overview
   - Total target accounts
   - Total posts
   - Total monitored accounts
   - Total completed engagement
   - Total incomplete engagement
   - Completion percentage
   - Trigger job discover, fetch, dan scoring

2. Target Accounts
   - List target account
   - Add/edit/delete
   - Active status

3. Monitored Accounts
   - List monitored account
   - Add/edit/delete
   - Active status

4. Posts
   - List post
   - Track specific Instagram post URL
   - Target account
   - Caption preview
   - Post date
   - Engagement percentage
   - Trigger fetch engagement for selected post

5. Post Detail
   - Username
   - Liked
   - Commented
   - Score
   - Status: `COMPLETE`, `LIKE_ONLY`, `COMMENT_ONLY`, `MISSING`

6. Ranking
   - Username
   - Total likes
   - Total comments
   - Total score
   - Completion percentage

## Environment Variables

Copy file example:

```bash
cp .env.example .env
```

Isi environment:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Jika frontend dijalankan lewat Docker, nilai default `VITE_API_BASE_URL` adalah:

```text
http://localhost:4000
```

## Install Dependency

```bash
npm install
```

## Menjalankan Development Server

Pastikan backend berjalan di `http://localhost:4000`.

```bash
npm run dev
```

Dashboard:

```text
http://localhost:3000
```

## Build Production

```bash
npm run build
```

Output build ada di:

```text
dist/
```

## Menjalankan Dengan Docker Compose

```bash
docker compose up --build
```

Dashboard:

```text
http://localhost:3000
```

Compose frontend hanya menjalankan service `frontend`. Backend harus dijalankan terpisah dari branch/folder backend.

## Integrasi Backend

Frontend memakai API backend berikut:

- `GET /api/overview`
- `GET /api/ranking`
- `GET /api/monitored-accounts`
- `POST /api/monitored-accounts`
- `PUT /api/monitored-accounts/:id`
- `DELETE /api/monitored-accounts/:id`
- `GET /api/target-accounts`
- `POST /api/target-accounts`
- `PUT /api/target-accounts/:id`
- `DELETE /api/target-accounts/:id`
- `GET /api/posts`
- `POST /api/posts/track`
- `GET /api/posts/:id/status`
- `POST /api/jobs/discover-posts`
- `POST /api/jobs/fetch-engagements`
- `POST /api/jobs/recalculate-score`

## Git Branch

Repo frontend ini dipush ke branch:

```text
main
```

Remote:

```text
https://github.com/YafiRiifdah/Sosmed_Monitoring.git
```

## Catatan

- Jangan commit `.env`.
- Jangan commit `node_modules`.
- Jangan commit `dist`.
- Frontend tidak menyimpan credential Instagram.
- Scraping Instagram ada di backend, bukan di frontend.
