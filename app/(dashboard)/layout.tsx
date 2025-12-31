"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Ini adalah layout "Penjaga Gerbang" dan struktur utama Dashboard (Fullscreen Content)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman utama jika belum login
    if (!loading && !user) {
      router.push('/'); 
    }
  }, [user, loading, router]);

  // Tampilkan Skeleton Loading saat AuthContext masih mengecek
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-8 space-y-8 animate-pulse bg-white">
         {/* Simulasi Header/Title */}
         <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-64"></div>
         </div>

         {/* Simulasi Stat Cards (Grid) */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-36 bg-gray-100 rounded-xl border border-gray-200"></div>
            <div className="h-36 bg-gray-100 rounded-xl border border-gray-200"></div>
            <div className="h-36 bg-gray-100 rounded-xl border border-gray-200"></div>
         </div>

         {/* Simulasi Content Utama / Table / Chart */}
         <div className="flex-grow h-96 bg-gray-100 rounded-xl border border-gray-200 w-full"></div>
      </div>
    );
  }

  // Jika user ADA, tampilkan konten Dashboard
  if (user) {
    return (
      // Konten utama akan mengisi ruang di bawah Header yang sudah ada di Root Layout
      <div className="flex flex-col min-h-screen">
        
        <main className="flex-grow p-8">
          {children} {/* Halaman spesifik (Admin, Pusdatin, DLH) */}
        </main>
        
      </div>
    );
  }

  // Jika user tidak ada (dan sedang proses redirect), tampilkan null
  return null;
}