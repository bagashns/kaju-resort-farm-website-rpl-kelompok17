import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import PayButton from '@/components/PayButton';
import { uploadPaymentProofAction, cancelOrderAction } from '@/app/actions/order';

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

interface OrderDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params;
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Fetch order details
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', parseInt(id))
    .eq('user_id', parseInt(user.id))
    .maybeSingle();

  if (!order) {
    notFound();
  }

  // Fetch order items
  const { data: itemsRaw } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const items = itemsRaw || [];

  let statusColor = 'slate';
  let statusText = order.status;
  let statusIcon = 'fas fa-circle';

  if (order.status === 'menunggu_pembayaran') {
    statusColor = 'amber';
    statusText = 'Menunggu Pembayaran';
    statusIcon = 'fas fa-clock';
  } else if (order.status === 'menunggu_verifikasi') {
    statusColor = 'blue';
    statusText = 'Menunggu Verifikasi Admin';
    statusIcon = 'fas fa-hourglass-half';
  } else if (order.status === 'lunas') {
    statusColor = 'emerald';
    statusText = 'Pembayaran Lunas';
    statusIcon = 'fas fa-check-circle';
  } else if (order.status === 'diproses') {
    statusColor = 'indigo';
    statusText = 'Sedang Diproses';
    statusIcon = 'fas fa-cog animate-spin';
  } else if (order.status === 'dikirim') {
    statusColor = 'purple';
    statusText = 'Sedang Dikirim';
    statusIcon = 'fas fa-truck';
  } else if (order.status === 'selesai') {
    statusColor = 'emerald';
    statusText = 'Pesanan Selesai';
    statusIcon = 'fas fa-check-double';
  } else if (order.status === 'ditolak') {
    statusColor = 'rose';
    statusText = 'Pesanan Dibatalkan';
    statusIcon = 'fas fa-times-circle';
  }

  const handleCancelOrder = async () => {
    'use server';
    await cancelOrderAction(order.id);
  };

  const handleUploadProof = async (formData: FormData) => {
    'use server';
    const proofUrl = formData.get('proof_url') as string;
    if (proofUrl) {
      await uploadPaymentProofAction(order.id, proofUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/pesanan"
        className="text-emerald-600 hover:text-emerald-800 mb-6 inline-flex items-center gap-1.5 transition text-sm font-semibold"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Kembali ke Riwayat</span>
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
            <i className={statusIcon}></i>
            <span>{statusText}</span>
          </span>
        </div>

        {order.admin_notes && (
          <div className="bg-blue-50/55 border border-blue-100 text-blue-700 p-5 rounded-2xl mb-8 flex gap-3 text-sm">
            <i className="fas fa-info-circle mt-0.5 text-base"></i>
            <div>
              <strong>Catatan Admin:</strong>
              <p className="mt-1 font-light text-blue-600">{order.admin_notes}</p>
            </div>
          </div>
        )}

        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Item Pesanan</h3>
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-4 text-sm">
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-8 text-sm">
        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Alamat Pengiriman</h3>
        <p className="text-slate-600 font-light bg-slate-50 border border-slate-100 p-4 rounded-xl">
          {order.shipping_address}
        </p>

        {order.notes && (
          <>
            <h3 className="font-bold text-slate-800 mt-6 mb-3 text-sm uppercase tracking-wide">Catatan Anda</h3>
            <p className="text-slate-600 font-light bg-slate-50 border border-slate-100 p-4 rounded-xl">
              {order.notes}
            </p>
          </>
        )}
      </div>

      {order.status === 'menunggu_pembayaran' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-8">
          <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Pembayaran</h3>
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl mb-6 text-sm">
            <p className="font-bold text-amber-800 mb-1">Silakan selesaikan pembayaran Anda:</p>
            <p className="text-amber-700 font-light">
              Total Tagihan:{' '}
              <strong className="font-extrabold text-base text-amber-900">
                {formatRupiah(order.total_amount)}
              </strong>
            </p>
          </div>
          {order.payment_token ? (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
              <PayButton
                paymentToken={order.payment_token}
                invoiceNumber={order.invoice_number}
                isProduction={process.env.MIDTRANS_IS_PRODUCTION === 'true'}
                clientKey={process.env.MIDTRANS_CLIENT_KEY || ''}
              />
              <form action={handleCancelOrder}>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold py-3.5 px-6 rounded-2xl transition duration-300 text-center flex items-center justify-center cursor-pointer text-sm"
                >
                  <span>Batalkan Pesanan</span>
                </button>
              </form>
            </div>
          ) : (
            <p className="text-rose-500 font-semibold text-sm">
              Token pembayaran tidak ditemukan. Silakan hubungi admin.
            </p>
          )}
        </div>
      )}

      {order.payment_proof && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-8">
          <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Bukti Pembayaran</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.payment_proof}
            alt="Bukti Pembayaran"
            className="max-w-sm w-full rounded-2xl shadow-md border border-slate-100"
          />
        </div>
      )}

      <div className="mt-8 text-center">
        <a
          href={`https://wa.me/62895349275679?text=Halo%20admin,%20saya%20ingin%20menanyakan%20pesanan%20${order.invoice_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/10 cursor-pointer text-sm"
        >
          <i className="fab fa-whatsapp text-lg"></i>
          <span>Hubungi Admin via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
