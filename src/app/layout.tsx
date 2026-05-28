import type { Metadata } from 'next';
import './globals.css';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kaju Resort Farm - Platform Jual Beli Hewan Ternak',
  description: 'Platform jual beli hewan ternak terpercaya. Menyediakan sapi dan kambing berkualitas langsung dari peternakan Kaju Resort Farm.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  let cartCount = 0;

  if (user && user.role === 'customer') {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    cartCount = count || 0;
  }

  return (
    <html lang="id" className="h-full">
      <head>
        {/* Google Fonts - Outfit */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* FontAwesome */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="bg-[#f8fafc] text-slate-800 antialiased font-sans flex flex-col min-h-full">
        <Navbar user={user} cartCount={cartCount} />

        <main className="flex-grow w-full">
          {children}
        </main>

        <footer className="bg-[#0b271d] text-slate-300 pt-12 pb-8 border-t border-emerald-950 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
              <div className="lg:col-span-1">
                <Link href="/" className="flex items-center space-x-2 mb-4 group">
                  <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-1.5 rounded-lg shadow-sm group-hover:shadow-emerald-500/30 transition-all">
                    <i className="fas fa-leaf text-base"></i>
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    Kaju Resort Farm
                  </span>
                </Link>
                <p className="text-xs leading-relaxed mb-5 font-light text-slate-400">
                  Platform jual beli hewan ternak terpercaya. Menyediakan sapi dan kambing berkualitas langsung dari peternakan Kaju Resort Farm.
                </p>
                <div className="flex space-x-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>

              <div className="lg:ml-auto">
                <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Tautan Langsung</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li>
                    <Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <i className="fas fa-chevron-right text-[10px] text-emerald-500"></i> Beranda
                    </Link>
                  </li>
                  <li>
                    <Link href="/katalog" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <i className="fas fa-chevron-right text-[10px] text-emerald-500"></i> Katalog Ternak
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <i className="fas fa-chevron-right text-[10px] text-emerald-500"></i> Daftar Akun
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Hubungi Kami</h4>
                <ul className="space-y-4 text-sm font-light">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-map-marker-alt mt-1 text-emerald-500"></i>
                    <span>
                      Kp. Manglad, Cibodas, Kec. Rumpin,
                      <br />
                      Kab. Bogor, Jawa Barat 16350
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-phone-alt text-emerald-500"></i>
                    <span>0895-3492-75679</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Bantuan Langsung</h4>
                <p className="text-sm font-light text-slate-400 mb-6">
                  Jika Anda memerlukan bantuan untuk proses pembelian, jangan ragu untuk menghubungi admin kami.
                </p>
                <a
                  href="https://wa.me/62895349275679"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:-translate-y-1"
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-light text-slate-500">
              <p>&copy; 2026 Kaju Resort Farm. Kelompok 17 - Paralel 4.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
                <a href="#" className="hover:text-white transition-colors">Privasi</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
