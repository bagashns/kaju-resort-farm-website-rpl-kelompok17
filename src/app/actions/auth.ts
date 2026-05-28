'use server';

import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { setSession } from '@/lib/session';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email dan password wajib diisi.' };
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return { success: false, error: 'Email atau password salah.' };
    }

    const matches = bcrypt.compareSync(password, user.password);
    if (!matches) {
      return { success: false, error: 'Email atau password salah.' };
    }

    await setSession({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address || '',
    });

    return { success: true, role: user.role };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return { success: false, error: 'Semua field wajib diisi.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Konfirmasi password tidak cocok.' };
  }

  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Email sudah terdaftar.' };
    }

    const hashed = bcrypt.hashSync(password, 10);
    const { data: result, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone,
        address: address || '',
        password: hashed,
        role: 'customer',
      })
      .select()
      .single();

    if (error || !result) {
      return { success: false, error: 'Terjadi kesalahan saat pendaftaran.' };
    }

    await setSession({
      id: result.id.toString(),
      name: result.name,
      email: result.email,
      role: 'customer',
      phone: result.phone,
      address: result.address || '',
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}
