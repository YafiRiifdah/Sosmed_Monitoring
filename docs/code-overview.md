# Dokumentasi Fungsi Kode

Dokumen ini menjelaskan fungsi folder dan file penting pada backend project Instagram Engagement Monitoring Dashboard. Fokusnya adalah membantu menjelaskan isi kode backend: file apa dipakai untuk apa, bagaimana alur API berjalan, dan bagian mana yang menjalankan scraping, queue, scoring, serta akses database.

## Gambaran Umum

Aplikasi backend bertugas sebagai pusat logic sistem.

Backend menyediakan:

- REST API untuk dashboard admin.
- Prisma ORM untuk akses Supabase PostgreSQL.
- BullMQ queue untuk job asynchronous.
- Worker untuk discover post, fetch engagement, dan scoring.
- Scheduler untuk menjalankan job otomatis.
- Playwright scraper untuk mengambil data Instagram.

Data utama disimpan di Supabase PostgreSQL melalui Prisma. Redis dipakai untuk queue BullMQ agar proses scraping dan scoring berjalan di background.

### Entry Point

#### `src/server.ts`

Menjalankan HTTP server Express. File ini mengambil port dari environment lalu menjalankan `app`.

#### `src/app.ts`

Konfigurasi utama aplikasi Express.

Fungsi utamanya:

- Mengaktifkan CORS.
- Mengaktifkan JSON body parser.
- Menambahkan request logger.
- Menyediakan endpoint `GET /health`.
- Memasang semua route API dari `routes/index.ts`.
- Memasang middleware error handler.

### Config

#### `src/config/env.ts`

Membaca dan memvalidasi environment variable memakai `dotenv` dan `zod`.

Contoh nilai yang dibaca:

- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `INSTAGRAM_STORAGE_STATE`
- `INSTAGRAM_DISCOVERY_POST_LIMIT`
- `AUTO_FETCH_POST_LIMIT`
- `SCRAPE_DELAY_MS`
- konfigurasi RapidAPI opsional.

### Database

#### `src/database/prisma.ts`

Membuat instance Prisma Client yang dipakai service lain untuk query database.

#### `prisma/schema.prisma`

Mendefinisikan struktur database.

Model penting:

- `MonitoredAccount`: akun wajib PAC.
- `TargetAccount`: akun target Instagram.
- `InstagramPost`: postingan dari akun target.
- `Engagement`: hasil like/comment yang terdeteksi.
- `AccountPostStatus`: status engagement setiap akun wajib PAC untuk setiap post.
- `ScrapeJob`: status job queue.

Enum penting:

- `EngagementType`: `LIKE`, `COMMENT`.
- `PostStatus`: `COMPLETE`, `LIKE_ONLY`, `COMMENT_ONLY`, `LIKE_UNAVAILABLE`, `MISSING`.
- `LikeFetchStatus`: `UNKNOWN`, `AVAILABLE`, `UNAVAILABLE`.
- `ScrapeJobType`: jenis job.
- `ScrapeJobStatus`: status job.

### Routes

#### `src/routes/index.ts`

Pusat pendaftaran endpoint API.

File ini menghubungkan endpoint seperti:

- `GET /api/overview`
- `GET /api/ranking`
- `GET /api/posts`
- `POST /api/posts/track`
- `GET /api/posts/:id/status`
- CRUD akun target.
- CRUD akun wajib PAC.
- Job discover, fetch engagement, dan scoring.

Route dibungkus dengan `asyncHandler` agar error async masuk ke middleware error handler.

### Controllers

Controller menerima request HTTP, validasi input, lalu memanggil service. Logic bisnis utama tetap berada di service.

#### `src/controllers/accountControllers.ts`

Mengatur request untuk akun wajib PAC dan akun target.

Fungsi utamanya:

- Validasi input akun dengan `zod`.
- Membersihkan username dari awalan `@`.
- Mengubah username menjadi lowercase.
- CRUD akun wajib PAC.
- Bulk import akun wajib PAC.
- CRUD akun target.

Object yang diexport:

- `monitoredAccountController`
- `targetAccountController`

#### `src/controllers/dashboardController.ts`

Mengatur request data dashboard.

Fungsi utamanya:

- Mengambil overview dashboard.
- Mengambil daftar postingan.
- Mengambil status engagement per post.
- Mengambil ranking akun wajib PAC.

#### `src/controllers/jobController.ts`

Mengatur request untuk membuat dan mengecek job background.

Fungsi utamanya:

- Membuat job discover posts.
- Membuat job fetch engagements.
- Membuat job recalculate score.
- Mengambil status job berdasarkan ID.

#### `src/controllers/postController.ts`

Mengatur tracking post manual.

Fungsi utamanya:

- Validasi `targetAccountId`.
- Validasi `postUrl`.
- Memanggil `postService.trackPost`.

### Services

Service berisi logic utama aplikasi dan biasanya berinteraksi langsung dengan database atau queue.

#### `src/services/accountService.ts`

Service untuk akun wajib PAC dan akun target.

Fungsi utamanya:

- Mengambil daftar akun wajib PAC.
- Membuat, update, dan delete akun wajib PAC.
- Bulk upsert akun wajib PAC.
- Mengambil daftar akun target.
- Membuat, update, dan delete akun target.

#### `src/services/dashboardService.ts`

Service untuk menyusun data dashboard.

Fungsi utamanya:

- Menghitung total akun target.
- Menghitung total post.
- Menghitung total akun wajib PAC.
- Menghitung complete/incomplete engagement.
- Menghitung completion percentage.
- Membuat daftar post.
- Membuat detail status post.
- Membuat ranking akun wajib PAC.

#### `src/services/postService.ts`

Service untuk tracking post manual.

Fungsi utamanya:

- Mengambil shortcode dari URL Instagram.
- Menormalisasi URL `/p/{shortcode}` atau `/reel/{shortcode}`.
- Memastikan target account valid.
- Membuat atau memperbarui `InstagramPost`.
- Menandai post sebagai `isManuallyTracked`.

#### `src/services/jobService.ts`

Service untuk memasukkan job ke BullMQ.

Fungsi utamanya:

- Membuat record `ScrapeJob`.
- Menambahkan job ke queue:
  - `post-discovery`
  - `engagement-fetch`
  - `scoring`
- Mengambil status job berdasarkan ID.

#### `src/services/instagramJobService.ts`

Service utama untuk proses scraping Instagram.

Fungsi utamanya:

- Discover post dari akun target.
- Fetch engagement post tertentu atau post yang belum pernah dicek.
- Mengambil metadata post.
- Mengambil likes dan comments lewat `InstagramScraper`.
- Mencocokkan hasil scraping dengan akun wajib PAC.
- Menyimpan hasil match ke tabel `engagements`.
- Mengatur `likeFetchStatus`.
- Memanggil scoring setelah fetch selesai.
- Mengubah status `ScrapeJob` menjadi running, completed, atau failed.

#### `src/services/scoringService.ts`

Service untuk menghitung status engagement.

Fungsi utamanya:

- Membaca semua akun wajib PAC aktif.
- Membaca engagement yang tersimpan untuk suatu post.
- Menghitung score:
  - Like = 1
  - Comment = 3
- Menentukan status:
  - `COMPLETE`
  - `LIKE_ONLY`
  - `COMMENT_ONLY`
  - `LIKE_UNAVAILABLE`
  - `MISSING`
- Menyimpan hasil ke `account_post_status`.

### Scraping

#### `src/scraping/InstagramScraper.ts`

Class utama untuk scraping Instagram menggunakan Playwright.

Fungsi utamanya:

- Membaca session Instagram dari `storage_state.json`.
- Discover post terbaru akun target.
- Membuka post Instagram.
- Mengambil metadata post seperti caption dan tanggal.
- Mengambil daftar like.
- Mengambil daftar komentar.
- Menyimpan debug artifact jika scraping gagal.

Catatan:

- Tidak memakai hardcoded credential.
- Login dilakukan manual dan disimpan sebagai storage state.
- Jika session expired, admin perlu login ulang.
- Jika daftar like tidak bisa diambil, sistem memakai `LIKE_UNAVAILABLE`.
- Scraper dapat membuka post lewat profile grid/SPA navigation untuk mengurangi risiko 429.

#### `src/scraping/saveInstagramSession.ts`

Script untuk login Instagram manual.

Fungsi utamanya:

- Membuka browser Playwright.
- Admin login manual.
- Menyimpan session ke `storage_state.json`.

### Queues

#### `src/queues/index.ts`

Konfigurasi BullMQ dan Redis.

Fungsi utamanya:

- Membuat koneksi Redis.
- Membuat queue:
  - `post-discovery`
  - `engagement-fetch`
  - `scoring`
- Mengatur retry dan backoff.

### Workers

#### `src/workers/index.ts`

Worker BullMQ.

Fungsi utamanya:

- Menjalankan job discover posts.
- Menjalankan job fetch engagement.
- Menjalankan job scoring.
- Mengubah status scrape job.
- Menulis log started/completed/failed.

Worker Playwright memakai concurrency rendah agar scraping tidak terlalu agresif.

### Scheduler

#### `src/scheduler/index.ts`

Scheduler otomatis.

Fungsi utamanya:

- Menjadwalkan discover posts.
- Menjadwalkan fetch engagements.
- Menjadwalkan recalculate score.

Interval dikontrol dari environment variable.

### Middleware

#### `src/middleware/errorHandler.ts`

Middleware untuk menangani error API.

Fungsi utamanya:

- Menangkap error dari route/controller/service.
- Mengembalikan response JSON error.
- Menangani error validasi `zod`.

### Utils

#### `src/utils/asyncHandler.ts`

Helper untuk membungkus async route handler Express.

Fungsi utamanya:

- Menghindari `try/catch` berulang.
- Meneruskan error async ke `errorHandler`.

#### `src/utils/logger.ts`

Helper logging.

Fungsi utamanya:

- Menstandarkan format log.
- Dipakai oleh worker, scheduler, dan service.

### File Development

#### `src/check_likes_final.ts`

Script debug untuk mengecek data post tertentu dari database.

File ini bukan bagian utama runtime aplikasi.

## Alur Sistem

### Menambah Akun Target

1. Client memanggil `POST /api/target-accounts`.
2. Route masuk ke `targetAccountController.create`.
3. Controller validasi input.
4. `accountService.createTarget` menyimpan data ke database.

### Menambah Akun Wajib PAC

1. Client memanggil `POST /api/monitored-accounts` atau `POST /api/monitored-accounts/bulk`.
2. Route masuk ke `monitoredAccountController`.
3. Controller membersihkan username.
4. `accountService` menyimpan data ke database.

### Discover Post

1. Admin klik Discover atau scheduler berjalan.
2. `jobService` membuat `ScrapeJob`.
3. Job masuk ke queue `post-discovery`.
4. Worker menjalankan `instagramJobService.discoverInstagramPosts`.
5. Scraper mengambil post akun target.
6. Post disimpan ke `instagram_posts`.

### Track Post Manual

1. Admin memilih target dan memasukkan URL post.
2. Client memanggil `POST /api/posts/track`.
3. `postService.trackPost` mengambil shortcode.
4. Post disimpan atau diperbarui.
5. Post ditandai `isManuallyTracked`.

### Fetch Engagement

1. Admin klik Fetch atau scheduler berjalan.
2. `jobService` membuat job `ENGAGEMENT_FETCH`.
3. Worker menjalankan `instagramJobService.fetchPostEngagement`.
4. Scraper mengambil likes dan comments.
5. Sistem mencocokkan hasil dengan akun wajib PAC.
6. Hasil match disimpan ke `engagements`.
7. Scoring dijalankan.

### Scoring

1. `scoringService` membaca akun wajib PAC aktif.
2. Service membaca data engagement post.
3. Score dihitung.
4. Status disimpan ke `account_post_status`.

## Catatan Penting

- Folder `dist` adalah hasil build dan biasanya tidak diedit manual.
- File `.env` tidak boleh dipush.
- File `storage_state.json` tidak boleh dipush karena berisi session Instagram.
- Folder `debug` tidak perlu dipush.
- Scraping Instagram bisa berubah karena UI/proteksi Instagram sering berubah.
- Jika like list tidak bisa diambil, sistem memakai `LIKE_UNAVAILABLE` agar status tidak menyesatkan.
