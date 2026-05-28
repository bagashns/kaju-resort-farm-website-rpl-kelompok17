import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

export default async function OrdersHistoryPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Fetch orders
  const { data: ordersData } = await supabase
    .from('orders')
    .select('*, order_items(id)')
    .eq('user_id', parseInt(user.id))
    .order('created_at', { ascending: false });

  const orders = ordersData
    ? ordersData.map((o: any) => ({
        ...o,
        item_count: o.order_items ? o.order_items.length : 0,
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-2xl shadow-sm">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <span>Riwayat Pesanan</span>
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-light">Lacak status pesanan dan transaksi Anda.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
            <i className="fas fa-clipboard-list text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Pesanan</h3>
          <p className="text-slate-400 font-light text-sm mb-8">
            Anda belum melakukan transaksi pembelian hewan ternak apa pun.
          </p>
          <Link
            href="/katalog"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl transition inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
          >
            <i className="fas fa-shopping-bag"></i>
            <span>Mulai Belanja</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            let statusColor = 'slate';
            let statusText = order.status.replace(/_/g, ' ');
            if (order.status === 'menunggu_pembayaran') {
              statusColor = 'amber';
              statusText = 'Menunggu Pembayaran';
            } else if (order.status === 'menunggu_verifikasi') {
              statusColor = 'blue';
              statusText = 'Menunggu Verifikasi';
            } else if (order.status === 'lunas') {
              statusColor = 'emerald';
              statusText = 'Lunas';
            } else if (order.status === 'diproses') {
              statusColor = 'indigo';
              statusText = 'Diproses';
            } else if (order.status === 'dikirim') {
              statusColor = 'purple';
              statusText = 'Dikirim';
            } else if (order.status === 'selesai') {
              statusColor = 'emerald';
              statusText = 'Selesai';
            } else if (order.status === 'ditolak') {
              statusColor = 'rose';
              statusText = 'Ditolak';
            }

            return (
              <Link
                key={order.id}
                href={`/pesanan/${order.id}`}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 group relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${statusColor}-500`}></div>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pl-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {order.invoice_number}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <i className="far fa-calendar-alt"></i>
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">
                      {order.item_count} Ternak Dipesan
                    </h3>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                    <span
                      className={`inline-block bg-${statusColor}-50 text-${statusColor}-600 border border-${statusColor}-100 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider`}
                    >
                      {statusText}
                    </span>
                    <p className="text-slate-800 font-extrabold text-lg">
                      {formatRupiah(order.total_amount)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
