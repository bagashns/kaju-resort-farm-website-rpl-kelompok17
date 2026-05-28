import { NextResponse } from 'next/server';
import { coreApi } from '@/lib/midtrans';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const statusResponse = await coreApi.transaction.notification(body);

    const orderId = statusResponse.order_id; // Invoice number
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newStatus = 'menunggu_pembayaran';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        newStatus = 'menunggu_verifikasi';
      } else if (fraudStatus === 'accept') {
        newStatus = 'lunas';
      }
    } else if (transactionStatus === 'settlement') {
      newStatus = 'lunas';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = 'ditolak';
    } else if (transactionStatus === 'pending') {
      newStatus = 'menunggu_pembayaran';
    }

    if (newStatus === 'ditolak') {
      await supabase.from('orders').update({ status: newStatus }).eq('invoice_number', orderId);

      const { data: orderData } = await supabase
        .from('orders')
        .select('id')
        .eq('invoice_number', orderId)
        .maybeSingle();

      if (orderData) {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id')
          .eq('order_id', orderData.id);

        if (items) {
          for (const item of items) {
            await supabase.from('products').update({ status: 'tersedia' }).eq('id', item.product_id);
          }
        }
      }
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('invoice_number', orderId);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Midtrans notification handler error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
