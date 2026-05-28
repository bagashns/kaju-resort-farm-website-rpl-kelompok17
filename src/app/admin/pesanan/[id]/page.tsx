import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { updateOrderStatusAction } from '@/app/actions/admin';

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

interface AdminOrderDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const { id } = await params;
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch order details
  const { data: orderData } = await supabase
    .from('orders')
    .select('*, users(name, email, phone, address)')
    .eq('id', parseInt(id))
    .maybeSingle();

  if (!orderData) {
    notFound();
  }

  const order = {
    ...orderData,
    customer_name: orderData.users?.name || 'Customer',
    customer_email: orderData.users?.email || '',
    customer_phone: orderData.users?.phone || '',
    customer_address: orderData.users?.address || '',
  };

  // Fetch order items
  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);

  let statusColor = 'slate';
  if (order.status === 'menunggu_pembayaran') statusColor = 'amber';
  else if (order.status === 'menunggu_verifikasi') statusColor = 'blue';
  else if (order.status === 'lunas') statusColor = 'emerald';
  else if (order.status === 'diproses') statusColor = 'indigo';
  else if (order.status === 'dikirim') statusColor = 'purple';
  else if (order.status === 'selesai') statusColor = 'emerald';
  else if (order.status === 'ditolak') statusColor = 'rose';

  const handleUpdateStatus = async (formData: FormData) => {
    'use server';
    const status = formData.get('status') as string;
    const admin_notes = formData.get('admin_notes') as string;
    await updateOrderStatusAction(order.id, status, admin_notes);
    redirect('/admin/pesanan');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/admin/pesanan"
        className="text-emerald-600 hover:text-emerald-800 mb-6 inline-flex items-center gap-1.5 transition text-sm font-semibold"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Kembali ke Kelola Pesanan</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{order.invoice_number}</h1>
            <p className="text-slate-400 text-xs mt-1.5 font-light">
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 bg-${statusColor}-50 text-${statusColor}-600 border border-${statusColor}-100 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider`}
          >
            <span>{order.status.replace(/_/g, ' ')}</span>
          </span>
        </div>

        {/* Customer Information Card */}
        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Informasi Pelanggan</h3>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-sm space-y-3 font-light text-slate-600">
          <p>
            <strong className="font-semibold text-slate-800">Nama Pelanggan:</strong> {order.customer_name}
          </p>
          <p>
            <strong className="font-semibold text-slate-800">No. Telepon:</strong> {order.customer_phone}
          </p>
          <p>
            <strong className="font-semibold text-slate-800">Email:</strong> {order.customer_email}
          </p>
          <p>
            <strong className="font-semibold text-slate-800">Alamat Pengiriman:</strong>{' '}
            {order.shipping_address || order.customer_address}
          </p>
          {order.notes && (
            <p>
              <strong className="font-semibold text-slate-800">Catatan Pelanggan:</strong> {order.notes}
            </p>
          )}
        </div>

        {/* Order Items */}
        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Item Pesanan</h3>
        <div className="space-y-4 mb-8">
          {items?.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b border-slate-50 pb-4 text-sm"
            >
              <div>
                <p className="font-bold text-slate-800">{item.product_name}</p>
                <p className="text-xs text-slate-400 font-light mt-0.5">
                  {item.product_category} &bull; {item.product_weight} Kg
                </p>
              </div>
              <span className="font-extrabold text-emerald-600">{formatRupiah(item.price)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-lg font-black border-t border-slate-100 pt-6">
          <span className="text-slate-800">Total Pembayaran</span>
          <span className="text-emerald-600">{formatRupiah(order.total_amount)}</span>
        </div>
      </div>

      {/* Proof of Payment (if exists) */}
      {order.payment_proof && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-8">
          <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
            Bukti Pembayaran Pelanggan
          </h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.payment_proof}
            alt="Bukti Pembayaran"
            className="max-w-md w-full rounded-2xl shadow-md border border-slate-100"
          />
        </div>
      )}

      {/* Form Update Status */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-8">
        <h3 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wide">Atur Status Pesanan</h3>
        <form action={handleUpdateStatus} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
              Ubah Status Menjadi
            </label>
            <select
              name="status"
              defaultValue={order.status}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition cursor-pointer font-bold text-slate-800"
            >
              <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              <option value="lunas">Lunas (Lolos Verifikasi / Midtrans Berhasil)</option>
              <option value="diproses">Sedang Diproses (Peternak Menyiapkan)</option>
              <option value="dikirim">Sedang Dikirim (Dalam Logistik)</option>
              <option value="selesai">Selesai (Diterima Customer)</option>
              <option value="ditolak">Ditolak (Batal / Gagal Pembayaran)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wide mb-1.5">
              Catatan Admin (Untuk Pelanggan)
            </label>
            <textarea
              name="admin_notes"
              rows={3}
              defaultValue={order.admin_notes || ''}
              placeholder="Tulis no. resi kurir, kendala logistik, atau alasan penolakan transfer..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl transition shadow-lg shadow-emerald-500/20 cursor-pointer text-sm"
          >
            <span>Simpan Perubahan Status</span>
          </button>
        </form>
      </div>
    </div>
  );
}
