import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { deleteFromCartAction } from '@/app/actions/cart';
import { checkoutAction } from '@/app/actions/order';

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

export default async function CartPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Fetch cart items
  const { data: cartData } = await supabase
    .from('cart_items')
    .select('id, products!inner(id, name, price, weight, image, status, categories!inner(name))')
    .eq('user_id', parseInt(user.id));

  const items = cartData
    ? cartData.map((ci: any) => ({
        id: ci.id,
        product_id: ci.products.id,
        name: ci.products.name,
        price: ci.products.price,
        weight: ci.products.weight,
        image: ci.products.image,
        status: ci.products.status,
        category_name: ci.products.categories?.name || 'Ternak',
      }))
    : [];

  const total = items.reduce(
    (sum, item) => sum + (item.status === 'tersedia' ? item.price : 0),
    0
  );

  const handleCheckout = async (formData: FormData) => {
    'use server';
    await checkoutAction(formData);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8 flex items-center gap-3">
        <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-2xl shadow-sm">
          <i className="fas fa-shopping-cart"></i>
        </div>
        <span>Keranjang Belanja</span>
      </h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
            <i className="fas fa-shopping-cart text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Keranjang Anda Kosong</h3>
          <p className="text-slate-400 font-light text-sm mb-8">
            Anda belum menambahkan hewan ternak apa pun ke dalam keranjang belanja.
          </p>
          <Link
            href="/katalog"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl transition inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
          >
            <i className="fas fa-search"></i>
            <span>Jelajahi Katalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-5 items-center transition duration-300 hover:shadow-md ${
                  item.status !== 'tersedia' ? 'opacity-60' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || '/images/default-product.jpg'}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    {item.category_name}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base truncate mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                    <i className="fas fa-weight-hanging"></i>
                    {item.weight} Kg
                  </p>
                  {item.status !== 'tersedia' && (
                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-lg mt-2 font-medium">
                      <i className="fas fa-exclamation-circle"></i> Tidak Tersedia
                    </span>
                  )}
                  <p className="text-emerald-600 font-extrabold text-lg mt-2">
                    {formatRupiah(item.price)}
                  </p>
                </div>
                <form
                  action={async () => {
                    'use server';
                    await deleteFromCartAction(item.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition cursor-pointer"
                    title="Hapus"
                  >
                    <i className="fas fa-trash-alt text-lg"></i>
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 h-fit sticky top-24">
            <h3 className="font-bold text-lg text-slate-800 mb-5 pb-3 border-b border-slate-100">
              Ringkasan Pesanan
            </h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Jumlah Item</span>
                <span>{items.filter((i) => i.status === 'tersedia').length} ternak</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-800">
                <span>Total</span>
                <span className="text-emerald-600">{formatRupiah(total)}</span>
              </div>
            </div>
            <form action={handleCheckout} className="space-y-5">
              <div>
                <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                  Alamat Pengiriman/Penjemputan
                </label>
                <textarea
                  name="shipping_address"
                  rows={3}
                  required
                  defaultValue={user.address || ''}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  placeholder="Masukkan alamat pengiriman lengkap..."
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
                  Catatan (opsional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  placeholder="Catatan tambahan untuk peternak..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <i className="fas fa-check"></i>
                <span>Proses Checkout</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
