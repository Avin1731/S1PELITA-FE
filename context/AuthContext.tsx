"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

// [FIX] Definisi Interface yang Konsisten
interface Province { id: string; name: string; }
interface Regency { id: string; province_id: string; name: string; }
interface JenisDlh { id: number; name: string; }

// [BARU] Interface untuk Response API Mentah (menghindari 'any')
interface ApiProvince { id: string; name?: string; nama?: string; }
interface ApiRegency { id: string; province_id: string; name?: string; nama?: string; }
interface ApiJenisDlh { id: number; name: string; }

export interface User {
  id: number;
  name: string;
  email: string;
  role: string | { name: string }; 
  dinas_id?: number | null;
  is_active?: boolean | number;
  nomor_telepon?: string;
  pesisir?: boolean | number;
  province_id?: string;
  regency_id?: string;
  jenis_dlh_id?: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  nomor_telepon: string;
  password: string;
  password_confirmation: string;
  role: string;
  id_dinas?: string;
  kode_dinas?: string;
  province_id?: string;
  regency_id?: string;
  pesisir?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  provinces: Province[];
  regencies: Regency[];
  jenisDlhs: JenisDlh[];
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [jenisDlhs, setJenisDlhs] = useState<JenisDlh[]>([]);
  
  const router = useRouter();

  const fetchUser = async (token: string): Promise<User | null> => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get<User>('/api/user');
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      return null;
    }
  };

  const fetchMasterData = async () => {
    try {
      // [FIX] Gunakan Interface Spesifik, bukan 'any'
      const provRes = await axios.get<{ data: ApiProvince[] }>('/api/register/provinces');
      const mappedProvinces: Province[] = provRes.data.data.map((p) => ({
        id: p.id,
        name: p.name || p.nama || '-' // Fallback ke '-' jika null
      }));
      setProvinces(mappedProvinces);

      // [FIX] Gunakan Interface Spesifik, bukan 'any'
      const regRes = await axios.get<{ data: ApiRegency[] }>('/api/register/regencies'); 
      const mappedRegencies: Regency[] = regRes.data.data.map((r) => ({
        id: r.id,
        province_id: r.province_id,
        name: r.name || r.nama || '-'
      }));
      setRegencies(mappedRegencies);

      const jenisRes = await axios.get<{ data: ApiJenisDlh[] }>('/api/register/jenis-dlh');
      setJenisDlhs(jenisRes.data.data);

    } catch {
      console.warn("Gagal memuat data master wilayah/jenis DLH");
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetchUser(token);
      }
      
      await fetchMasterData();
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await axios.post('/api/login', credentials);
      const token = response.data.token || response.data.user.token;
      const userData = response.data.user;

      if (!token) throw new Error("Token tidak ditemukan");

      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      const roleName = typeof userData.role === 'string' 
        ? userData.role.toLowerCase() 
        : userData.role?.name?.toLowerCase();

      if (userData.is_active === false || userData.is_active === 0) {
         alert("Akun Anda belum aktif. Silakan hubungi admin.");
         return; 
      }

      switch (roleName) {
        case 'admin': router.push('/admin-dashboard'); break;
        case 'pusdatin': router.push('/pusdatin-dashboard'); break;
        case 'provinsi':        
        case 'kabupaten/kota':  
          router.push('/dlh-dashboard'); break;
        default: router.push('/'); break;
      }

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      await axios.post('/api/register', data);
      router.push('/login'); 
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post('/api/logout');
    } catch (e) { 
      console.error("Logout API error:", e); 
    } finally {
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      router.push('/login');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Memuat sesi...</p>
        </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, loading, provinces, regencies, jenisDlhs, login, register, logout }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthContext');
  return context;
};