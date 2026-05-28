'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserSession } from '@/lib/session';

interface NavbarProps {
  user: UserSession | null;
  cartCount: number;
}

export default function Navbar({ user, cartCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <nav className="glass bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-2 rounded-lg shadow-sm group-hover:shadow-emerald-500/30 transition-all duration-300 group-hover:-translate-y-0.5">
              <i className="fas fa-leaf text-lg"></i>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-emerald-600 transition-colors">
              Kaju Resort Farm
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-emerald-600 text-2xl transition"
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="font-medium text-slate-600 hover:text-emerald-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all hover:after:w-full"
            >
              Beranda
            </Link>
            <Link
              href="/katalog"
              className="font-medium text-slate-600 hover:text-emerald-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all hover:after:w-full"
            >
              Katalog
            </Link>

            {user ? (
              <>
                {user.role === 'customer' ? (
                  <>
                    <Link
                      href="/keranjang"
                      className="text-slate-600 hover:text-emerald-600 transition-colors relative group/cart"
                    >
                      <i className="fas fa-shopping-cart text-lg group-hover/cart:scale-110 transition-transform"></i>
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-3 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/pesanan"
                      className="font-medium text-slate-600 hover:text-emerald-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all hover:after:w-full"
                    >
                      Pesanan Saya
                    </Link>
                  </>
                ) : user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="font-medium text-slate-600 hover:text-emerald-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all hover:after:w-full"
                  >
                    Dashboard Admin
                  </Link>
                ) : null}

                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 font-medium text-slate-700 hover:text-emerald-600 transition-colors bg-slate-100/50 hover:bg-emerald-50 px-3 py-2 rounded-full border border-slate-200 hover:border-emerald-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white flex items-center justify-center text-xs shadow-inner">
                      <i className="fas fa-user"></i>
                    </div>
                    <span>{user.name}</span>
                    <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 w-56 z-50">
                      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden py-2 transform transition-all">
                        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                          <span className="block text-sm font-semibold text-slate-800 truncate">
                            {user.name}
                          </span>
                          <span className="block text-xs text-slate-500 truncate mt-0.5">
                            {user.email}
                          </span>
                        </div>
                        <a
                          href="/api/auth/logout"
                          className="flex items-center px-5 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                        >
                          <i className="fas fa-sign-out-alt w-5 mr-2"></i>Keluar
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 font-medium px-6 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 space-y-1 bg-white/95 backdrop-blur-md absolute top-full left-0 right-0 border-b border-slate-100 shadow-xl px-4 z-40">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
            >
              Beranda
            </Link>
            <Link
              href="/katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
            >
              Katalog
            </Link>
            {user ? (
              <>
                {user.role === 'customer' ? (
                  <>
                    <Link
                      href="/keranjang"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
                    >
                      <span>Keranjang</span>
                      {cartCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/pesanan"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
                    >
                      Pesanan Saya
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
                  >
                    Dashboard Admin
                  </Link>
                )}
                <div className="h-px bg-slate-100 my-2 mx-4"></div>
                <a
                  href="/api/auth/logout"
                  className="block px-4 py-3 text-rose-600 font-medium rounded-xl hover:bg-rose-50 transition"
                >
                  Keluar ({user.name})
                </a>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-4 py-2.5 rounded-xl transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 font-medium px-4 py-2.5 rounded-xl transition"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
