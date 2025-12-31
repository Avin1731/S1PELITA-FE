'use client';

import { useState, useEffect } from 'react';
import InnerNav from '@/components/InnerNav';
import UserTable from '@/components/UserTable';
import Pagination from '@/components/Pagination';
import StatCard from '@/components/StatCard';
import axios from '@/lib/axios';
import { FiSearch } from 'react-icons/fi';
import Link from 'next/link';

const USERS_PER_PAGE = 25;

// Interface Data User
interface ApiUser {
  id: number;
  email: string;
  role: string;
  is_active: number | boolean;
  dinas?: {
    id: number;
    nama_dinas: string;
    type: string;
    region?: {
        nama_region: string;
    }
  };
  province_name?: string;
  regency_name?: string;
  display_name?: string;
}

// 🎨 Warna Stat Card
const statCardColors = [
  { bg: 'bg-slate-50', border: 'border-slate-300', titleColor: 'text-slate-600', valueColor: 'text-slate-800' }, 
  { bg: 'bg-blue-50', border: 'border-blue-300', titleColor: 'text-blue-600', valueColor: 'text-blue-800' },     
  { bg: 'bg-blue-50', border: 'border-blue-300', titleColor: 'text-blue-600', valueColor: 'text-blue-800' },     
  { bg: 'bg-green-50', border: 'border-green-300', titleColor: 'text-green-600', valueColor: 'text-green-800' }, 
  { bg: 'bg-red-50', border: 'border-red-300', titleColor: 'text-red-600', valueColor: 'text-red-800' },       
];

type TabValue = 'all' | 'dlh' | 'pusdatin' | 'admin';
type DlhTabValue = 'provinsi' | 'kabkota';

export default function UsersAktifPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  
  // [UBAH] Default activeTab jadi 'dlh' karena 'all' dihapus dari UI
  const [activeTab, setActiveTab] = useState<TabValue>('dlh');
  const [activeDlhTab, setActiveDlhTab] = useState<DlhTabValue>('provinsi');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    provinsi: 0,
    kabkota: 0,
    pusdatin: 0,
    admin: 0
  });

  // 1. Fetch All Users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/admin/all/approved`, {
          params: { per_page: 2000 } 
        });

        const data = res.data.data;
        setAllUsers(data);

        // Hitung Statistik
        setStats({
          total: data.length,
          provinsi: data.filter((u: ApiUser) => u.dinas?.type === 'provinsi' || u.role === 'provinsi').length,
          kabkota: data.filter((u: ApiUser) => u.dinas?.type === 'kabupaten/kota' || u.role === 'kabupaten/kota').length,
          pusdatin: data.filter((u: ApiUser) => u.role === 'pusdatin').length,
          admin: data.filter((u: ApiUser) => u.role === 'admin').length
        });

      } catch (e) {
        console.error('Gagal mengambil data user:', e);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 2. Logic Filter
  const getFilteredUsers = () => {
    let filtered = allUsers;

    if (activeTab === 'dlh') {
      if (activeDlhTab === 'provinsi') {
        filtered = filtered.filter(u => u.role === 'provinsi' || u.dinas?.type === 'provinsi');
      } else {
        filtered = filtered.filter(u => u.role === 'kabupaten/kota' || u.dinas?.type === 'kabupaten/kota');
      }
    } else if (activeTab === 'pusdatin') {
      filtered = filtered.filter(u => u.role === 'pusdatin');
    } else if (activeTab === 'admin') {
      filtered = filtered.filter(u => u.role === 'admin');
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(lowerSearch) ||
        (u.display_name && u.display_name.toLowerCase().includes(lowerSearch)) ||
        (u.dinas?.nama_dinas && u.dinas.nama_dinas.toLowerCase().includes(lowerSearch))
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [activeTab, activeDlhTab, searchTerm]);

  // [UBAH] Tab "Semua" dihapus dari UI
  const mainTabs = [
    { label: 'DLH', value: 'dlh' },
    { label: 'Pusdatin', value: 'pusdatin' },
    { label: 'Admin', value: 'admin' },
  ];

  const dlhTabs = [
    { label: 'Provinsi', value: 'provinsi' },
    { label: 'Kab/Kota', value: 'kabkota' },
  ];

  const isDlhTabActive = activeTab === 'dlh';

  const getThemeColor = () => {
    switch (activeTab) {
      case 'all': return 'slate';
      case 'dlh': return 'blue';
      case 'pusdatin': return 'green';
      case 'admin': return 'red';
      default: return 'slate';
    }
  };

  const currentTheme = getThemeColor();

  const statsData = [
    // Total User Aktif tetap ada kartunya, tapi link saya matikan ('#') dan cursor default
    { title: 'Total User Aktif', value: stats.total.toString(), link: '#', color: statCardColors[0], isStatic: true },
    { title: 'DLH Provinsi', value: stats.provinsi.toString(), link: '#provinsi', color: statCardColors[1] },
    { title: 'DLH Kab/Kota', value: stats.kabkota.toString(), link: '#kabkota', color: statCardColors[2] },
    { title: 'Tim Pusdatin', value: stats.pusdatin.toString(), link: '#pusdatin', color: statCardColors[3] },
    { title: 'Administrator', value: stats.admin.toString(), link: '#admin', color: statCardColors[4] },
  ];

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-600">Manajemen Pengguna Aktif</h1>
        <p className="text-gray-600">Daftar pengguna yang telah diverifikasi dan aktif di sistem.</p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsData.map((stat, index) => {
          // Jika isStatic (Total), render div biasa agar tidak bisa diklik
          if (stat.isStatic) {
            return (
               <div key={index} className="h-full block cursor-default">
                  <StatCard
                    bgColor={stat.color.bg}
                    borderColor={stat.color.border}
                    titleColor={stat.color.titleColor}
                    valueColor={stat.color.valueColor}
                    title={stat.title}
                    value={loading ? '...' : stat.value}
                  />
               </div>
            )
          }

          return (
            <Link 
              key={index} 
              href={stat.link}
              onClick={(e) => {
                e.preventDefault();
                if (stat.link === '#provinsi') { setActiveTab('dlh'); setActiveDlhTab('provinsi'); }
                else if (stat.link === '#kabkota') { setActiveTab('dlh'); setActiveDlhTab('kabkota'); }
                else if (stat.link === '#pusdatin') setActiveTab('pusdatin');
                else if (stat.link === '#admin') setActiveTab('admin');
              }}
              className="h-full block transition-transform hover:scale-105"
            >
              <StatCard
                bgColor={stat.color.bg}
                borderColor={stat.color.border}
                titleColor={stat.color.titleColor}
                valueColor={stat.color.valueColor}
                title={stat.title}
                value={loading ? '...' : stat.value}
              />
            </Link>
          );
        })}
      </div>

      {/* TABS & SEARCH */}
      <div>
        <InnerNav 
            tabs={mainTabs} 
            activeTab={activeTab} 
            onChange={(val) => setActiveTab(val as TabValue)} 
            activeColor={currentTheme}
        />

        {isDlhTabActive && (
            <InnerNav
                tabs={dlhTabs}
                activeTab={activeDlhTab}
                onChange={(val) => setActiveDlhTab(val as DlhTabValue)}
                className="mt-0"
                activeColor="blue"
            />
        )}
        
        <div className="mt-4 flex items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder={`Cari nama, email, atau instansi...`}
                    className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse w-full"></div>
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse w-full"></div>
        </div>
      ) : (
        <>
          <UserTable
            users={paginatedUsers.map((u) => ({
              id: u.id,
              name: u.display_name || u.dinas?.nama_dinas || u.email.split('@')[0],
              email: u.email,
              role: u.role, 
              jenis_dlh: u.dinas?.type ?? '-',
              status: 'aktif',
              province: u.province_name ?? '-',
              regency: u.regency_name ?? '-',
            }))}
            // Munculkan lokasi jika bukan Pusdatin & Admin
            showLocation={activeTab !== 'pusdatin' && activeTab !== 'admin'}
            
            // [BARU] Sembunyikan kolom Kab/Kota jika sedang buka tab Provinsi
            showRegency={activeDlhTab !== 'provinsi'}

            showDlhSpecificColumns={false} 
            theme={currentTheme}
          />

          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600">
              Menampilkan {paginatedUsers.length} dari total {filteredUsers.length} pengguna
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages > 0 ? totalPages : 1}
              onPageChange={setCurrentPage}
              siblings={1}
            />
          </div>
        </>
      )}
    </div>
  );
}