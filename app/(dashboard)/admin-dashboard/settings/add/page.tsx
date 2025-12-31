'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { AxiosError } from 'axios';
import UniversalModal from '@/components/UniversalModal';
import { HiArrowLeft, HiSave } from 'react-icons/hi';
import Link from 'next/link';

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  no_hp: '',    
};

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  showCancelButton: false,
  onConfirm: () => {},
  confirmLabel: 'Oke',
};

export default function AddPusdatinPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      setModalConfig({
        title: 'Validasi Gagal',
        message: 'Konfirmasi password tidak sesuai.',
        variant: 'danger',
        showCancelButton: false,
        confirmLabel: 'Tutup',
        onConfirm: closeModal
      });
      setIsModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name, 
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        nomor_telepon: formData.no_hp, 
        role: 'pusdatin', 
        status: 'aktif', 
      };

      // Request ini akan mentrigger controller createPusdatin di Backend
      // Di controller itulah Log Activity akan dicatat otomatis.
      await axios.post('/api/admin/users/pusdatin', payload);
      
      setModalConfig({
        title: 'Berhasil',
        message: 'Akun Pusdatin berhasil dibuat.',
        variant: 'success',
        showCancelButton: false,
        confirmLabel: 'Kembali ke List',
        onConfirm: () => router.push('/admin-dashboard/settings'),
      });
      setIsModalOpen(true);

    } catch (error) {
      console.error('Gagal membuat user:', error);
      
      const err = error as AxiosError<{ message: string | Record<string, string[]> }>;
      let errorMsg = 'Terjadi kesalahan saat membuat akun.';

      if (err.response?.data?.message) {
          const msg = err.response.data.message;
          if (typeof msg === 'object') {
             errorMsg = Object.values(msg).flat().join(', ');
          } else {
             errorMsg = msg;
          }
      }
      
      setModalConfig({
        title: 'Gagal',
        message: errorMsg,
        variant: 'danger',
        showCancelButton: false,
        confirmLabel: 'Tutup',
        onConfirm: closeModal
      });
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/admin-dashboard/settings" 
          className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors"
        >
          <HiArrowLeft className="mr-2" />
          Kembali ke Pengaturan Pusdatin
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-green-800">Tambah Akun Pusdatin</h1>
        <p className="text-gray-600">Buat akun baru untuk tim Pusat Data dan Informasi.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Informasi Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Contoh: Admin Pusdatin 1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="nama@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
              <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="0812..." />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Keamanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Minimal 6 karakter" minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
              <input required type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ulangi password" />
            </div>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-4">
          <button type="button" onClick={() => router.push('/admin-dashboard/settings')} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors" disabled={isSubmitting}>Batal</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
            {isSubmitting ? 'Menyimpan...' : <><HiSave className="text-lg" /> Simpan Akun</>}
          </button>
        </div>
      </form>

      <UniversalModal isOpen={isModalOpen} onClose={closeModal} title={modalConfig.title} message={modalConfig.message} variant={modalConfig.variant} showCancelButton={modalConfig.showCancelButton} onConfirm={modalConfig.onConfirm} confirmLabel={modalConfig.confirmLabel} />
    </div>
  );
}