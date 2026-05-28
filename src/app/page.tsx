import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

export default async function HomePage() {
  // Fetch featured products
  const { data: featuredRaw } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('status', 'tersedia')
    .order('created_at', { ascending: false })
    .limit(6);

  const featured = featuredRaw
    ? featuredRaw.map((p) => ({
        ...p,
        category_name: p.categories?.name || 'Ternak',
      }))
    : [];

  // Fetch categories
  const { data: categories } = await supabase.from('categories').select('*');

  // Fetch stats
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'tersedia');

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  const { count: totalCustomers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer');

  const stats = {
    totalProducts: totalProducts || 0,
    totalCategories: totalCategories || 0,
    totalCustomers: totalCustomers || 0,
  };

  return (
    <>
      <section className="relative bg-[#0b271d] text-white overflow-hidden min-h-[400px] flex items-center pt-16 pb-20">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-teal-400 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-100 text-xs font-medium tracking-wide">
                  Peternakan Premium Terpercaya
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tight text-white font-sans">
                Kualitas Terbaik <br />
                <span className="text-white">Untuk Anda</span>
              </h1>

              <p className="text-slate-300 text-base mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Platform peternakan digital pertama yang memberikan transparansi harga, kepastian kualitas, dan kemudahan dalam setiap transaksi Anda.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/katalog"
                  className="group relative inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-[0_0_20px_-5px_rgba(59,166,116,0.5)] hover:-translate-y-0.5 text-sm"
                >
                  <i className="fas fa-search"></i>
                  <span>Jelajahi Katalog</span>
                  <i className="fas fa-arrow-right opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"></i>
                </Link>
                <a
                  href="https://wa.me/62895349275679"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 text-sm"
                >
                  <i className="fab fa-whatsapp text-emerald-400 text-base"></i>
                  <span>Konsultasi</span>
                </a>
              </div>
            </div>

            <div className="hidden lg:flex justify-center relative">
              <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="bg-white/10 backdrop-blur-md absolute w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-xl border border-white/10 z-20 hover:scale-105 transition-transform duration-500">
                  <div className="text-emerald-400 mb-1">
                    <i className="fas fa-award text-4xl"></i>
                  </div>
                  <p className="text-2xl font-black text-white">{stats.totalProducts}</p>
                  <p className="text-emerald-200 font-medium tracking-wide text-xs uppercase">
                    Ternak Premium
                  </p>
                </div>
                {/* Decorative Floating Cards */}
                <div className="bg-white/10 backdrop-blur-md absolute top-10 right-4 p-3 rounded-xl shadow-lg border border-white/10 z-20 hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                      <i className="fas fa-certificate"></i>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Tersertifikasi</p>
                      <p className="text-slate-400 text-xs">Sehat & Aman</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md absolute bottom-10 left-4 p-3 rounded-xl shadow-lg border border-white/10 z-20 hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500/20 p-1.5 rounded-md text-blue-400">
                      <i className="fas fa-truck-fast text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs">Pengiriman</p>
                      <p className="text-slate-400 text-[10px]">Cepat & Aman</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center space-x-4 hover:-translate-y-1 transition-transform duration-300 group">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:scale-105 transition-all">
              <i className="fas fa-shield-alt text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-0.5">Kualitas Terjamin</h3>
              <p className="text-slate-500 text-sm">
                Ternak sehat bersertifikasi standar. Terjamin bebas penyakit.
              </p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center space-x-4 hover:-translate-y-1 transition-transform duration-300 group">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600 group-hover:scale-105 transition-all">
              <i className="fas fa-tags text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-0.5">Harga Transparan</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Sistem harga jujur tanpa biaya tersembunyi. Bayar sesuai kualitas.
              </p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center space-x-4 hover:-translate-y-1 transition-transform duration-300 group">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:scale-105 transition-all">
              <i className="fas fa-truck text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-0.5">Pengiriman Aman</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Armada khusus untuk memastikan ternak tiba dalam kondisi prima.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">
            Kategori Pilihan
          </h2>
          <p className="text-slate-500 text-sm">
            Temukan hewan ternak terbaik sesuai dengan kebutuhan Anda.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/katalog?kategori=${cat.id}`}
              className="group relative bg-white rounded-2xl p-5 text-center hover:shadow-md transition-all duration-300 border border-slate-100 hover:border-emerald-200"
            >
              <div className="w-12 h-12 mx-auto bg-slate-50 group-hover:bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300">
                <i className={`${cat.icon || 'fas fa-paw'} text-2xl`}></i>
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-slate-500 text-xs hidden sm:block">
                {cat.description || 'Pilihan ternak unggul'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-16 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-1">
                  Koleksi Terbaru
                </h2>
                <p className="text-slate-500 text-sm">Pilihan ternak premium yang baru saja tiba.</p>
              </div>
              <Link
                href="/katalog"
                className="group flex items-center gap-1.5 text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors"
              >
                <span>Lihat Semua</span>
                <i className="fas fa-arrow-right transform group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || '/images/default-product.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {p.category_name}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <i className="fas fa-weight-hanging"></i>
                        {p.weight} Kg
                      </span>
                      <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <i className="fas fa-clock"></i>
                        {p.age}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {p.name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-emerald-600 font-bold text-lg">
                          {formatRupiah(p.price)}
                        </span>
                      </div>
                      <Link
                        href={`/katalog/${p.id}`}
                        className="w-8 h-8 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors text-xs"
                      >
                        <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
