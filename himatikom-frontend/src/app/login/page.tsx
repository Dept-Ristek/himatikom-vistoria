'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoginResponse, ApiError } from '@/types';
import { apiUrl } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Panggil API Laravel
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nim: nim,
          password: password,
        }),
      });

      const data: LoginResponse | ApiError = await response.json();

      if (!response.ok) {
        // Tangani error dari server
        const errData = data as ApiError;
        throw new Error(errData.message || errData.errors?.nim?.[0] || 'NIM atau Password salah');
      }

      // Jika Sukses
      const successData = data as LoginResponse;
      
      // Simpan Token & User ke LocalStorage
      localStorage.setItem('access_token', successData.data.token);
      localStorage.setItem('user_role', successData.data.user.role);
      localStorage.setItem('user_name', successData.data.user.name);
      localStorage.setItem('user_id', successData.data.user.id.toString());

      // Redirect ke Dashboard
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f8fafc;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
          
          {/* Top Decoration Line */}
          <div className="h-2 w-full bg-blue-600"></div>

          <div className="p-8">
            {/* Header Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                {/* HIMATIKOM Logo */}
                <div className="w-14 h-14 relative">
                  <Image
                    src="/images/himatikom.png"
                    alt="HIMATIKOM Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                {/* Vistoria Logo */}
                <div className="w-14 h-14 relative">
                  <Image
                    src="/images/kabinet-vistoria.png"
                    alt="Kabinet Vistoria"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Selamat Datang</h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">HIMATIKOM Kabinet Vistoria</p>
              <p className="text-xs text-gray-500 mt-1">Masuk ke akun digital Anda</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2 animate-fade-in">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Input NIM - Warna Background Biru (bg-blue-50) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Nomor Induk Mahasiswa (NIM)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-id-card text-blue-500 text-sm"></i>
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="nim"
                    className="w-full pl-10 pr-4 py-2.5 border border-blue-200 bg-blue-50 text-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-blue-300 focus:bg-blue-100"
                    placeholder="Contoh: 10602060"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                  />
                </div>
              </div>

              {/* Input Password - Warna Background Biru (bg-blue-50) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-blue-500 text-sm"></i>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 border border-blue-200 bg-blue-50 text-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-blue-300 focus:bg-blue-100"
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-700 focus:outline-none transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                  </button>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2
                  ${isLoading
                    ? 'bg-blue-300 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i> Memproses...
                  </>
                ) : (
                  <>
                    Masuk Sekarang <i className="fas fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/" className="text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium">
                <i className="fas fa-arrow-left mr-1"></i> Kembali ke Halaman Utama
              </Link>
            </div>
          </div>

          {/* Footer Mini */}
          <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              &copy; 2026 HIMATIKOM Vistoria
            </p>
          </div>
        </div>
      </div>
    </>
  );
}