'use client';

import React, { useState } from 'react';
import { addToCartAction } from '@/app/actions/cart';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: number;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'already' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await addToCartAction(productId);
      if (res.success) {
        setStatus('success');
        setMessage('Hewan ternak berhasil ditambahkan!');
        // Refresh page/router to update the navbar cart count badge!
        router.refresh();
      } else if ('alreadyInCart' in res && res.alreadyInCart) {
        setStatus('already');
        setMessage(res.error || 'Sudah ada di keranjang.');
      } else {
        setStatus('error');
        setMessage(res.error || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Gagal menambahkan ke keranjang.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <form onSubmit={handleAdd} className="w-full">
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold py-3.5 px-6 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm transition-all duration-300 ${
            loading
              ? 'bg-emerald-700/80 text-white cursor-not-allowed shadow-emerald-700/10'
              : status === 'success'
              ? 'bg-teal-600 text-white shadow-teal-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
          }`}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner animate-spin text-base"></i>
              <span>Memasukkan ke Keranjang...</span>
            </>
          ) : status === 'success' ? (
            <>
              <i className="fas fa-check-circle text-base"></i>
              <span>Berhasil Ditambahkan!</span>
            </>
          ) : (
            <>
              <i className="fas fa-cart-plus text-base"></i>
              <span>Masukkan Keranjang</span>
            </>
          )}
        </button>
      </form>

      {/* Modern Status Messages */}
      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-emerald-600"></i>
            <span>{message}</span>
          </div>
          <a href="/keranjang" className="font-bold text-emerald-700 hover:underline">
            Lihat Keranjang
          </a>
        </div>
      )}

      {status === 'already' && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle text-amber-600"></i>
            <span>{message}</span>
          </div>
          <a href="/keranjang" className="font-bold text-amber-700 hover:underline">
            Lihat Keranjang
          </a>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs animate-fade-in">
          <i className="fas fa-exclamation-circle text-rose-600"></i>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
