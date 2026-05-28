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

export default async function AdminDashboardPage() {
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch statistics in parallel
  const [
    { count: totalProducts },
    { count: availableProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalCustomers },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'tersedia'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['menunggu_pembayaran', 'menunggu_verifikasi']),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
  ]);

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .in('status', ['lunas', 'selesai']);

  const totalRevenue = revenueData ? revenueData.reduce((sum, o) => sum + o.total_amount, 0) : 0;

  // Recent orders
  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select('*, users(name)')
    .order('created_at', { ascending: false })
    .limit(8);

  const recentOrders = recentOrdersData
    ? recentOrdersData.map((o: any) => ({
        ...o,
        customer_name: o.users?.name || 'Customer',
      }))
    : [];

  // Monthly sales analytics
  const { data: ordersForSales } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .in('status', ['lunas', 'selesai']);

  const monthlyMap: Record<string, { month: string; total_orders: number; revenue: number }> = {};
  if (ordersForSales) {
    ordersForSales.forEach((o) => {
      const month = o.created_at.substring(0, 7);
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, total_orders: 0, revenue: 0 };
      }
      monthlyMap[month].total_orders += 1;
      monthlyMap[month].revenue += o.total_amount;
    });
  }
  const monthlySales = Object.values(monthlyMap)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-2xl shadow-sm animate-pulse">
              <i className="fas fa-chart-line"></i>
            </div>
            <span>Dashboard Admin</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-light">
            Selamat datang kembali, {user.name}. Kelola produk, pantau pesanan, dan lihat laporan penjualan.
          </p>
        </div>

        {/* Quick Links Navigation */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/produk"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition text-xs shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-box text-emerald-500"></i> Kelola Produk
          </Link>
          <Link
            href="/admin/pesanan"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition text-xs shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-shopping-bag text-emerald-500"></i> Kelola Pesanan
          </Link>
          <Link
            href="/admin/laporan"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition text-xs shadow-md shadow-emerald-500/10 flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-file-invoice"></i> Laporan Keuangan
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
              <i className="fas fa-wallet text-xl"></i>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-full">
              Selesai & Lunas
            </span>
          </div>
          <span className="text-slate-400 font-light text-xs">Total Pendapatan</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">
            {formatRupiah(totalRevenue)}
          </h3>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
              <i className="fas fa-box text-xl"></i>
            </div>
          </div>
          <span className="text-slate-400 font-light text-xs">Total Produk (Tersedia)</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">
            {totalProducts} <span className="text-slate-400 font-light text-sm">({availableProducts})</span>
          </h3>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <i className="fas fa-shopping-cart text-xl"></i>
            </div>
            {pendingOrders && pendingOrders > 0 ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded-full animate-bounce">
                {pendingOrders} Baru
              </span>
            ) : null}
          </div>
          <span className="text-slate-400 font-light text-xs">Total Pesanan</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{totalOrders}</h3>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
              <i className="fas fa-users text-xl"></i>
            </div>
          </div>
          <span className="text-slate-400 font-light text-xs">Pelanggan Terdaftar</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{totalCustomers}</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center justify-between">
            <span>Transaksi Terbaru</span>
            <Link href="/admin/pesanan" className="text-xs text-emerald-600 hover:underline">
              Lihat Semua
            </Link>
          </h3>

          {recentOrders.length === 0 ? (
            <p className="text-slate-400 font-light text-sm text-center py-10">Belum ada pesanan masuk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => {
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
                        <td className="py-3 font-semibold text-slate-800">{order.invoice_number}</td>
                        <td className="py-3 font-light">{order.customer_name}</td>
                        <td className="py-3 font-bold text-slate-800">{formatRupiah(order.total_amount)}</td>
                        <td className="py-3">
                          <span
                            className={`inline-block bg-${statusColor}-50 text-${statusColor}-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase`}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/pesanan/${order.id}`}
                            className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 p-2 rounded-xl transition inline-block text-xs"
                          >
                            Detail
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

        {/* Monthly Sales Breakdown */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Omset Bulanan</h3>
          {monthlySales.length === 0 ? (
            <p className="text-slate-400 font-light text-sm text-center py-10">Belum ada data penjualan.</p>
          ) : (
            <div className="space-y-5">
              {monthlySales.map((sales) => {
                const parts = sales.month.split('-');
                const monthName = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1).toLocaleDateString(
                  'id-ID',
                  { month: 'long', year: 'numeric' }
                );

                return (
                  <div key={sales.month} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-medium text-xs uppercase tracking-wide">
                      {monthName}
                    </p>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <p className="text-slate-800 font-extrabold text-base">
                        {formatRupiah(sales.revenue)}
                      </p>
                      <p className="text-xs text-slate-500 font-light">
                        {sales.total_orders} transaksi
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
