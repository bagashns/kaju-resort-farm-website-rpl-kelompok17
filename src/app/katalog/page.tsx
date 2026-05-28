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

interface CatalogProps {
  searchParams: Promise<{
    kategori?: string;
    min_harga?: string;
    max_harga?: string;
    sort?: string;
    search?: string;
    success?: string;
    info?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogProps) {
  const filters = await searchParams;
  const kategori = filters.kategori || 'semua';
  const min_harga = filters.min_harga || '';
  const max_harga = filters.max_harga || '';
  const sort = filters.sort || 'terbaru';
  const search = filters.search || '';
  const success = filters.success || '';
  const info = filters.info || '';

  // Construct database query
  let query = supabase
    .from('products')
    .select('*, categories!inner(id, name)')
    .eq('status', 'tersedia');

  if (kategori && kategori !== 'semua') {
    query = query.eq('category_id', parseInt(kategori));
  }
  if (min_harga) {
    query = query.gte('price', parseInt(min_harga));
  }
  if (max_harga) {
    query = query.lte('price', parseInt(max_harga));
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Sorting logic
  switch (sort) {
    case 'harga_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'harga_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'bobot_desc':
      query = query.order('weight', { ascending: false });
      break;
    case 'terbaru':
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data: productsRaw } = await query;
  const products = productsRaw
    ? productsRaw.map((p) => ({
        ...p,
        category_name: p.categories?.name || 'Ternak',
      }))
    : [];

  const { data: categories } = await supabase.from('categories').select('*');

  return (
    <>
      <section className="relative bg-[#0b271d] text-white pt-16 pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-emerald-600 rounded-full blur-[80px] opacity-30 animate-pulse"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
            Katalog Ternak Premium
          </h1>
          <p className="text-emerald-100 text-base font-light max-w-2xl">
            Jelajahi dan temukan hewan ternak berkualitas tinggi untuk memenuhi standar terbaik peternakan or bisnis Anda.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success === 'added_to_cart' && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in relative z-30">
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-emerald-600 text-lg"></i>
              <p className="text-sm font-semibold">Hewan ternak berhasil ditambahkan ke keranjang!</p>
            </div>
            <Link href="/keranjang" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10">
              Lihat Keranjang
            </Link>
          </div>
        )}
        {info === 'already_in_cart' && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in relative z-30">
            <div className="flex items-center gap-3">
              <i className="fas fa-info-circle text-amber-600 text-lg"></i>
              <p className="text-sm font-semibold">Hewan ternak sudah ada di keranjang Anda.</p>
            </div>
            <Link href="/keranjang" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/10">
              Lihat Keranjang
            </Link>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-10 relative z-20 -mt-16">
          <form action="/katalog" method="GET" className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <div className="md:col-span-1">
              <label className="block text-slate-500 font-medium text-sm mb-2">Pencarian</label>
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Cari ternak..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 font-medium text-sm mb-2">Kategori</label>
              <div className="relative">
                <select
                  name="kategori"
                  defaultValue={kategori}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm cursor-pointer"
                >
                  <option value="semua">Semua Kategori</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm"></i>
              </div>
            </div>
            <div>
              <label className="block text-slate-500 font-medium text-sm mb-2">Harga Minimum</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                <input
                  type="number"
                  name="min_harga"
                  defaultValue={min_harga}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 font-medium text-sm mb-2">Urutkan Berdasarkan</label>
              <div className="relative">
                <select
                  name="sort"
                  defaultValue={sort}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm cursor-pointer"
                >
                  <option value="terbaru">Paling Baru</option>
                  <option value="harga_asc">Harga Terendah</option>
                  <option value="harga_desc">Harga Tertinggi</option>
                  <option value="bobot_desc">Bobot Terberat</option>
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm"></i>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-3 rounded-xl transition-colors shadow-md shadow-emerald-500/20 flex-1 flex justify-center items-center gap-2 text-sm cursor-pointer"
              >
                <i className="fas fa-filter"></i> Terapkan
              </button>
              <Link
                href="/katalog"
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-xl transition-colors flex items-center justify-center"
              >
                <i className="fas fa-redo-alt"></i>
              </Link>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <p className="text-slate-500 font-medium text-xs bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            <span className="text-emerald-600 font-bold">{products.length}</span> Ternak Ditemukan
          </p>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-300">
              <i className="fas fa-search text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Ternak Tidak Ditemukan</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Kami tidak dapat menemukan ternak yang sesuai dengan kriteria filter Anda. Coba sesuaikan ulang pengaturan pencarian.
            </p>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 mt-6 text-emerald-600 font-medium hover:text-emerald-700 hover:underline text-sm"
            >
              <i className="fas fa-redo-alt"></i> Reset Filter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
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

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm w-fit">
                      {p.category_name}
                    </span>
                    {p.health_status === 'Sehat' && (
                      <span className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 w-fit">
                        <i className="fas fa-check-circle"></i> Sehat
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
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
        )}
      </div>
    </>
  );
}
