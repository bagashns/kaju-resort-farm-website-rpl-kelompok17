'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    throw new Error('Anda tidak memiliki akses ke fitur ini.');
  }
}

export async function addProductAction(formData: FormData) {
  try {
    await checkAdmin();
    const category_id = parseInt(formData.get('category_id') as string);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const weight = parseFloat(formData.get('weight') as string);
    const age = formData.get('age') as string;
    const price = parseInt(formData.get('price') as string);
    const gender = formData.get('gender') as string || 'Jantan';
    const health_status = formData.get('health_status') as string || 'Sehat';
    const image = formData.get('image') as string || '/images/default-product.jpg';

    const { error } = await supabase.from('products').insert({
      category_id,
      name,
      description,
      weight,
      age,
      price,
      gender,
      health_status,
      image,
    });

    if (error) throw error;
    revalidatePath('/admin/produk');
    revalidatePath('/katalog');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menambahkan produk.' };
  }
}

export async function editProductAction(id: number, formData: FormData) {
  try {
    await checkAdmin();
    const category_id = parseInt(formData.get('category_id') as string);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const weight = parseFloat(formData.get('weight') as string);
    const age = formData.get('age') as string;
    const price = parseInt(formData.get('price') as string);
    const gender = formData.get('gender') as string;
    const health_status = formData.get('health_status') as string;
    const image = formData.get('image') as string;
    const status = formData.get('status') as string;

    const { error } = await supabase
      .from('products')
      .update({
        category_id,
        name,
        description,
        weight,
        age,
        price,
        gender,
        health_status,
        image,
        status,
      })
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/produk');
    revalidatePath(`/katalog/${id}`);
    revalidatePath('/katalog');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui produk.' };
  }
}

export async function deleteProductAction(id: number) {
  try {
    await checkAdmin();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/produk');
    revalidatePath('/katalog');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus produk.' };
  }
}

export async function updateOrderStatusAction(id: number, status: string, admin_notes: string) {
  try {
    await checkAdmin();
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        admin_notes: admin_notes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    if (status === 'ditolak' || status === 'selesai') {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id')
        .eq('order_id', id);

      if (items) {
        const newProductStatus = status === 'ditolak' ? 'tersedia' : 'terjual';
        for (const item of items) {
          await supabase
            .from('products')
            .update({ status: newProductStatus })
            .eq('id', item.product_id);
        }
      }
    }

    revalidatePath('/admin/pesanan');
    revalidatePath(`/pesanan/${id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui status pesanan.' };
  }
}
