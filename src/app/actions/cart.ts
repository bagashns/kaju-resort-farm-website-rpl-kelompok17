'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addToCartAction(productId: number) {
  const user = await getSession();
  if (!user) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  if (user.role !== 'customer') {
    return { success: false, error: 'Hanya pembeli yang dapat menggunakan keranjang.' };
  }

  try {
    // Check if product exists and is available
    const { data: product } = await supabase
      .from('products')
      .select('status')
      .eq('id', productId)
      .maybeSingle();

    if (!product || product.status !== 'tersedia') {
      return { success: false, error: 'Hewan ternak ini tidak tersedia.' };
    }

    // Check if already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', parseInt(user.id))
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      return { success: false, alreadyInCart: true, error: 'Hewan ternak sudah ada di keranjang Anda.' };
    }

    // Insert into cart
    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: parseInt(user.id),
        product_id: productId,
      });

    if (error) {
      return { success: false, error: 'Gagal menambahkan ke keranjang.' };
    }

    revalidatePath('/layout');
    revalidatePath('/keranjang');
    revalidatePath('/katalog');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan.' };
  }
}

export async function deleteFromCartAction(cartItemId: number) {
  const user = await getSession();
  if (!user) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', parseInt(user.id));

    if (error) {
      return { success: false, error: 'Gagal menghapus item dari keranjang.' };
    }

    revalidatePath('/layout');
    revalidatePath('/keranjang');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan.' };
  }
}
