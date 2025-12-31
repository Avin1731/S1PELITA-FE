'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import InnerNav from '@/components/InnerNav';
import LastActivityCard, { Log } from '@/components/LastActivityCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import axios from '@/lib/axios';

const LOGS_PER_PAGE = 25;

interface ApiLog {
  id: number;
  user: string;
  email: string;
  role: string;
  action: string;
  target: string;
  time: string;
  status: string;
  province_name?: string; // Pastikan ini ada di interface
  regency_name?: string;  // Pastikan ini ada di interface
}

interface LogsResponse {
  data: ApiLog[];
  current_page: number;
  last_page: number;
  total: number;
}

const statCardColors = [
  { bg: 'bg-slate-50', border: 'border-slate-300', titleColor: 'text-slate-600', valueColor: 'text-slate-800' },
  { bg: 'bg-blue-50', border: 'border-blue-300', titleColor: 'text-blue-600', valueColor: 'text-blue-800' },
  { bg: 'bg-blue-50', border: 'border-blue-300', titleColor: 'text-blue-600', valueColor: 'text-blue-800' },
  { bg: 'bg-green-50', border: 'border-green-300', titleColor: 'text-green-600', valueColor: 'text-green-800' },
  { bg: 'bg-red-50', border: 'border-red-300', titleColor: 'text-red-600', valueColor: 'text-red-800' },
];

type TabValue = 'all' | 'dlh' | 'pusdatin' | 'admin';
type DlhTabValue = 'provinsi' | 'kabkota';

export default function UsersLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  // Default ke 'dlh'
  const [activeTab, setActiveTab] = useState<TabValue>('dlh');
  const [activeDlhTab, setActiveDlhTab] = useState<DlhTabValue>('provinsi');

  const [stats, setStats] = useState({
    totalLogs: 0,
    dlhProvinsiLogs: 0,
    dlhKabKotaLogs: 0,
    pusdatinLogs: 0,
    adminLogs: 0,
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Jakarta', timeZoneName: 'short'
      }).format(date);
    } catch { return isoString; }
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get<LogsResponse>('/api/admin/logs/system', { params: { limit: 100 } });
        const rawData = res.data.data;

        const transformedLogs: Log[] = rawData.map((item) => {
            let uiRole: 'dlh' | 'pusdatin' | 'admin' = 'admin';
            let jenisDlh: 'provinsi' | 'kabkota' | undefined = undefined;

            if (item.role === 'provinsi') {
                uiRole = 'dlh'; jenisDlh = 'provinsi';
            } else if (item.role === 'kabupaten/kota') {
                uiRole = 'dlh'; jenisDlh = 'kabkota';
            } else if (item.role === 'pusdatin') {
                uiRole = 'pusdatin';
            } else {
                uiRole = 'admin';
            }

            let statusVisual = 'info';
            const statusLower = item.status?.toLowerCase() || '';
            if (['approved', 'success', 'terdaftar', 'approve'].includes(statusLower)) statusVisual = 'success';
            else if (['pending', 'process', 'draft'].includes(statusLower)) statusVisual = 'warning';
            else if (['rejected', 'error', 'failed', 'reject', 'delete'].includes(statusLower)) statusVisual = 'error';

            return {
                id: item.id,
                user: item.user,
                role: uiRole,
                jenis_dlh: jenisDlh,
                province_name: item.province_name, // Mapping data provinsi
                regency_name: item.regency_name,   // Mapping data kab/kota
                action: item.action,
                target: item.target,
                time: formatDate(item.time), 
                status: statusVisual
            };
        });

        const data = transformedLogs;

        setLogs(data);
        setStats({
          totalLogs: data.length,
          dlhProvinsiLogs: data.filter(log => log.role === 'dlh' && log.jenis_dlh === 'provinsi').length,
          dlhKabKotaLogs: data.filter(log => log.role === 'dlh' && log.jenis_dlh === 'kabkota').length,
          pusdatinLogs: data.filter(log => log.role === 'pusdatin').length,
          adminLogs: data.filter(log => log.role === 'admin').length,
        });
      } catch (error) {
        console.error('Gagal mengambil data log:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'dlh') {
      if (activeDlhTab === 'provinsi') return log.role === 'dlh' && log.jenis_dlh === 'provinsi';
      if (activeDlhTab === 'kabkota') return log.role === 'dlh' && log.jenis_dlh === 'kabkota';
    }
    return log.role === activeTab;
  });

  const paginatedLogs = () => {
    const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);
  };

  useEffect(() => { setCurrentPage(1); }, [activeTab, activeDlhTab]);

  const mainTabs: { label: string; value: TabValue }[] = [
    { label: 'DLH', value: 'dlh' },
    { label: 'Pusdatin', value: 'pusdatin' },
    { label: 'Admin', value: 'admin' },
  ];

  const dlhTabs: { label: string; value: DlhTabValue }[] = [
    { label: 'Provinsi', value: 'provinsi' },
    { label: 'Kab/Kota', value: 'kabkota' },
  ];

  const isDlhTabActive = activeTab === 'dlh';

  const statsData = [
    { title: 'Total Log Aktivitas', value: stats.totalLogs.toString(), link: '#', color: statCardColors[0], isStatic: true },
    { title: 'Log DLH Provinsi', value: stats.dlhProvinsiLogs.toString(), link: '#dlh-provinsi', color: statCardColors[1] },
    { title: 'Log DLH Kab/Kota', value: stats.dlhKabKotaLogs.toString(), link: '#dlh-kabkota', color: statCardColors[2] },
    { title: 'Log Pusdatin', value: stats.pusdatinLogs.toString(), link: '#pusdatin', color: statCardColors[3] },
    { title: 'Log Admin', value: stats.adminLogs.toString(), link: '#admin', color: statCardColors[4] },
  ];

  const getTabColor = (tabValue: TabValue) => {
    switch (tabValue) {
      case 'dlh': return 'blue';
      case 'pusdatin': return 'green';
      case 'admin': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-600">Log Aktivitas Pengguna</h1>
        <p className="text-gray-600">Catatan semua aktivitas yang dilakukan oleh pengguna di sistem.</p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsData.map((stat, index) => {
            if (stat.isStatic) {
                return (
                    <div key={index} className="h-full block cursor-default">
                        <StatCard bgColor={stat.color.bg} borderColor={stat.color.border} titleColor={stat.color.titleColor} valueColor={stat.color.valueColor} title={stat.title} value={loading ? '...' : stat.value} />
                    </div>
                );
            }
            return (
                <Link key={index} href={stat.link} onClick={(e) => {
                    e.preventDefault();
                    if (stat.link === '#dlh-provinsi') { setActiveTab('dlh'); setActiveDlhTab('provinsi'); }
                    else if (stat.link === '#dlh-kabkota') { setActiveTab('dlh'); setActiveDlhTab('kabkota'); }
                    else if (stat.link === '#pusdatin') setActiveTab('pusdatin');
                    else if (stat.link === '#admin') setActiveTab('admin');
                }} className="h-full block transition-transform hover:scale-105">
                    <StatCard bgColor={stat.color.bg} borderColor={stat.color.border} titleColor={stat.color.titleColor} valueColor={stat.color.valueColor} title={stat.title} value={loading ? '...' : stat.value} />
                </Link>
            );
        })}
      </div>

      <InnerNav tabs={mainTabs} activeTab={activeTab} onChange={(value) => setActiveTab(value as TabValue)} activeColor={getTabColor(activeTab)} />
      {isDlhTabActive && (
        <InnerNav tabs={dlhTabs} activeTab={activeDlhTab} onChange={(value) => setActiveDlhTab(value as DlhTabValue)} className="mt-0" activeColor="blue" />
      )}

      {/* TABEL LOG */}
      {loading ? (
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
      ) : (
        <>
            <LastActivityCard 
                logs={paginatedLogs()} 
                // [FIX] Tampilkan kolom lokasi untuk semua tab DLH (Provinsi & KabKota)
                showDlhSpecificColumns={isDlhTabActive} 
                // [FIX] Sembunyikan Kab/Kota jika sedang di tab Provinsi
                showRegency={activeDlhTab !== 'provinsi'}
                theme={activeTab === 'all' ? 'slate' : activeTab === 'dlh' ? 'blue' : activeTab === 'pusdatin' ? 'green' : 'red'}
            />

            <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-600">Menampilkan {paginatedLogs().length} dari {filteredLogs.length} log</span>
                <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredLogs.length / LOGS_PER_PAGE)} onPageChange={setCurrentPage} siblings={1} />
            </div>
        </>
      )}
    </div>
  );
}