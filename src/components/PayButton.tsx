'use client';

import React, { useEffect, useState } from 'react';
import { syncPaymentAction } from '@/app/actions/order';

interface PayButtonProps {
  paymentToken: string;
  invoiceNumber: string;
  isProduction: boolean;
  clientKey: string;
}

declare global {
  interface Window {
    snap: any;
  }
}

export default function PayButton({ paymentToken, invoiceNumber, isProduction, clientKey }: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap script
    const midtransScriptUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${midtransScriptUrl}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = midtransScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isProduction, clientKey]);

  const handlePay = () => {
    if (typeof window.snap === 'undefined') {
      alert('Sistem pembayaran sedang bersiap. Silakan coba sesaat lagi.');
      return;
    }

    setLoading(true);

    window.snap.pay(paymentToken, {
      onSuccess: async function (result: any) {
        console.log('Success:', result);
        await syncPaymentAction(invoiceNumber);
        window.location.reload();
      },
      onPending: async function (result: any) {
        console.log('Pending:', result);
        await syncPaymentAction(invoiceNumber);
        window.location.reload();
      },
      onError: function (result: any) {
        console.error('Error:', result);
        alert('Pembayaran gagal, silakan coba lagi.');
        setLoading(false);
      },
      onClose: function () {
        console.log('User closed payment popup.');
        setLoading(false);
      },
    });
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl transition text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 text-sm"
    >
      {loading ? (
        <>
          <i className="fas fa-spinner animate-spin"></i>
          <span>Memuat Pembayaran...</span>
        </>
      ) : (
        <>
          <i className="fas fa-credit-card"></i>
          <span>Bayar Sekarang</span>
        </>
      )}
    </button>
  );
}
