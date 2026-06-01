# Alur Kerja & Arsitektur Sistem Sosmed Monitoring

Dokumen ini menjelaskan alur lengkap (flow) data, fungsi, arsitektur teknis, serta detail spesifikasi sistem yang digunakan dalam proyek **Social Media Monitoring & Engagement Tracking System**.

---

## 🛠️ Spesifikasi Sistem & Teknologi Utama

Proyek ini dibangun menggunakan kombinasi teknologi modern berskala industri (*enterprise-grade*) untuk menjamin kestabilan, performa, dan kemudahan skalabilitas:

*   **Frontend Dashboard (React + Vite + Tailwind CSS + TypeScript)**:
    Menyediakan antarmuka pengguna (UI) premium yang responsif untuk memantau status secara *real-time*. Vite digunakan sebagai bundler cepat, dan Tailwind CSS untuk desain estetika tinggi.
*   **Backend API (Node.js + Express + TypeScript)**:
    REST API server yang melayani semua request dari frontend, melakukan validasi skema input dengan Zod, dan berkomunikasi dengan database serta broker antrean.
*   **Database & ORM (PostgreSQL + Prisma ORM)**:
    Penyimpanan data relasional yang andal. Menggunakan Supabase PostgreSQL di cloud untuk performa tinggi, diakses secara aman dan cepat menggunakan Prisma ORM.
*   **Queue & Job Broker (Redis + BullMQ)**:
    Sistem antrean asinkron untuk menangani scraping media sosial. BullMQ di Node.js membagi beban komputasi berat ke container worker terpisah, menggunakan Redis sebagai media penyimpanan antrean super cepat.
*   **Browser Automation & Evasion (Playwright + Playwright Stealth)**:
    Digunakan untuk merayap (*crawling*) daftar komentar postingan secara gratis. Dilengkapi dengan argumen stealth khusus untuk menyamarkan browser otomatis agar menyerupai aktivitas manusia asli.

---

## 🌐 Integrasi RapidAPI (Pengambilan Likes Aman & Cepat)

Instagram menerapkan keamanan yang sangat ketat untuk mendeteksi *headless browser* (browser tanpa UI visual) saat mencoba membuka dialog daftar penyuka (likes) postingan. Akun worker yang minim interaksi atau belum dipercaya oleh Instagram akan langsung diblokir atau disembunyikan daftar likes-nya.

Untuk mengatasi limitasi tersebut secara andal di level produksi, **sistem ini mengintegrasikan API pihak ketiga melalui portal RapidAPI**.

### 🌟 Mengapa Menggunakan RapidAPI?
1.  **Kebal Blokir Instagram**: Request ke RapidAPI ditangani oleh ribuan proxy perumahan (*residential proxies*) berkualitas tinggi dari penyedia API, sehingga Instagram tidak akan pernah memblokir server Anda.
2.  **Sangat Cepat**: Ekstraksi likes yang membutuhkan waktu hingga puluhan detik di browser kini selesai dalam milidetik via REST API HTTP Fetch biasa.
3.  **API Global Terpilih**: Proyek ini menggunakan **"Instagram API – Fast & Reliable Data Scraper"** di platform RapidAPI yang telah teruji mengembalikan 100% data likes valid.
4.  **Efisiensi Biaya (Free-Plan Ready)**: Sistem disetel dengan mode **Opsi B (Manual Fetch)**, sehingga kuota gratis 100 request/bulan dari RapidAPI Anda akan bertahan sangat lama karena request hanya dipakai saat Anda melakukan evaluasi berkala di dashboard.

---

## 🗺️ Diagram Alur (System Flowchart)

```mermaid
graph TD
    %% Define Nodes
    A[User / Frontend Dashboard] -->|1. Trigger Manual Fetch| B(Backend Express API)
    
    %% Jobs & Redis
    B -->|2. Antrikan Job| C[Redis Queue - BullMQ]
    C -->|3. Ambil Job| D[Worker Container]
    
    %% Scraping Logic
    subgraph Scraping & Crawling Engine
        D -->|4a. Cek API Key| E{RAPIDAPI_KEY Aktif?}
        
        %% Likes Path
        E -->|Ya - Sangat Cepat| F[Offline Decoder: Shortcode ke Media ID]
        F -->|Request REST| G[RapidAPI - Fast & Reliable Scraper]
        G -->|Kembalikan Daftar Likers| H[Likes Parser]
        
        E -->|Tidak - Fallback| I[Headless Playwright Browser]
        I -->|Klik Likes Dialog & Scroll| H
        
        %% Comments Path
        D -->|4b. Crawl Komentar| J[Playwright Browser Engine]
        J -->|Ekstrak Teks & Usernames| K[Comments Parser]
      
        H --> L[Gabungkan Data Interaksi]
        K --> L
    end

    %% Matching & Database
    L -->|5. Cocokkan Username Monitored| M[Matching Engine]
    M -->|6. Simpan Data| N[(Database PostgreSQL - Supabase)]
    
    %% Scoring System
    N -->|7. Pemicu Kalkulasi Skor| O[Scoring Service]
    O -->|8. Hitung Nilai Interaksi| P{Kriteria Terpenuhi?}
    P -->|Like = 1 pt| Q[likeScore]
    P -->|Comment = 3 pt| R[commentScore]
    
    Q --> S[Total Score & Post Status Update]
    R --> S
    S -->|9. Selesai| T[(Database & Dashboard Terupdate)]
```

---

## 📈 Sistem Penilaian & Status (Scoring & Status Logic)

Setiap anggota (Monitored Account) yang terpantau berinteraksi pada postingan target akan diberikan nilai berdasarkan aturan berikut:

| Jenis Interaksi | Poin | Aturan Penilaian |
| :--- | :---: | :--- |
| **Like** (Menyukai Postingan) | **1** | Akun terdaftar di daftar penyuka postingan target yang ditarik dari **RapidAPI**. |
| **Comment** (Memberi Komentar) | **3** | Akun menulis komentar pada postingan target yang dirayap dari **Playwright**. |
| **Skor Maksimal** | **4** | Kombinasi Like (1) + Comment (3) = **Skor Sempurna (4)** |

### 🏷️ Status Postingan pada Dashboard:
Berdasarkan pencapaian poin di atas, sistem akan mengklasifikasikan status interaksi akun anggota menjadi:
* 🟢 **COMPLETE** (Poin 4): Akun melakukan **Like** dan **Comment** (Skor Sempurna).
* 🟡 **COMMENT_ONLY** (Poin 3): Akun **hanya memberi komentar** (Like belum dilakukan/terdeteksi).
* 🔵 **LIKE_ONLY** (Poin 1): Akun **hanya memberikan like** (Komentar belum dilakukan/terdeteksi).
* 🔴 **NONE** (Poin 0): Akun **tidak melakukan interaksi** apapun.

---

## 🔁 Penjelasan Alur Kerja Langkah-demi-Langkah

### Langkah 1: Registrasi Akun di Sistem
* **Target Account**: Akun Instagram utama yang ingin dipantau postingannya (contoh: `@yapp.rz`).
* **Monitored Account**: Akun-akun anggota/pekerja yang wajib berinteraksi (like & comment) pada postingan target tersebut (contoh: `@sukajepre.t`).

### Langkah 2: Pemicuan Proses Ekstraksi (Fetch Trigger)
Proses pencarian interaksi dapat dipicu dengan dua cara:
1. **Manual Trigger (Opsi Terpilih & Hemat Kuota)**: User mengklik tombol *Sync/Fetch* di dashboard, yang mengirimkan request POST ke API `/api/jobs/fetch-engagements`.
2. **Automatic Background (Dimatikan/0 ms)**: Scheduler berjalan otomatis berdasarkan durasi interval waktu tertentu.

### Langkah 3: Ekstrak Komentar (Comments Scraping)
* Worker meluncurkan headless browser **Playwright** yang dilengkapi modul **Stealth Evasion** (penyamaran bot agar tidak terdeteksi Instagram).
* Browser membuka link postingan target, mensimulasikan gerakan mouse alami, lalu mengekstrak semua data komentar dari halaman web.

### Langkah 4: Ekstrak Likes dengan Sistem Hybrid (Likes Scraping)
Likes memiliki tantangan ekstra karena Instagram membatasi dialog likes pada browser headless. Oleh karena itu, kita menerapkan **Sistem Hybrid Cerdas**:

```
                  ┌────────────────────────┐
                  │      Ekstrak Likes     │
                  └───────────┬────────────┘
                              │
                    Cek RAPIDAPI_KEY di .env
                              │
             ┌────────────────┴────────────────┐
             ▼ Ya                              ▼ Tidak (Fallback)
┌─────────────────────────┐          ┌─────────────────────────┐
│  Terjemahkan Shortcode  │          │   Headless Playwright   │
│  matematis ke Media ID  │          │   Browser simulasi klik │
│   (Lokal & microseconds)│          │   & dialog scrolling    │
└────────────┬────────────┘          └────────────┬────────────┘
             ▼                                    │
┌─────────────────────────┐                       │
│ Panggil REST API dengan │                       │
│    Active Key & ID      │                       │
└────────────┬────────────┘                       │
             ▼                                    ▼
┌──────────────────────────────────────────────────────────────┐
│                  Gabungkan data ke Parser                    │
└──────────────────────────────────────────────────────────────┘
```

* **Jalur API (Cepat & Kebal Blokir)**: Sistem mengambil shortcode post (contoh: `CsdVI7qhOf-`), menerjemahkannya secara matematis menjadi ID numerik database Instagram (`3106732290752178174`), lalu melakukan hit REST API super cepat ke server RapidAPI.
* **Jalur Playwright (Cadangan)**: Jika API Key tidak dikonfigurasi, sistem otomatis beralih ke simulasi browser (klik tombol jumlah like dan scroll modal box likes).

### Langkah 5: Pencocokan Akun & Penyimpanan Database
Sistem membandingkan semua daftar penilai (likes & comments) yang berhasil diekstrak dengan daftar **Monitored Account** yang aktif di sistem kita. 
* Data interaksi yang cocok disimpan ke tabel `Engagement`.
* Waktu pengambilan data dicatat pada kolom `engagementFetchedAt`.

### Langkah 6: Perhitungan Skor Akhir & Pembaruan Dashboard
* `scoringService` mendeteksi data interaksi baru, menghitung bobot nilai (Like = 1, Comment = 3), memperbarui status pencapaian (`COMPLETE`, `COMMENT_ONLY`, dll.), dan menyimpannya ke tabel `PostStatus`.
* Dashboard frontend langsung menampilkan status interaksi terbaru beserta indikator warna status masing-masing anggota.

---

## 🔄 Rencana Masa Depan: Optimalisasi & Skalabilitas Sistem Scraping

Untuk mendukung pemantauan berskala besar secara gratis selamanya dengan tingkat stabilitas 100%, kami telah merancang rencana arsitektur tingkat tinggi berbasis ide orisinal Anda:

### 1. Rotasi API Key Otomatis (RapidAPI)
*   **Konsep**: Mendaftarkan banyak API Key gratisan di `.env` yang dipisahkan dengan koma:
    ```env
    RAPIDAPI_KEY=key_akun_1,key_akun_2,key_akun_3,key_akun_4
    ```
*   **Mekanisme**: Scraper memproses array kunci secara berurutan (*Sequential Fallback*). Jika kunci saat ini mengembalikan status `403` atau `429` (kehabisan kuota 100 request), scraper langsung beralih menggunakan kunci berikutnya di detik yang sama tanpa memotong proses crawling.

### 2. Rantai Cadangan 3-Tingkat (RapidAPI + Apify + Playwright Failover)
*   **Konsep**: Menggabungkan dua penyedia API scraping berbayar (RapidAPI dan Apify) secara bergantian berbasis prioritas, dengan browser lokal sebagai pertahanan terakhir.
*   **Alur Kerja**:
    ```text
    [Mulai Crawling Likes]
              │
    Coba Jalur 1: RapidAPI (Dihitung per Request - Prioritas Utama)
              │
      ┌───────┴───────┐
    Sukses          Gagal / Habis Kuota
      │               │
      ▼               ▼
    Selesai         Coba Jalur 2: Apify Scraper (Dihitung per Liker - Cadangan)
                      │
              ┌───────┴───────┐
            Sukses          Gagal / Habis Kredit
              │               │
              ▼               ▼
            Selesai         Jalur 3: Playwright Local (Gratis - Pertahanan Terakhir)
    ```
*   **Keuntungan**:
    *   **Uptime Terjamin**: Menghindari kegagalan jika salah satu penyedia API mengalami *downtime*.
    *   **Nol Biaya (Zero Cost)**: Menguras kuota gratis bulanan RapidAPI dahulu, kemudian kuota kredit gratis $5.00 Apify, dan barulah menggunakan Playwright lokal. Semua berjalan otomatis secara gratis!

### 3. Dashboard Monitor Kredit & Pemakaian API (API Credit Monitor Widget)
*   **Konsep**: Menampilkan sisa kuota dan status pemakaian API dari RapidAPI dan Apify secara visual langsung di Dashboard Utama Admin (Overview) tanpa perlu login ke konsol eksternal.
*   **Dukungan Skala Banyak Akun (Multi-Account / Key Pooling)**:
    Jika admin mendaftarkan banyak akun gratisan di `.env` untuk melakukan rotasi, sistem akan mengelola dan menggabungkan datanya secara cerdas menggunakan tabel database relasional **`ApiKeyStatus`**:
    *   **RapidAPI (Multi-Key Caching)**:
        Setiap kali scraper selesai berjalan menggunakan salah satu kunci dari array, backend menangkap header respon `X-RateLimit-Requests-Remaining` kunci tersebut, lalu memperbarui sisa kuota khusus untuk baris kunci tersebut di database. Di Dashboard utama, sisa kuota akan dijumlahkan (*SUM*) dari semua kunci aktif (misal: `Total: 242 / 400 Requests` dari 4 akun aktif).
    *   **Apify (Multi-Token Query)**:
        Backend melakukan query berkala (secara background loop) ke REST API resmi Apify untuk setiap token akun yang terdaftar, mengambil sisa saldo kredit gratis dari masing-masing akun, dan menggabungkannya sebagai total saldo gabungan (misal: `$11.20 / $15.00` dari 3 akun Apify aktif).
*   **Keuntungan**: Admin memiliki transparansi penuh terhadap status kesehatan dan masa aktif kuota dari puluhan akun gratisan secara terpusat langsung dari layar lokal, mempermudah manajemen kapasitas tanpa pusing memantau konsol eksternal.
