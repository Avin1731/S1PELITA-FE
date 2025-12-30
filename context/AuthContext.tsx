"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

// --- TIPE DATA ---
interface Province { id: string; nama: string; }

export interface User {
  id: number;
  name: string;
  email: string;
  // Handle format role dari backend yang bisa berupa object atau string
  role: { name: string } | string; 
  dinas_id?: number | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// --- UPDATE: MENAMBAHKAN id_dinas DAN kode_dinas ---
interface RegisterData {
  name: string;
  email: string;
  nomor_telepon: string;
  password: string;
  password_confirmation: string;
  role: string;
  
  // Field Baru (Wajib untuk Backend Teman Anda)
  id_dinas: string;
  kode_dinas: string;
  
  // Field Lama (Tetap disimpan jika perlu)
  province_id?: string;
  regency_id?: string;
  pesisir: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  provinces: Province[];
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const router = useRouter();

  // --- FUNGSI FETCH USER (Token Based) ---
  const fetchUser = async (token: string): Promise<User | null> => {
    try {
      // Set Header Authorization
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const res = await axios.get<User>('/api/user');
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Gagal mengambil data user (Token Expired/Invalid):", error);
      // Hapus sesi jika error
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      return null;
    }
  };

  // --- INIT AUTH ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetchUser(token);
      }
      
      // Load Dropdown Wilayah (Public)
      try {
        const provRes = await axios.get<{ data: Province[] }>('/api/register/provinces');
        setProvinces(provRes.data.data); 
      } catch (e) { 
        console.warn("Gagal load provinsi:", e); 
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // --- LOGIN ---
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await axios.post('/api/login', credentials);
      
      // Ambil Token & User Data
      const token = response.data.user.token; 
      const userData = response.data.user;

      if (!token) throw new Error("Token tidak ditemukan di response server");

      // Simpan Token
      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      // Redirect Logic
      let roleName = '';
      if (userData.role?.name) {
        roleName = userData.role.name.toLowerCase();
      } else if (typeof userData.role === 'string') {
        roleName = userData.role.toLowerCase();
      }

      if (roleName === 'admin') router.push('/admin/dashboard');
      else if (roleName === 'pusdatin') router.push('/pusdatin/dashboard');
      else if (roleName === 'provinsi' || roleName === 'kabupaten/kota') router.push('/dinas/dashboard');
      else router.push('/');

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // --- REGISTER ---
  const register = async (data: RegisterData): Promise<void> => {
    try {
      await axios.post('/api/register', data);
      router.push('/login'); 
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  // --- LOGOUT ---
  const logout = async (): Promise<void> => {
    try {
      await axios.post('/api/logout');
    } catch (e) { 
      console.error("Logout API error:", e); 
    } finally {
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      router.push('/');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, loading, provinces, login, register, logout }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthContext');
  return context;
};