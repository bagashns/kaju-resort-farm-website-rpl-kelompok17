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

interface AdminOrdersProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersProps) {
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  const { status } = await searchParams;
  const filterStatus = status || 'semua';

  let query = supabase
    .from('orders')
    .select('*, users(name, phone), order_items(id)')
    .order('created_at', { ascending: false });

  if (filterStatus && filterStatus !== 'semua') {
    query = query.eq('status', filterStatus);
  }

  const { data: ordersData } = await query;

  const orders = ordersData
    ? ordersData.map((o: any) => ({
        ...o,
        customer_name: o.users?.name || 'Customer',
        customer_phone: o.users?.phone || '',
        item_count: o.order_items ? o.order_items.length : 0,
      }))
    : [];

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
              <i className="fas fa-shopping-bag"></i>
            </div>
            <span>Kelola Pesanan Masuk</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-light">
            Pantau status pesanan, verifikasi pembayaran manual, dan edit status logistik pengiriman.
          </p>
        </div>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { key: 'semua', label: 'Semua' },
          { key: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
          { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
          { key: 'lunas', label: 'Lunas' },
          { key: 'diproses', label: 'Diproses' },
          { key: 'dikirim', label: 'Dikirim' },
          { key: 'selesai', label: 'Selesai' },
          { key: 'ditolak', label: 'Ditolak' },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/pesanan?status=${tab.key}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === tab.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tabel Orders */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 overflow-hidden">
        {orders.length === 0 ? (
          <p className="text-slate-400 font-light text-sm text-center py-10">
            Tidak ada pesanan dengan status ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Jumlah Item</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => {
                  let statusColor = 'slate';
                  if (order.status === 'menunggu_pembayaran') statusColor = 'amber';
                  else if (order.status === 'menunggu_verifikasi') statusColor = 'blue';
                  else if (order.status === 'lunas') statusColor = 'emerald';
                  else if (order.status === 'diproses') statusColor = 'indigo';
                  else if (order.status === 'dikirim') statusColor = 'purple';
                  else if (order.status === 'selesai') statusColor = 'emerald';
                  else if (order.status === 'ditolak') statusColor = 'rose';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 font-semibold text-slate-800">{order.invoice_number}</td>
                      <td className="py-4 font-light text-xs">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 font-light">
                        <p className="font-semibold text-slate-800">{order.customer_name}</p>
                        <p className="text-[10px] text-slate-400 font-light">{order.customer_phone}</p>
                      </td>
                      <td className="py-4 font-medium">{order.item_count} Ternak</td>
                      <td className="py-4 font-bold text-slate-800">{formatRupiah(order.total_amount)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block bg-${statusColor}-50 text-${statusColor}-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/admin/pesanan/${order.id}`}
                          className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 font-bold py-2 px-4 rounded-xl transition inline-block text-xs"
                        >
                          Kelola
                        </Link>
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
  );
}
