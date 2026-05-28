import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { addProductAction, editProductAction, deleteProductAction } from '@/app/actions/admin';

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

export default async function AdminProductsPage() {
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch products
  const { data: productsData } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  const products = productsData
    ? productsData.map((p: any) => ({
        ...p,
        category_name: p.categories?.name || 'Ternak',
      }))
    : [];

  // Fetch categories for adding/editing
  const { data: categories } = await supabase.from('categories').select('*');

  const handleAdd = async (formData: FormData) => {
    'use server';
    await addProductAction(formData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/admin"
        className="text-emerald-600 hover:text-emerald-800 mb-6 inline-flex items-center gap-1.5 transition text-sm font-semibold"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Kembali ke Dashboard</span>
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-2xl shadow-sm">
              <i className="fas fa-box"></i>
            </div>
            <span>Kelola Hewan Ternak</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-light">
            Tambah, edit status, hapus, dan atur katalog hewan ternak yang ditampilkan di website.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Tambah Produk */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 h-fit">
          <h3 className="font-bold text-slate-800 text-lg mb-6 pb-3 border-b border-slate-100">
            Tambah Ternak Baru
          </h3>
          <form action={handleAdd} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                Kategori
              </label>
              <select
                name="category_id"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              >
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                Nama Ternak
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Contoh: Sapi Limousin Jumbo"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                  Bobot (Kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  required
                  placeholder="350"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                  Usia
                </label>
                <input
                  type="text"
                  name="age"
                  required
                  placeholder="Contoh: 2 Tahun"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                >
                  <option value="Jantan">Jantan</option>
                  <option value="Betina">Betina</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                  Kesehatan
                </label>
                <input
                  type="text"
                  name="health_status"
                  defaultValue="Sehat"
                  placeholder="Sehat"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                Harga (Rp)
              </label>
              <input
                type="number"
                name="price"
                required
                placeholder="25000000"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                URL Gambar Ternak
              </label>
              <input
                type="url"
                name="image"
                placeholder="https://example.com/sapi.jpg"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                Deskripsi
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Jelaskan detail fisik, pakan, riwayat vaksin..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20 text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <i className="fas fa-plus"></i>
              <span>Tambah Produk</span>
            </button>
          </form>
        </div>

        {/* Tabel Kelola Produk */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 overflow-hidden">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Katalog Produk Aktif</h3>
          {products.length === 0 ? (
            <p className="text-slate-400 font-light text-sm text-center py-10">Belum ada produk aktif.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3">Ternak</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3">Spesifikasi</th>
                    <th className="pb-3">Harga</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((p) => {
                    let statusColor = 'slate';
                    if (p.status === 'tersedia') statusColor = 'emerald';
                    else if (p.status === 'dipesan') statusColor = 'amber';
                    else if (p.status === 'terjual') statusColor = 'blue';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image || '/images/default-product.jpg'}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                            />
                            <div>
                              <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-light">{p.gender} &bull; {p.health_status}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-light">{p.category_name}</td>
                        <td className="py-4 text-xs font-medium">
                          {p.weight} Kg &bull; {p.age}
                        </td>
                        <td className="py-4 font-bold text-slate-800">{formatRupiah(p.price)}</td>
                        <td className="py-4">
                          <span
                            className={`inline-block bg-${statusColor}-50 text-${statusColor}-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <form
                            action={async () => {
                              'use server';
                              await deleteProductAction(p.id);
                            }}
                            className="inline-block"
                          >
                            <button
                              type="submit"
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition cursor-pointer text-xs font-bold"
                            >
                              Hapus
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
