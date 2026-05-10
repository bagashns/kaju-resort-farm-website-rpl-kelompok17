# 🐄 Kaju Resort Farm

<div align="center">

![Kaju Resort Farm](https://img.shields.io/badge/Kaju%20Resort%20Farm-Platform%20Ternak%20Digital-16a34a?style=for-the-badge&logo=leaf&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![EJS](https://img.shields.io/badge/Template-EJS-B4CA65?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind%20CDN-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Platform peternakan digital pertama yang memberikan transparansi harga, kepastian kualitas, dan kemudahan dalam setiap transaksi.**

[Demo](#) · [Fitur](#-fitur) · [Instalasi](#-instalasi) · [Dokumentasi](#-struktur-project)

</div>

---

## 📋 Deskripsi

**Kaju Resort Farm** adalah aplikasi web e-commerce peternakan yang memungkinkan pengguna untuk melihat, mencari, dan membeli hewan ternak (Sapi, Kambing, Domba) secara online. Dibangun sebagai proyek tugas mata kuliah **Rekayasa Perangkat Lunak (RPL)**.

Platform ini menyediakan:
- 🛒 **Katalog produk** hewan ternak dengan filter & pencarian
- 👤 **Sistem autentikasi** untuk pelanggan dan admin
- 🧺 **Keranjang belanja** dan manajemen pesanan
- 💳 **Integrasi pembayaran** via Midtrans
- 🛠️ **Panel admin** untuk manajemen produk & pesanan

---

## ✨ Fitur

### 👥 Untuk Pelanggan
| Fitur | Keterangan |
|---|---|
| 📖 Katalog Ternak | Jelajahi semua hewan ternak yang tersedia dengan filter kategori, harga, bobot, dan urutan |
| 🔍 Pencarian | Cari produk berdasarkan nama atau kategori |
| 🛒 Keranjang Belanja | Tambah, hapus, dan kelola item di keranjang |
| 📦 Riwayat Pesanan | Pantau status pesanan secara real-time |
| 💳 Pembayaran Online | Bayar menggunakan berbagai metode via Midtrans (sandbox) |
| 📤 Upload Bukti Bayar | Upload foto bukti transfer manual |
| 💬 Konsultasi WhatsApp | Hubungi peternak langsung via WhatsApp |

### 🛠️ Untuk Admin
| Fitur | Keterangan |
|---|---|
| 📊 Dashboard | Ringkasan statistik: total produk, pesanan, pelanggan, dan pendapatan |
| 📦 Manajemen Produk | Tambah, edit, hapus produk hewan ternak |
| 🗂️ Manajemen Pesanan | Lihat, verifikasi, dan update status semua pesanan |
| 📁 Upload Gambar | Upload foto produk langsung dari panel admin |

---

## 🏗️ Teknologi yang Digunakan

| Layer | Teknologi |
|---|---|
| **Backend** | Node.js + Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Template Engine** | EJS (Embedded JavaScript) |
| **CSS Framework** | Tailwind CSS (via CDN) |
| **Autentikasi** | express-session + bcryptjs |
| **Payment Gateway** | Midtrans |
| **File Upload** | Multer |
| **Flash Messages** | connect-flash |

---

## 📁 Struktur Project

```
kaju-farm/
│
├── 📄 server.js              # Entry point — setup Express, middleware, routes
├── 📄 database.js            # Konfigurasi Supabase client
├── 📄 midtrans.js            # Konfigurasi Midtrans client
│
├── 📂 routes/
│   ├── auth.js               # Login, register, logout
│   ├── catalog.js            # Katalog produk & detail produk
│   ├── cart.js               # Keranjang belanja
│   ├── orders.js             # Pesanan pelanggan & pembayaran
│   └── admin.js              # Panel admin (produk, pesanan, dashboard)
│
├── 📂 views/
│   ├── home.ejs              # Halaman beranda
│   ├── catalog.ejs           # Halaman katalog produk
│   ├── product-detail.ejs    # Detail produk
│   ├── cart.ejs              # Halaman keranjang
│   ├── login.ejs             # Halaman login
│   ├── register.ejs          # Halaman register
│   ├── 404.ejs               # Halaman not found
│   ├── 📂 partials/
│   │   ├── header.ejs        # Header & navbar
│   │   └── footer.ejs        # Footer
│   ├── 📂 customer/
│   │   └── orders.ejs        # Riwayat pesanan pelanggan
│   └── 📂 admin/
│       ├── dashboard.ejs     # Dashboard admin
│       ├── products.ejs      # Manajemen produk
│       ├── product-form.ejs  # Form tambah/edit produk
│       └── orders.ejs        # Manajemen pesanan admin
│
├── 📂 public/
│   ├── css/style.css         # Custom CSS
│   ├── js/                   # JavaScript client-side
│   ├── images/               # Gambar produk
│   └── uploads/              # Upload bukti pembayaran
│
├── 📂 middleware/            # Middleware autentikasi
│
├── 📄 supabase_schema.sql    # Schema database (jalankan di Supabase SQL Editor)
├── 📄 seed.js                # Data awal (kategori, admin, produk)
├── 📄 seed-dummy.js          # Data dummy tambahan batch 1
├── 📄 seed-dummy2.js         # Data dummy tambahan batch 2 (dengan foto)
│
├── 📄 .env                   # Variabel lingkungan (tidak di-commit)
├── 📄 .gitignore             # File yang dikecualikan dari Git
└── 📄 package.json           # Dependensi dan scripts
```

---

## 🗄️ Skema Database

```sql
users           -- Akun pengguna (admin & customer)
categories      -- Kategori hewan ternak (Sapi, Kambing, Domba)
products        -- Data produk hewan ternak
cart_items      -- Item di keranjang belanja
orders          -- Data pesanan
order_items     -- Item dalam setiap pesanan
```

### Status Pesanan
| Status | Keterangan |
|---|---|
| `menunggu_pembayaran` | Pesanan dibuat, menunggu pembayaran |
| `menunggu_verifikasi` | Bukti bayar sudah dikirim, menunggu konfirmasi admin |
| `lunas` | Pembayaran terkonfirmasi |
| `diproses` | Pesanan sedang diproses peternak |
| `dikirim` | Hewan ternak dalam pengiriman |
| `selesai` | Pesanan selesai |
| `ditolak` | Pesanan ditolak/dibatalkan |

---

## 🚀 Instalasi & Menjalankan Lokal

### Prasyarat
- **Node.js** v18+ — [Download](https://nodejs.org/)
- **Akun Supabase** — [Daftar gratis](https://supabase.com/)
- **Akun Midtrans** (opsional, untuk pembayaran) — [Daftar](https://midtrans.com/)

### Langkah Instalasi

**1. Clone repository**
```bash
git clone https://github.com/username/kaju-farm.git
cd kaju-farm
```

**2. Install dependensi**
```bash
npm install
```

**3. Setup database Supabase**

Masuk ke [Supabase Dashboard](https://app.supabase.com/) → pilih project → buka **SQL Editor**, lalu jalankan isi file `supabase_schema.sql`.

**4. Konfigurasi variabel lingkungan**

Buat file `.env` di root project:
```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key

# Midtrans (opsional - untuk payment gateway)
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Session (opsional - ada default)
SESSION_SECRET=your-secret-key
```

**5. Seed data awal**
```bash
# Data wajib: kategori, akun admin, dan produk awal
npm run seed

# (Opsional) Tambah data dummy lebih banyak
node seed-dummy.js
node seed-dummy2.js
```

**6. Jalankan server**
```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

---

## 🔑 Akun Default

Setelah menjalankan `npm run seed`:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@kajuresort.com | admin123 |
| **Customer** | budi@email.com | customer123 |

> ⚠️ **Penting:** Segera ganti password default setelah instalasi!

---

## 🌐 Halaman & Route

| Route | Method | Deskripsi | Akses |
|---|---|---|---|
| `/` | GET | Beranda | Public |
| `/katalog` | GET | Katalog produk (filter & search) | Public |
| `/katalog/:id` | GET | Detail produk | Public |
| `/login` | GET/POST | Login pengguna | Public |
| `/register` | GET/POST | Registrasi akun | Public |
| `/logout` | POST | Logout | Auth |
| `/keranjang` | GET | Lihat keranjang | Customer |
| `/keranjang/tambah/:id` | POST | Tambah ke keranjang | Customer |
| `/keranjang/hapus/:id` | POST | Hapus dari keranjang | Customer |
| `/pesanan` | GET | Riwayat pesanan | Customer |
| `/pesanan/checkout` | POST | Proses checkout | Customer |
| `/pesanan/:id/bayar` | POST | Upload bukti bayar | Customer |
| `/admin` | GET | Dashboard admin | Admin |
| `/admin/produk` | GET | Manajemen produk | Admin |
| `/admin/produk/tambah` | GET/POST | Tambah produk | Admin |
| `/admin/produk/edit/:id` | GET/POST | Edit produk | Admin |
| `/admin/produk/hapus/:id` | POST | Hapus produk | Admin |
| `/admin/pesanan` | GET | Manajemen pesanan | Admin |
| `/admin/pesanan/:id/status` | POST | Update status pesanan | Admin |
| `/midtrans/notification` | POST | Webhook Midtrans | System |

---

## 💳 Integrasi Midtrans

Project ini menggunakan **Midtrans Sandbox** untuk simulasi pembayaran.

- Mode: **Sandbox** (tidak ada transaksi nyata)
- Untuk testing, gunakan kartu kredit sandbox Midtrans
- Webhook endpoint: `POST /midtrans/notification`

Untuk mengaktifkan mode produksi, ubah `.env`:
```env
MIDTRANS_IS_PRODUCTION=true
```

---

## 📸 Screenshot

> Halaman Beranda, Katalog, dan Panel Admin tersedia setelah menjalankan aplikasi di `http://localhost:3000`.

---

## 🤝 Kontribusi

Project ini adalah tugas akademik. Saran dan masukan tetap diterima melalui Issues.

---

## 📝 Lisensi

Project ini dibuat untuk keperluan tugas kuliah **Rekayasa Perangkat Lunak (RPL)**.

---

<div align="center">

Dibuat dengan ❤️ untuk mata kuliah **RPL** · Kaju Resort Farm © 2026

</div>
