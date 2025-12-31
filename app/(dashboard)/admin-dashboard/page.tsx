'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import Link from 'next/link';
import axios from '@/lib/axios';

interface DashboardStats {
  total_users_aktif: number;
  total_users_pending: number;
  storage?: {
    used_mb: number;
    used_gb: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users_aktif: 0,
    total_users_pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Gagal mengambil statistik dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Main Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-100 rounded-xl border border-gray-200"></div>
          <div className="h-40 bg-gray-100 rounded-xl border border-gray-200"></div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
           {/* Storage Skeleton */}
           <div className="h-32 bg-gray-100 rounded-xl border border-gray-200"></div>
           {/* Log Shortcut Skeleton */}
           <div className="h-32 bg-gray-100 rounded-xl border border-gray-200 col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali, Admin. Berikut ringkasan sistem saat ini.</p>
      </header>

      {/* Statistik Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kartu User Aktif */}
        <Link 
          href="/admin-dashboard/users/active" // Sesuaikan path jika pakai 'active' atau 'aktif'
          className="block transition-transform hover:scale-105"
        >
          <StatCard
            bgColor="bg-green-50"
            borderColor="border-green-300"
            titleColor="text-green-600"
            valueColor="text-green-800"
            title="Total User Aktif"
            value={stats.total_users_aktif.toString()}
          />
        </Link>

        {/* Kartu User Pending */}
        <Link 
          href="/admin-dashboard/users/pending"
          className="block transition-transform hover:scale-105"
        >
          <StatCard
            bgColor="bg-yellow-50"
            borderColor="border-yellow-300"
            titleColor="text-yellow-600"
            valueColor="text-yellow-800"
            title="Menunggu Persetujuan (Pending)"
            value={stats.total_users_pending.toString()}
          />
        </Link>

      </div>

      {/* Area Detail Storage & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
         {/* Info Storage */}
         <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-center transition hover:shadow-md">
             <h3 className="text-lg font-semibold text-gray-800">Penyimpanan</h3>
             <p className="text-3xl font-bold text-blue-600 mt-2">{stats.storage?.used_mb ?? 0} MB</p>
             <p className="text-sm text-gray-500 mt-1">Total data fisik digunakan</p>
         </div>

        {/* Shortcut Logs */}
        <Link 
           href="/admin-dashboard/users/logs"
           className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between group col-span-2"
        >
           <div>
             <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Lihat Log Aktivitas</h3>
             <p className="text-sm text-gray-500 mt-1">Pantau riwayat aktivitas pengguna di sistem secara real-time.</p>
           </div>
           <span className="text-2xl text-gray-400 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>

    </div>
  );
}