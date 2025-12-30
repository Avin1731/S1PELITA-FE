"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import SintaFullLogo from '@/components/SintaFullLogo';
import { useAuth } from '@/context/AuthContext';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'next/navigation';

// Komponen Ikon Mata
const EyeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.625-5.06A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.268 5.768M4 12s2.943-7 8-7 8 7 8 7-2.943 7-8 7-8-7-8-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const searchParams = useSearchParams();

  // Mapping parameter URL
  const asParam = searchParams.get('as');
  const roleParam = searchParams.get('role');

  let userType: string | null = null;
  if (asParam) userType = asParam;
  else if (roleParam === '1') userType = 'admin';
  else if (roleParam === '2') userType = 'pusdatin';
  else if (roleParam === '3') userType = 'provinsi';
  else if (roleParam === '4') userType = 'kota';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login({ email, password });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        let message = 'Login gagal. Periksa email dan password Anda.';
        if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.response?.data?.errors?.email) {
            message = err.response.data.errors.email[0];
        }
        setError(message);
      } else {
        setError('Terjadi kesalahan koneksi atau server tidak merespons.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderRegisterSection = () => {
    switch (userType) {
      case 'pusdatin':
        return (
          <div className="mt-8 text-sm text-center">
            <p className="text-gray-600 mb-2">Akun Pusdatin dibuat oleh Admin.</p>
            <Link href="/hubungi-admin" className="text-[#00A86B] font-bold hover:underline">Hubungi Admin</Link>
          </div>
        );
      case 'admin':
        return (
          <div className="mt-8 text-sm text-center">
             <p className="text-gray-600">Login khusus Administrator.</p>
          </div>
        );
      case 'provinsi':
        return (
          <div className="mt-8 text-sm text-center">
            <p className="text-gray-600 mb-4">Belum punya akun Dinas Provinsi?</p>
            <Link href="/register?role=provinsi" className="inline-block bg-[#00A86B] text-white font-bold py-3 px-6 rounded-lg hover:brightness-90 transition shadow-sm">
              Daftar Akun Provinsi
            </Link>
          </div>
        );
      case 'kota':
        return (
          <div className="mt-8 text-sm text-center">
            <p className="text-gray-600 mb-4">Belum punya akun Dinas Kab/Kota?</p>
            <Link href="/register?role=kota" className="inline-block bg-[#00A86B] text-white font-bold py-3 px-6 rounded-lg hover:brightness-90 transition shadow-sm">
              Daftar Akun Kab/Kota
            </Link>
          </div>
        );
      default:
        // --- PERBAIKAN: JIKA AKSES LANGSUNG, TAMPILKAN KEDUANYA ---
        return (
            <div className="mt-8 text-sm text-center">
              <p className="text-gray-600 mb-4 font-medium">Belum punya akun Dinas?</p>
              <div className="flex flex-col gap-3 justify-center sm:flex-row">
                <Link href="/register?role=provinsi" className="px-4 py-2 border border-[#00A86B] text-[#00A86B] rounded-lg hover:bg-green-50 transition font-semibold">
                  Daftar Provinsi
                </Link>
                <Link href="/register?role=kota" className="px-4 py-2 border border-[#00A86B] text-[#00A86B] rounded-lg hover:bg-green-50 transition font-semibold">
                  Daftar Kab/Kota
                </Link>
              </div>
            </div>
        );
    }
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl w-full max-w-md text-center border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-left text-sm">
            {error}
          </div>
        )}
        
        {/* Hapus Alert Kuning "Pilih peran" agar tidak mengganggu jika user mau langsung login */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-left text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email" required 
              // PERBAIKAN: Hapus disabled={!userType} agar bisa mengetik
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required 
                // PERBAIKAN: Hapus disabled={!userType}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00A86B] focus:border-[#00A86B] sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </div>
            </div>
            <div className="text-right mt-2 text-sm">
              <Link href="/lupa-password" className="font-semibold text-[#00A86B] hover:underline">Lupa password?</Link>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-[#00A86B] text-white font-bold py-3 px-4 rounded-lg hover:brightness-90 transition duration-300 shadow-sm disabled:bg-gray-400">
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {renderRegisterSection()}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4 space-y-8">
      <div className="flex justify-center">
        <SintaFullLogo />
      </div>
      <Suspense fallback={<div className="text-center">Memuat Form Login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}