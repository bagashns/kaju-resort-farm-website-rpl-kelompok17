require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Periksa apakah kredensial tersedia
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn("⚠️ Peringatan: SUPABASE_URL atau SUPABASE_KEY belum di-set di .env");
  console.warn("Harap tambahkan kredensial tersebut agar koneksi database berfungsi.");
}

// Inisialisasi Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDb() {
  // Dalam Supabase, tabel biasanya diinisialisasi melalui SQL Editor di dashboard.
  // Jika ingin menginisialisasi dari kode, kita bisa memanggil RPC.
  // Untuk saat ini, kita anggap schema sudah ada atau akan di-seed secara terpisah.
  console.log("Supabase Client initialized.");
  return supabase;
}

module.exports = { initDb, supabase };
