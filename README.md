# 🌿 Kaju Resort Farm - Platform Jual Beli Hewan Ternak Premium

Selamat datang di repositori **Kaju Resort Farm**, sebuah platform e-commerce modern berbasis web yang dirancang khusus untuk mempermudah transaksi jual beli hewan ternak (seperti Sapi, Kambing, dan Domba) berkualitas unggul langsung dari peternakan Kaju Resort Farm.

Proyek ini dibangun sebagai bagian dari tugas besar mata kuliah **Rekayasa Perangkat Lunak (RPL) - Kelompok 17 (Paralel 4)**.

---

## ✨ Fitur Utama

### 🛒 Sisi Pelanggan (Customer)
* **Katalog Ternak Premium:** Pencarian interaktif dengan sistem filter cerdas berdasarkan kategori, rentang harga, pencarian teks, serta fitur pengurutan (harga terendah/tertinggi, terberat, terbaru).
* **Detail Produk Mendalam:** Informasi spesifikasi hewan ternak yang komprehensif mulai dari bobot asli (Kg), umur, jenis kelamin, status kesehatan, deskripsi, hingga konsultasi instan via WhatsApp.
* **Keranjang Belanja (Interactive Cart):** Proses tambah keranjang yang halus dengan efek animasi loading interaktif tanpa mengganggu kenyamanan navigasi katalog.
* **Sistem Pembayaran Otomatis (Midtrans Snap):** Integrasi pembayaran multi-channel (Transfer Bank/VA, E-Wallet, Kartu Kredit) secara langsung tanpa perlu konfirmasi manual.
* **Riwayat Pesanan:** Pantau status transaksi secara real-time dari "Menunggu Pembayaran", "Lunas", "Sedang Dikirim", hingga "Selesai".
* **Pembatalan Mandiri:** Pelanggan dapat membatalkan pesanan yang belum dibayar secara langsung, yang otomatis membebaskan kembali hewan ternak terkait agar tersedia di katalog.

### 🛡️ Sisi Admin (Admin Panel)
* **Dashboard Statistik:** Ringkasan performa penjualan, total pengguna, jumlah produk, dan total pesanan.
* **Manajemen Produk (CRUD):** Tambah, ubah, hapus, dan upload gambar hewan ternak dengan mudah.
* **Manajemen Kategori:** Pengelolaan rumpun ternak yang dinamis.
* **Verifikasi Pesanan:** Pengawasan status pembayaran dan logistik pengiriman.
* **Laporan Penjualan:** Ekspor data penjualan untuk analisis keuangan berkala.

---

## 🛠️ Teknologi yang Digunakan

* **Framework Utama:** [Next.js (App Router)](https://nextjs.org/) & **TypeScript**
* **Styling & UI:** [TailwindCSS](https://tailwindcss.com/) dengan pendekatan modern *glassmorphism* & harmoni warna hijau emerald.
* **Database & Otentikasi:** [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
* **Payment Gateway:** [Midtrans API (Snap SDK)](https://midtrans.com/) untuk otomatisasi pembayaran yang aman.
* **Icons & Font:** FontAwesome v6 & Google Fonts (Outfit & Inter).

---

## 🚀 Panduan Memulai (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda.

### 1. Prasyarat
Pastikan Anda sudah menginstal aplikasi berikut:
* [Node.js](https://nodejs.org/) (Versi 18 ke atas)
* Akun [Supabase](https://supabase.com/) (untuk basis data)
* Akun [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/) (untuk testing pembayaran)

### 2. Kloning Repositori
```bash
git clone https://github.com/bagashns/kaju-resort-farm-website-rpl-kelompok17.git
cd kaju-resort-farm-website-rpl-kelompok17
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables (`.env`)
Buat file bernama `.env` di direktori utama (root) proyek Anda dan isi konfigurasi berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Midtrans Configuration
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

# App Encryption/Session Secret
SESSION_SECRET=your-random-session-secret-string
```

### 5. Menjalankan Server Pengembangan
Jalankan perintah berikut untuk mengaktifkan local development server:

```bash
npm run dev
```

Buka browser Anda dan akses halaman [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

---

## 👥 Anggota Kelompok 17 (Paralel 4)

* **Bagas Hidayat N.S.** - *Fullstack Developer / Integrator*
* **[Nama Anggota Lain]** - *Rekayasa Kebutuhan & Analisis*
* **[Nama Anggota Lain]** - *Desain Antarmuka & UX*
* **[Nama Anggota Lain]** - *Pengujian & Jaminan Kualitas*

---

🌿 **Kaju Resort Farm** - *Menyediakan Hewan Ternak Terbaik, Sehat, dan Terpercaya untuk Kebutuhan Anda.*
