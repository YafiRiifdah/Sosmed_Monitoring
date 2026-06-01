# 📂 Registri Akun Scraper (RapidAPI & Apify)

Folder ini digunakan untuk mencatat, mengelola, dan mendokumentasikan daftar akun **RapidAPI** dan **Apify** yang Anda miliki (baik akun pribadi maupun akun hasil "ternak" untuk meningkatkan limit scraping gratis).

Dengan mencatat akun secara terstruktur di sini, Anda dapat dengan mudah melakukan sortir, pelacakan tanggal pembuatan, email yang digunakan, serta status kesehatan akun untuk mempermudah pemecahan masalah (*troubleshooting*).

---

## 📄 File Registri Utama
*   **Path File**: [`accounts_registry.json`](file:///d:/syifak/Project/sosmed_monitoring/backend/accounts/accounts_registry.json)
*   **Format Data**: JSON Array of Objects

### 🛠️ Spesifikasi Field (Skema Data)
Setiap akun terdaftar wajib memiliki atribut berikut:
| Nama Field | Tipe Data | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `id` | String | ID Unik untuk penanda akun | `"rapidapi-01"`, `"apify-02"` |
| `provider` | String | Penyedia API (`rapidapi` atau `apify`) | `"rapidapi"`, `"apify"` |
| `accountName` | String | Nama panggung/alias untuk identifikasi | `"RapidAPI Farm 02 (Ternak)"` |
| `email` | String | Email yang digunakan saat registrasi akun | `"farm02@example.com"` |
| `apiKey` | String | API Key/Token rahasia akun tersebut | `"f7240b5aecmsh97b8...e0c1"` |
| `createdAt` | String | Tanggal pembuatan akun (YYYY-MM-DD) | `"2026-06-01"` |
| `status` | String | Status akun saat ini (`active`, `inactive`, `exhausted`) | `"active"` |
| `notes` | String | Catatan khusus untuk mempermudah troubleshooting | `"Reset Kuota: Tanggal 1 setiap bulan"` |

---

## 🔍 Panduan Troubleshooting & Pemeliharaan Akun

Jika terjadi kegagalan pengambilan data likes pada proses scraping, Anda dapat mencocokkan status di dashboard dengan daftar di registri ini:

### 1. Error `429 Too Many Requests` (Kehabisan Kuota)
*   **Masalah**: Kuota gratis bulanan (100 request untuk RapidAPI atau $5.00 kredit gratis untuk Apify) telah habis terpakai.
*   **Tindakan**:
    1. Ubah `status` akun yang bersangkutan di `accounts_registry.json` menjadi `"exhausted"`.
    2. Salin `apiKey` dari akun berstatus `"active"` berikutnya di registri Anda.
    3. Perbarui variabel `RAPIDAPI_KEY` di file [`.env`](file:///d:/syifak/Project/sosmed_monitoring/backend/.env) backend dengan kunci baru tersebut.
    4. Lakukan restart container backend.

### 2. Error `403 Forbidden` / Invalid API Key
*   **Masalah**: Kunci API diblokir, salah ketik, atau akun ditangguhkan oleh RapidAPI/Apify karena terdeteksi penyalahgunaan.
*   **Tindakan**:
    1. Buka situs konsol provider dan coba masuk menggunakan `email` yang terdaftar pada registri.
    2. Jika akun diblokir permanen, ubah `status` di registri menjadi `"inactive"` atau tambahkan catatan pada kolom `notes`.
    3. Hapus kunci tersebut dari daftar rotasi aktif Anda.

### 3. Pemantauan Reset Kuota Bulanan
*   **Tips**: Akun gratis RapidAPI biasanya mereset kuota 100 request mereka tepat 30 hari setelah tanggal registrasi/pembuatan (`createdAt`), atau pada tanggal 1 setiap bulan tergantung jenis API. Catat tanggal reset ini di kolom `notes` agar Anda tahu kapan akun tersebut dapat digunakan kembali!

---

## 📈 Rencana Pengembangan Skalabilitas Masa Depan
Setelah Anda memiliki puluhan akun ternak, backend sistem dapat dikembangkan untuk membaca file JSON ini secara dinamis untuk melakukan:
1.  **Rotasi Otomatis Tingkat Lanjut**: Mengambil semua akun yang berstatus `active` dari `accounts_registry.json` dan melakukan rotasi tanpa perlu mengubah file `.env` secara manual.
2.  **Dashboard Sinkronisasi Massal**: Menampilkan daftar akun lengkap dari file registri ini langsung di halaman **"API Quota"** dashboard frontend!
