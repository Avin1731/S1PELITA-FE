"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import SintaFullLogo from '@/components/SintaFullLogo';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'next/navigation';

// --- KOMPONEN IKON ---
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

// --- TIPE DATA ---
interface Province { id: string; nama: string; }
interface Regency { id: string; nama: string; }

// --- KONFIGURASI ROLE STRING ---
const ROLE_PROVINSI = 'provinsi'; 
const ROLE_KOTA = 'kabupaten/kota';

function RegisterForm() {
  const { register } = useAuth();
  const searchParams = useSearchParams();

  // Tangkap role target dari URL (?role=provinsi atau ?role=kota)
  const roleTarget = searchParams.get('role'); 
  
  // Tentukan Value Role String (untuk validasi frontend)
  const roleValueToSend = roleTarget === 'provinsi' ? ROLE_PROVINSI : (roleTarget === 'kota' ? ROLE_KOTA : null);

  // State Form
  const [namaDlh, setNamaDlh] = useState('');
  const [kodeDinas, setKodeDinas] = useState(''); // <--- FIELD WAJIB DARI BACKEND
  const [provinsi, setProvinsi] = useState('');
  const [kabKota, setKabKota] = useState('');
  const [pesisir, setPesisir] = useState('');
  const [email, setEmail] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // State UI
  const [pageTitle, setPageTitle] = useState('Registrasi DLH');
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRegencies, setIsFetchingRegencies] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Data Dropdown
  const [provincesList, setProvincesList] = useState<Province[]>([]);
  const [regenciesList, setRegenciesList] = useState<Regency[]>([]);

  // Boolean Helper
  const isKabKota = roleTarget === 'kota';

  // EFEK 1: Set Judul Halaman
  useEffect(() => {
    if (roleTarget === 'provinsi') setPageTitle('Registrasi Dinas Provinsi');
    else if (roleTarget === 'kota') setPageTitle('Registrasi Dinas Kab/Kota');
    else setApiError("Tipe akun tidak valid.");
  }, [roleTarget]);

  // EFEK 2: Fetch Provinsi
  useEffect(() => {
    axios.get<{ data: Province[] }>('/api/register/provinces')
      .then(res => setProvincesList(res.data.data))
      .catch(err => {
        console.error("Gagal ambil provinsi:", err);
        setApiError("Gagal memuat daftar provinsi. Pastikan koneksi backend aman.");
      });
  }, []);

  // EFEK 3: Fetch Kab/Kota (Hanya jika role kota)
  useEffect(() => {
    if (provinsi && isKabKota) {
      setIsFetchingRegencies(true);
      setKabKota('');
      setRegenciesList([]);

      axios.get<{ data: Regency[] }>(`/api/register/regencies/${provinsi}`)
        .then(res => setRegenciesList(res.data.data))
        .catch(err => {
          console.error("Gagal ambil kota:", err);
          setApiError("Gagal memuat daftar kab/kota.");
        })
        .finally(() => setIsFetchingRegencies(false));
    } else {
      setKabKota('');
      setRegenciesList([]);
    }
  }, [provinsi, isKabKota]);

  const handleNomorTeleponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    setNomorTelepon(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validasi Password
    if (password !== passwordConfirmation) {
      setFormError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    // 2. Validasi Role URL
    if (!roleValueToSend) {
      setFormError("Tipe akun tidak valid.");
      return;
    }

    // 3. LOGIKA PENENTUAN ID DINAS (CRUCIAL!)
    // Backend membutuhkan 'id_dinas'.
    // Jika user Provinsi -> 'id_dinas' adalah ID Provinsi.
    // Jika user Kota -> 'id_dinas' adalah ID Kota.
    const selectedDinasId = isKabKota ? kabKota : provinsi;

    if (!selectedDinasId) {
        setFormError("Silakan pilih Wilayah Dinas terlebih dahulu.");
        return;
    }

    if (!kodeDinas) {
        setFormError("Kode Dinas wajib diisi.");
        return;
    }

    setIsLoading(true);
    try {
      // --- KIRIM DATA KE BACKEND SESUAI AUTH CONTROLLER ---
      await register({
        name: namaDlh, // Dikirim sbg pelengkap
        email,
        nomor_telepon: nomorTelepon, // Dikirim sbg pelengkap (meski BE belum pakai, simpan di req)
        password,
        password_confirmation: passwordConfirmation,
        
        // --- FIELD UTAMA UNTUK BACKEND ---
        id_dinas: selectedDinasId, // Mapped dari Dropdown
        kode_dinas: kodeDinas,     // Input manual
        role: roleValueToSend,     // String 'provinsi'/'kabupaten/kota'
        // ---------------------------------
        
        province_id: provinsi,
        regency_id: isKabKota ? kabKota : undefined, 
        pesisir: pesisir,
      });
      // Redirect ke login ditangani di AuthContext jika sukses
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        if (err.response?.data?.errors) {
          const errors = err.response.data.errors;
          const firstError = Object.values(errors)[0] as string[];
          setFormError(firstError[0] || "Data tidak valid.");
        } else if (err.response?.data?.message) {
          setFormError(err.response.data.message);
        } else {
          setFormError('Registrasi gagal.');
        }
      } else {
        setFormError('Terjadi kesalahan sistem.');
      }
    } finally {
        setIsLoading(false);
    }
  };

  const pageError = apiError;

  return (
    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl w-full max-w-lg border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">{pageTitle}</h1>

        {pageError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{pageError}</div>}
        {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{formError}</div>}

        {!roleTarget && !isLoading && (
           <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
             Tipe akun tidak spesifik. Kembali ke <Link href="/" className="font-bold underline">halaman utama</Link>.
           </div>
        )}

        {roleTarget && !apiError && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nama DLH */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama DLH</label>
                <input type="text" value={namaDlh} onChange={(e) => setNamaDlh(e.target.value)} required 
                  placeholder="Contoh: DLH Jawa Barat / DLH Kota Bandung"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm" 
                />
              </div>

              {/* Grid Wilayah */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                  <select value={provinsi} onChange={(e) => setProvinsi(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm">
                    <option value="" disabled>-- Pilih --</option>
                    {provincesList.map(prov => (<option key={prov.id} value={prov.id}>{prov.nama}</option>))}
                  </select>
                </div>

                {isKabKota && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kab/Kota</label>
                    <select value={kabKota} onChange={(e) => setKabKota(e.target.value)} required disabled={!provinsi || isFetchingRegencies} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm disabled:bg-gray-100">
                      <option value="" disabled>{isFetchingRegencies ? "Memuat..." : "-- Pilih --"}</option>
                      {regenciesList.map(reg => (<option key={reg.id} value={reg.id}>{reg.nama}</option>))}
                    </select>
                  </div>
                )}
                
                <div className={isKabKota ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700">Wilayah Pesisir?</label>
                  <select value={pesisir} onChange={(e) => setPesisir(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm">
                    <option value="" disabled>-- Pilih --</option>
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </div>
              </div>

              {/* INPUT BARU: Kode Dinas (Required by Backend) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Kode Dinas (Token Aktivasi)</label>
                <input 
                  type="text" 
                  value={kodeDinas} 
                  onChange={(e) => setKodeDinas(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm" 
                  placeholder="Masukkan kode unik dinas"
                />
                <p className="text-xs text-gray-500 mt-1">*Kode ini didapat dari Administrator Pusat</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                  placeholder="email@dinas.go.id"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm" 
                />
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <input type="tel" value={nomorTelepon} onChange={handleNomorTeleponChange} required 
                  placeholder="08xxxxxxxxxx"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm" 
                />
              </div>

              {/* Password */}
              <div>
                 <label className="block text-sm font-medium text-gray-700">Password</label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm" placeholder="Min 8 karakter"/>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </div>
                 </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                 <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                    <input type={showConfirmPassword ? "text" : "password"} value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:ring-[#00A86B] sm:text-sm" placeholder="Ulangi password"/>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </div>
                 </div>
              </div>

              {/* Tombol Register */}
              <div className="pt-4">
                <button type="submit" disabled={!roleTarget || isLoading || isFetchingRegencies} className="w-full bg-[#00A86B] text-white font-bold py-3 px-4 rounded-lg hover:brightness-90 transition duration-300 shadow-sm disabled:bg-gray-400">
                  {isLoading ? 'Memproses...' : 'Daftar'}
                </button>
              </div>

              {/* Link Kembali ke Login */}
              <div className="mt-6 text-sm text-center">
                <p className="text-gray-600">
                  Sudah punya akun?{' '}
                  <Link href={`/login?as=${roleTarget === 'provinsi' ? 'provinsi' : 'kota'}`} className="font-semibold text-[#00A86B] hover:underline">
                    Login di sini
                  </Link>
                </p>
              </div>
            </form>
        )}
    </div>
  );
}

export default function RegisterPage() {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4 space-y-8">
        <div className="flex justify-center">
          <SintaFullLogo />
        </div>
        <Suspense fallback={<div className="text-center">Memuat Form Registrasi...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
    );
}