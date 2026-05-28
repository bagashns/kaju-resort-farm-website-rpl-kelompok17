'use client';

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      if (state.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-3.5 rounded-2xl shadow-md mb-4">
            <i className="fas fa-leaf text-3xl"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Masuk ke Akun</h2>
          <p className="text-slate-500 mt-2 font-light">Selamat datang kembali di Kaju Resort Farm</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {state?.error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start gap-2">
              <i className="fas fa-exclamation-circle mt-0.5"></i>
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">Email</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3.5 text-slate-400"></i>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3.5 text-slate-400"></i>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="Masukkan password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
          <p className="text-center text-slate-500 mt-6 text-sm">
            Belum punya akun?{' '}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
