'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { snap, coreApi } from '@/lib/midtrans';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function checkoutAction(formData: FormData) {
  const user = await getSession();
  if (!user) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  const shipping_address = formData.get('shipping_address') as string;
  const notes = formData.get('notes') as string;

  if (!shipping_address) {
    return { success: false, error: 'Alamat pengiriman wajib diisi.' };
  }

  let orderIdToRedirect: number | null = null;

  try {
    const { data: cartData } = await supabase
      .from('cart_items')
      .select('id, products!inner(id, name, price, weight, status, categories!inner(name))')
      .eq('user_id', parseInt(user.id));

    const cartItems = cartData
      ? cartData.map((ci: any) => ({
          id: ci.id,
          product_id: ci.products.id,
          name: ci.products.name,
          price: ci.products.price,
          weight: ci.products.weight,
          status: ci.products.status,
          category_name: ci.products.categories?.name || 'Ternak',
        }))
      : [];

    const available = cartItems.filter((i) => i.status === 'tersedia');
    if (available.length === 0) {
      return { success: false, error: 'Keranjang kosong atau semua produk tidak tersedia.' };
    }

    const total = available.reduce((sum, i) => sum + i.price, 0);
    const invoice = 'INV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create Midtrans snap transaction
    const parameter = {
      transaction_details: {
        order_id: invoice,
        gross_amount: total,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || '',
      },
    };

    const transaction = await snap.createTransaction(parameter);
    const paymentToken = transaction.token;

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: parseInt(user.id),
        invoice_number: invoice,
        total_amount: total,
        shipping_address: shipping_address || user.address || '',
        notes: notes || '',
        payment_token: paymentToken,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Gagal membuat pesanan.');
    }

    const orderId = order.id;
    orderIdToRedirect = orderId;

    // Insert order items & set product status to 'dipesan'
    for (const item of available) {
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: item.product_id,
        price: item.price,
        product_name: item.name,
        product_weight: item.weight,
        product_category: item.category_name,
      });

      await supabase.from('products').update({ status: 'dipesan' }).eq('id', item.product_id);
    }

    // Delete cart items
    await supabase.from('cart_items').delete().eq('user_id', parseInt(user.id));

    revalidatePath('/keranjang');
    revalidatePath('/pesanan');
    revalidatePath('/layout');
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan saat checkout.' };
  }

  if (orderIdToRedirect) {
    redirect(`/pesanan/${orderIdToRedirect}`);
  }
}

export async function uploadPaymentProofAction(orderId: number, imageUrl: string) {
  const user = await getSession();
  if (!user) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_proof: imageUrl,
        status: 'menunggu_verifikasi',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', parseInt(user.id));

    if (error) {
      return { success: false, error: 'Gagal memperbarui bukti pembayaran.' };
    }

    revalidatePath(`/pesanan/${orderId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan.' };
  }
}

export async function syncPaymentAction(invoice: string) {
  try {
    const statusResponse = await coreApi.transaction.status(invoice);
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
      const { data: orderData } = await supabase
        .from('orders')
        .select('id')
        .eq('invoice_number', invoice)
        .maybeSingle();

      if (orderData) {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderData.id);
        const { data: items } = await supabase.from('order_items').select('product_id').eq('order_id', orderData.id);
        if (items) {
          for (const item of items) {
            await supabase.from('products').update({ status: 'tersedia' }).eq('id', item.product_id);
          }
        }
      }
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('invoice_number', invoice);
    }

    revalidatePath('/pesanan');
    return { success: true, status: newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal sinkronisasi pembayaran.' };
  }
}
