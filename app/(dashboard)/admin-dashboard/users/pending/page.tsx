'use client';

import { useState, useEffect, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import InnerNav from '@/components/InnerNav';
import UserTable from '@/components/UserTable';
import Pagination from '@/components/Pagination';
import UniversalModal from '@/components/UniversalModal';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios'; // [FIX] Import Helper isAxiosError
import Link from 'next/link';

// ... (Interface dan statCardColors tetap sama) ...
interface ApiUser {
  id: number;
  email: string;
  role: string;
  is_active: number | boolean;
  dinas?: { id: number; nama_dinas: string; type: string; };
  province_name?: string;
  regency_name?: string;
}

const statCardColors = [
  { bg: 'bg-gray-50', border: 'border-yellow-300', titleColor: 'text-yellow-600', valueColor: 'text-yellow-800' },
  { bg: 'bg-gray-50', border: 'border-yellow-300', titleColor: 'text-yellow-600', valueColor: 'text-yellow-800' },
];

export default function UsersPendingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'provinsi' | 'kabkota'>('provinsi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ dlhProvinsi: 0, dlhKabKota: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
      title: '', message: '', variant: 'warning' as 'success' | 'warning' | 'danger', onConfirm: () => {}, showCancel: true
  });

  const fetchStats = useCallback(async () => {
    try {
        const [resProv, resKab] = await Promise.all([
            axios.get('/api/admin/provinsi/0', { params: { per_page: 1 } }),
            axios.get('/api/admin/kabupaten/0', { params: { per_page: 1 } })
        ]);
        setStats({ dlhProvinsi: resProv.data.total, dlhKabKota: resKab.data.total });
    } catch (error) { console.error('Gagal mengambil statistik pending:', error); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let roleParam: string = activeTab;
      if (activeTab === 'kabkota') roleParam = 'kabupaten';

      const res = await axios.get(`/api/admin/${roleParam}/0`, { params: { page: currentPage, per_page: 25 } });
      
      setUsers(res.data.data);
      setLastPage(res.data.last_page);
      setTotalUsers(res.data.total);
    } catch (error) {
      console.error('Gagal mengambil data user pending:', error);
      setUsers([]);
    } finally { setLoading(false); }
  }, [activeTab, currentPage]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // [FIX] Perbaikan Logic Error Handling
  const handleAction = async (action: 'approve' | 'reject', id: number) => {
    setIsSubmitting(true);
    setIsModalOpen(false);

    try {
        if (action === 'approve') {
            await axios.patch(`/api/admin/users/approve/${id}`);
        } else {
            await axios.delete(`/api/admin/users/reject/${id}`);
        }

        fetchUsers();
        fetchStats();

        setModalConfig({
            title: 'Berhasil',
            message: `User berhasil di${action === 'approve' ? 'setujui' : 'tolak'}.`,
            variant: 'success',
            showCancel: false,
            onConfirm: () => setIsModalOpen(false)
        });
        setIsModalOpen(true);

    } catch (error: unknown) { // [FIX] Gunakan unknown
        console.error(error);
        
        // [FIX] Gunakan const dan pengecekan tipe yang aman
        const errorMessage = isAxiosError(error) && error.response?.data?.message 
            ? error.response.data.message 
            : 'Terjadi kesalahan sistem.';

        setModalConfig({
            title: 'Gagal',
            message: errorMessage,
            variant: 'danger',
            showCancel: false,
            onConfirm: () => setIsModalOpen(false)
        });
        setIsModalOpen(true);
    } finally {
        setIsSubmitting(false);
    }
  };

  const confirmAction = (action: 'approve' | 'reject', id: number) => {
    setModalConfig({
        title: `Konfirmasi ${action === 'approve' ? 'Persetujuan' : 'Penolakan'}`,
        message: `Apakah Anda yakin ingin ${action === 'approve' ? 'mengaktifkan' : 'menghapus'} akun ini?`,
        variant: action === 'approve' ? 'warning' : 'danger',
        showCancel: true,
        onConfirm: () => handleAction(action, id)
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-yellow-800">Manajemen Pengguna Pending</h1>
        <p className="text-gray-600">Daftar pengguna DLH yang menunggu persetujuan admin.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab("provinsi"); setCurrentPage(1); }}>
          <StatCard {...statCardColors[0]} title="DLH Provinsi (Pending)" value={stats.dlhProvinsi.toString()} />
        </Link>
        <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab("kabkota"); setCurrentPage(1); }}>
          <StatCard {...statCardColors[1]} title="DLH Kab/Kota (Pending)" value={stats.dlhKabKota.toString()} />
        </Link>
      </div>

      <InnerNav
        tabs={[
          { label: 'DLH Provinsi', value: 'provinsi' },
          { label: 'DLH Kab/Kota', value: 'kabkota' },
        ]}
        activeTab={activeTab}
        onChange={(value) => { setActiveTab(value as 'provinsi' | 'kabkota'); setCurrentPage(1); }}
        // [FIX] 'yellow' sekarang sudah valid
        activeColor="yellow" 
      />

      {loading ? (
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      ) : (
        <UserTable
          users={users.map((u) => ({
            id: u.id,
            name: u.dinas?.nama_dinas || u.email,
            email: u.email,
            role: u.role,
            jenis_dlh: u.dinas?.type,
            status: 'pending',
            province: u.province_name ?? '-',
            regency: u.regency_name ?? '-',
          }))}
          onApprove={(id) => confirmAction('approve', id)}
          onReject={(id) => confirmAction('reject', id)}
          showLocation={true}
          showRegency={activeTab === 'kabkota'} 
          showDlhSpecificColumns={false}
          isSubmitting={isSubmitting} 
          // [FIX] 'yellow' sekarang sudah valid
          theme="yellow" 
        />
      )}

      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">Halaman {currentPage} dari {lastPage} <span className="font-semibold">(Total: {totalUsers} Pengguna)</span></span>
        <Pagination currentPage={currentPage} totalPages={lastPage} onPageChange={setCurrentPage} siblings={1} />
      </div>

      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        confirmLabel="Ya"
        cancelLabel="Batal"
        showCancelButton={modalConfig.showCancel}
      />
    </div>
  );
}