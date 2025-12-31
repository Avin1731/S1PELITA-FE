"use client";

import { useAuth } from '@/context/AuthContext';
import ProfileCard, { Detail } from '@/components/ProfileCard'; 
import { User, Mail, Phone, MapPin, Briefcase, Info } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, provinces, regencies, jenisDlhs } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) return null; 

  // --- Helper Functions ---
  // [FIX] Sekarang aman pakai .name karena di context sudah distandarisasi
  const getProvinceName = (id: string | undefined) => 
    provinces.find(p => p.id === id)?.name || '-';
  
  const getRegencyName = (id: string | undefined) => 
    regencies.find(r => r.id === id)?.name || '-';

  const getJenisDlhName = (id: number | undefined) => 
    jenisDlhs?.find(j => j.id === id)?.name || '-';

  const formatPhone = (phone: string | undefined) => {
    if (!phone) return '-';
    return phone.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  };

  const formatPesisir = (val: boolean | number | string | undefined) => {
    if (val === true || val === 1 || val === '1') return 'Ya';
    return 'Tidak';
  };

  // --- Data Setup ---
  // [FIX] Normalisasi Role Name agar tidak error
  const roleName = typeof user.role === 'string' 
    ? user.role.toLowerCase() 
    : user.role?.name?.toLowerCase() || '';

  // Untuk display label yang cantik (Capitalize)
  const displayRoleName = typeof user.role === 'string' 
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : user.role?.name || '-';

  const title = 'Informasi Pengguna';
  const statusBadge = 'Akun Aktif';
  const avatarInitial = user.name?.charAt(0).toUpperCase() || 'U';
  
  let greeting = `Halo, ${user.name}`;
  let details: Detail[] = [];
  let editLink = '/profile/edit'; 

  // --- Logika Konten Berdasarkan Role ---

  if (roleName === 'admin') {
    greeting = `Halo, Administrator`;
    editLink = '/admin-dashboard/profile/edit';
    details = [
      { icon: User, label: 'Nama Lengkap', value: user.name },
      { icon: Briefcase, label: 'Peran', value: 'Administrator Sistem' },
      { icon: Mail, label: 'Email', value: user.email },
      { icon: Phone, label: 'No. Telepon', value: formatPhone(user.nomor_telepon) },
      { icon: MapPin, label: 'Lokasi', value: 'Pusat' },
    ];

  } else if (roleName === 'pusdatin') {
    greeting = `Halo, Tim Pusdatin`;
    editLink = '/pusdatin-dashboard/profile/edit';
    details = [
      { icon: User, label: 'Nama Akun', value: user.name },
      { icon: Briefcase, label: 'Peran', value: 'Verifikator Pusdatin' },
      { icon: Mail, label: 'Email', value: user.email },
      { icon: Phone, label: 'No. Telepon', value: formatPhone(user.nomor_telepon) },
      { icon: MapPin, label: 'Lokasi', value: 'Kementerian LHK' },
    ];

  } else if (roleName === 'dlh' || roleName === 'provinsi' || roleName === 'kabupaten/kota' || roleName.includes('dinas')) {
    editLink = '/dlh-dashboard/profile/edit';
    
    const provinceName = getProvinceName(user.province_id);
    const regencyName = getRegencyName(user.regency_id);
    const jenisDlhName = getJenisDlhName(user.jenis_dlh_id);

    details = [
      { icon: User, label: 'Nama Instansi', value: user.name }, 
      // [FIX] Gunakan displayRoleName yang sudah aman
      { icon: Briefcase, label: 'Peran', value: displayRoleName },
      { icon: Info, label: 'Tipe Instansi', value: jenisDlhName },
      { icon: Mail, label: 'Email Resmi', value: user.email },
      { icon: Phone, label: 'No. Telepon', value: formatPhone(user.nomor_telepon) },
      { icon: MapPin, label: 'Provinsi', value: provinceName },
    ];

    const isKabKota = jenisDlhName.toLowerCase().includes('kab') || jenisDlhName.toLowerCase().includes('kota');
    
    if (isKabKota) {
      details.push({ 
        icon: MapPin, 
        label: 'Kabupaten/Kota', 
        value: regencyName 
      });
    }

    details.push({ 
      icon: MapPin, 
      label: 'Wilayah Pesisir', 
      value: formatPesisir(user.pesisir) 
    });
  }

  const actions = (
    <Link 
      href={editLink}
      className="inline-block bg-[#00A86B] text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 shadow-sm"
    >
      Edit Profil
    </Link>
  );

  return (
    <ProfileCard
      title={title}
      details={details}
      actions={actions}
      statusBadge={statusBadge}
      greeting={greeting}
      avatarInitial={avatarInitial}
    />
  );
}