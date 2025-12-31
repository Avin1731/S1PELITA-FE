"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save, Lock, User, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios'; // [FIX] Import helper
import Link from 'next/link';

export default function ProfileEditPage() {
  const { user, loading: authLoading } = useAuth();
  
  // [FIX] Hapus 'router' jika tidak dipakai
  // const router = useRouter(); 

  // State Form Profil
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nomor_telepon: '',
  });

  // State Form Password
  const [passData, setPassData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Isi form saat user data tersedia
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        nomor_telepon: user.nomor_telepon || '',
      });
    }
  }, [user]);

  if (authLoading || !user) {
    return <div className="text-center py-10">Memuat data...</div>;
  }

  // --- HANDLER UPDATE PROFIL ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.put('/api/profile', formData);
      
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
      setTimeout(() => window.location.reload(), 1000); 
    } catch (error: unknown) { // [FIX] Ganti any -> unknown
      const errorMsg = isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : 'Gagal memperbarui profil.';
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER GANTI PASSWORD ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passData.password !== passData.password_confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      setLoading(false);
      return;
    }

    try {
      await axios.put('/api/password', passData);
      
      setMessage({ type: 'success', text: 'Password berhasil diubah.' });
      setPassData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: unknown) { // [FIX] Ganti any -> unknown
      const errorMsg = isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : 'Gagal mengubah password. Periksa password lama Anda.';
        
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Edit Profil</h1>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KARTU 1: EDIT INFORMASI DASAR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Informasi Dasar</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap / Instansi</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.nomor_telepon}
                  onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* KARTU 2: GANTI PASSWORD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Keamanan (Ganti Password)</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
              <input
                type="password"
                value={passData.current_password}
                onChange={(e) => setPassData({ ...passData, current_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={passData.password}
                onChange={(e) => setPassData({ ...passData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition outline-none"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passData.password_confirmation}
                onChange={(e) => setPassData({ ...passData, password_confirmation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition outline-none"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Memproses...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}