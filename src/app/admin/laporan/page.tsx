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

interface AdminReportsProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsProps) {
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  const { period } = await searchParams;
  const activePeriod = period || 'semua';

  // Fetch orders data for reports
  const { data: ordersData } = await supabase
    .from('orders')
    .select('*, order_items(product_category, price)')
    .in('status', ['lunas', 'selesai', 'ditolak']);

  let filteredOrders = ordersData || [];

  if (activePeriod && activePeriod !== 'semua') {
    const now = new Date();
    filteredOrders = filteredOrders.filter((o) => {
      const orderDate = new Date(o.created_at);
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (activePeriod === 'hari') {
        return orderDate.toDateString() === now.toDateString();
      } else if (activePeriod === 'minggu') {
        return diffDays <= 7;
      } else if (activePeriod === 'bulan') {
        return diffDays <= 30;
      }
      return true;
    });
  }

  const summary = {
    total_orders: 0,
    total_revenue: 0,
    completed_orders: 0,
    rejected_orders: 0,
  };

  const catMap: Record<string, { category: string; count: number; revenue: number }> = {};
  const dailyMap: Record<string, { date: string; orders: number; revenue: number }> = {};

  filteredOrders.forEach((o) => {
    summary.total_orders += 1;
    if (o.status === 'ditolak') {
      summary.rejected_orders += 1;
    } else {
      if (o.status === 'selesai') summary.completed_orders += 1;
      summary.total_revenue += o.total_amount;

      const date = o.created_at.split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { date, orders: 0, revenue: 0 };
      }
      dailyMap[date].orders += 1;
      dailyMap[date].revenue += o.total_amount;

      if (o.order_items) {
        o.order_items.forEach((item: any) => {
          const categoryName = item.product_category || 'Ternak';
          if (!catMap[categoryName]) {
            catMap[categoryName] = { category: categoryName, count: 0, revenue: 0 };
          }
          catMap[categoryName].count += 1;
          catMap[categoryName].revenue += item.price;
        });
      }
    }
  });

  const salesByCategory = Object.values(catMap);
  const dailySales = Object.values(dailyMap)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

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
              <i className="fas fa-file-invoice"></i>
            </div>
            <span>Laporan Penjualan & Keuangan</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-light">
            Analisis profitabilitas, sebaran kategori terlaris, dan tren penjualan harian.
          </p>
        </div>
      </div>

      {/* Period Selector tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { key: 'semua', label: 'Semua Waktu' },
          { key: 'hari', label: 'Hari Ini' },
          { key: 'minggu', label: '7 Hari Terakhir' },
          { key: 'bulan', label: '30 Hari Terakhir' },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/laporan?period=${tab.key}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePeriod === tab.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Quick Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <span className="text-slate-400 font-light text-xs uppercase tracking-wide">Omset Penjualan</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1 tracking-tight">
            {formatRupiah(summary.total_revenue)}
          </h3>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <span className="text-slate-400 font-light text-xs uppercase tracking-wide">Total Pesanan</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{summary.total_orders}</h3>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <span className="text-slate-400 font-light text-xs uppercase tracking-wide">Pesanan Selesai</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">
            {summary.completed_orders}
          </h3>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <span className="text-slate-400 font-light text-xs uppercase tracking-wide">Pesanan Ditolak</span>
          <h3 className="text-2xl font-black text-rose-500 mt-1 tracking-tight">{summary.rejected_orders}</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Sebaran Kategori Ternak</h3>
          {salesByCategory.length === 0 ? (
            <p className="text-slate-400 font-light text-sm text-center py-10">Belum ada sebaran kategori.</p>
          ) : (
            <div className="space-y-4">
              {salesByCategory.map((c) => (
                <div key={c.category} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-800 text-sm">{c.category}</p>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {c.count} terjual
                    </span>
                  </div>
                  <p className="text-emerald-600 font-extrabold text-base mt-1.5">{formatRupiah(c.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily sales table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 overflow-hidden">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Omset & Transaksi Harian</h3>
          {dailySales.length === 0 ? (
            <p className="text-slate-400 font-light text-sm text-center py-10">Belum ada riwayat transaksi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3">Tanggal</th>
                    <th className="pb-3">Jumlah Transaksi</th>
                    <th className="pb-3 text-right">Omset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dailySales.map((day) => (
                    <tr key={day.date} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-semibold text-slate-800">
                        {new Date(day.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 font-light">{day.orders} transaksi</td>
                      <td className="py-3 font-extrabold text-emerald-600 text-right">
                        {formatRupiah(day.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
