import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { addToCartAction } from '@/app/actions/cart';

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

interface ProductDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  const user = await getSession();

  // Fetch product detail
  const { data: productRaw } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', parseInt(id))
    .maybeSingle();

  if (!productRaw) {
    notFound();
  }

  const product = {
    ...productRaw,
    category_name: productRaw.categories?.name || 'Ternak',
  };

  // Fetch related products
  const { data: relatedRaw } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('status', 'tersedia')
    .limit(4);

  const related = relatedRaw
    ? relatedRaw.map((p) => ({
        ...p,
        category_name: p.categories?.name || 'Ternak',
      }))
    : [];

  const handleAddToCart = async () => {
    'use server';
    await addToCartAction(product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-slate-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Beranda</Link>
        <span className="text-slate-300">/</span>
        <Link href="/katalog" className="hover:text-emerald-600 transition-colors">Katalog</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || '/images/default-product.jpg'}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        <div>
          <span className="inline-flex bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 shadow-sm">
            {product.category_name}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">{product.name}</h1>
          <div className="text-3xl font-black text-emerald-600 mb-6">{formatRupiah(product.price)}</div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Spesifikasi Ternak</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-emerald-500 flex items-center justify-center shadow-sm">
                  <i className="fas fa-weight-hanging"></i>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium">Bobot</span>
                  <p className="text-slate-800 font-bold text-sm">{product.weight} Kg</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-emerald-500 flex items-center justify-center shadow-sm">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium">Usia</span>
                  <p className="text-slate-800 font-bold text-sm">{product.age}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-emerald-500 flex items-center justify-center shadow-sm">
                  <i className="fas fa-venus-mars"></i>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium">Jenis Kelamin</span>
                  <p className="text-slate-800 font-bold text-sm">{product.gender || 'Jantan'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-emerald-500 flex items-center justify-center shadow-sm">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium">Kesehatan</span>
                  <p className="text-slate-800 font-bold text-sm">{product.health_status || 'Sehat'}</p>
                </div>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Deskripsi Ternak</h3>
              <p className="text-slate-600 leading-relaxed font-light text-sm bg-white p-5 rounded-2xl border border-slate-100">
                {product.description}
              </p>
            </div>
          )}

          {product.status === 'tersedia' ? (
            <div className="flex gap-3">
              {user && user.role === 'customer' ? (
                <form action={handleAddToCart} className="flex-1">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <i className="fas fa-cart-plus"></i>
                    <span>Masukkan Keranjang</span>
                  </button>
                </form>
              ) : !user ? (
                <Link
                  href="/login"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl transition text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login untuk Membeli</span>
                </Link>
              ) : null}
              <a
                href={`https://wa.me/6282114370112?text=Halo, saya tertarik dengan ${encodeURIComponent(
                  product.name
                )} di Kaju Resort Farm`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 rounded-2xl transition flex items-center justify-center shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 py-4 px-6 rounded-2xl text-center font-semibold text-sm flex items-center justify-center gap-2">
              <i className="fas fa-times-circle"></i>
              <span>
                Produk ini sudah {product.status === 'dipesan' ? 'dipesan' : 'terjual'}
              </span>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-slate-100 pt-16">
          <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Ternak Serupa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/katalog/${p.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 overflow-hidden flex flex-col"
              >
                <div className="h-40 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image || '/images/default-product.jpg'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-emerald-600 font-bold mt-1 text-sm">{formatRupiah(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
