'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/context/AuthContext'; 
import StatCard from '@/components/StatCard'; 
import UserTable from '@/components/UserTable'; 
import Pagination from '@/components/Pagination'; 
import Link from 'next/link';
import axios from '@/lib/axios';
import { HiPlus } from 'react-icons/hi'; 
import { FiSearch } from 'react-icons/fi'; 
import UniversalModal from '@/components/UniversalModal';

const USERS_PER_PAGE = 15; // Sesuai default controller

const pusdatinColor = { 
  bg: 'bg-green-50', 
  border: 'border-green-300', 
  titleColor: 'text-green-600', 
  valueColor: 'text-green-800' 
};

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  showCancelButton: true,
  onConfirm: () => {},
  confirmLabel: 'Ya',
  cancelLabel: 'Batal',
};

export default function SettingsPage() {
  // Pagination State (Server Side)
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [users, setUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 

  // State untuk Aksi Delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);

  // --- Fetch Data ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint sesuai AdminController@showUser untuk Pusdatin
      const res = await axios.get('/api/admin/pusdatin/approved', {
          params: {
              page: currentPage,
              search: searchTerm,
              per_page: USERS_PER_PAGE
          }
      });
      
      const responseData = res.data;
      setUsers(responseData.data); // Data array dari Laravel paginate
      setLastPage(responseData.last_page);
      setTotalUsers(responseData.total);
      
    } catch (e) {
      console.error('Gagal mengambil data user Pusdatin:', e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]); // Dependency: page & search

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);

  // --- Modal Helpers ---
  const closeModal = () => setIsModalOpen(false);
  const resetModalConfig = () => setModalConfig(INITIAL_MODAL_CONFIG);

  // --- Delete Handlers ---
  const handleDeleteClick = (id: number) => {
    if (isDeleting) return;

    const userToDelete = users.find(u => u.id === id);

    setModalConfig({
      title: 'Nonaktifkan Akun?',
      message: `Apakah Anda yakin ingin menghapus akun "${userToDelete?.email}"? Tindakan ini permanen.`,
      variant: 'danger',
      showCancelButton: true,
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      onConfirm: () => performDelete(id),
    });
    setIsModalOpen(true);
  };

  const performDelete = async (id: number) => {
    setIsDeleting(true);
    setIsModalOpen(false); 

    try {
      // Endpoint sesuai AdminController@deleteUser
      await axios.delete(`/api/admin/users/${id}`);
      
      // Modal Sukses
      setModalConfig({
        title: 'Berhasil Dihapus',
        message: 'Akun Pusdatin telah berhasil dihapus.',
        variant: 'success',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'OK',
        cancelLabel: '',
      });
      setIsModalOpen(true);

      // Refresh Data
      fetchUsers();

    } catch (error) {
      console.error('Gagal menghapus user:', error);
      setModalConfig({
        title: 'Gagal',
        message: 'Terjadi kesalahan saat menghapus akun.',
        variant: 'danger',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'Tutup',
        cancelLabel: '',
      });
      setIsModalOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-green-800">Memuat Data...</h1>
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-green-800">Pengaturan Pusdatin</h1>
        <p className="text-gray-600">Kelola akun pengguna khusus tim Pusdatin.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-full transition-transform hover:scale-105">
          <StatCard
            bgColor={pusdatinColor.bg}
            borderColor={pusdatinColor.border}
            titleColor={pusdatinColor.titleColor}
            valueColor={pusdatinColor.valueColor}
            title="Total Akun Pusdatin"
            value={totalUsers.toString()}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari email Pusdatin..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset ke halaman 1 saat search berubah
            }}
          />
        </div>

        <Link
          href="/admin-dashboard/settings/add"
          className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow"
        >
          <HiPlus className="text-xl" />
          Buat Akun Pusdatin
        </Link>
      </div>

      <UserTable
        users={users.map((u) => ({
          id: u.id,
          // Karena DB users tidak punya kolom name, gunakan email atau fallback
          name: u.name || u.email.split('@')[0], 
          email: u.email,
          role: 'Pusdatin', 
          jenis_dlh: '-',   
          status: 'aktif',
          province: '-',
          regency: '-',
        }))}
        showLocation={false} 
        showDlhSpecificColumns={false} 
        onDelete={handleDeleteClick}
        isSubmitting={isDeleting}
      />

      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          Menampilkan {users.length} dari total {totalUsers} pengguna
        </span>

        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          onPageChange={setCurrentPage}
          siblings={1}
        />
      </div>

      <UniversalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onExitComplete={resetModalConfig}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        showCancelButton={modalConfig.showCancelButton}
        onConfirm={modalConfig.onConfirm}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
      />
    </div>
  );
}