'use client';

import { FaUserShield, FaUserTie, FaUserCog } from "react-icons/fa";

export interface Log {
  id: number;
  user: string;
  role: 'dlh' | 'pusdatin' | 'admin';
  action: string;
  target?: string;
  time: string;
  status?: 'success' | 'warning' | 'danger' | 'info' | string;
  jenis_dlh?: 'provinsi' | 'kabkota'; 
  province_name?: string;
  regency_name?: string;
}

interface LastActivityCardProps {
  logs: Log[];
  showDlhSpecificColumns?: boolean;
  showRegency?: boolean; // [BARU] Prop untuk kontrol kolom Kab/Kota
  theme?: 'slate' | 'blue' | 'green' | 'red';
}

export default function LastActivityCard({ 
  logs, 
  showDlhSpecificColumns = false, 
  showRegency = true, // Default true
  theme = 'slate' 
}: LastActivityCardProps) {
  
  const getThemeColors = () => {
    switch (theme) {
      case 'blue': return { header: 'bg-blue-200', row: 'bg-blue-50', text: 'text-blue-800' };
      case 'green': return { header: 'bg-green-200', row: 'bg-green-50', text: 'text-green-800' };
      case 'red': return { header: 'bg-red-200', row: 'bg-red-50', text: 'text-red-800' };
      default: return { header: 'bg-slate-200', row: 'bg-slate-50', text: 'text-slate-800' };
    }
  };

  const themeColors = getThemeColors();
  const cellBase = "py-4 px-4 text-sm align-middle border-b border-gray-100";
  const headerBase = "py-3 px-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200";

  return (
    <div>
      <div className="px-6 py-3">
        <h3 className="text-xl font-bold text-gray-800 pl-0 -ml-4">Aktivitas Terakhir</h3>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={themeColors.header}>
              <tr>
                <th className={`${headerBase} w-48 whitespace-nowrap`}>Waktu</th>
                <th className={`${headerBase} w-48 whitespace-nowrap`}>User</th>
                <th className={`${headerBase} w-32 text-center`}>Role</th>
                
                {/* KOLOM KHUSUS DLH */}
                {showDlhSpecificColumns && (
                  <>
                    <th className={`${headerBase} w-40`}>Provinsi</th>
                    {/* Hanya tampilkan Kab/Kota jika showRegency true */}
                    {showRegency && <th className={`${headerBase} w-40`}>Kab/Kota</th>}
                  </>
                )}
                
                <th className={`${headerBase} w-auto`}>Aksi / Keterangan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    
                    <td className={`${cellBase} text-gray-500 whitespace-nowrap font-medium text-xs`}>
                      {log.time}
                    </td>

                    <td className={`${cellBase} text-gray-800 font-semibold whitespace-nowrap`}>
                      <div className="truncate max-w-[12rem]" title={log.user}>
                        {log.user}
                      </div>
                    </td>

                    <td className={`${cellBase} text-center`}>
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
                        {getRoleIcon(log.role)}
                        <span className={`font-bold text-[10px] uppercase ${getRoleColor(log.role)}`}>
                          {log.role}
                        </span>
                      </div>
                    </td>

                    {/* Kolom Spesifik DLH */}
                    {showDlhSpecificColumns && (
                      <>
                        <td className={`${cellBase} text-gray-600`}>
                          {log.province_name || '-'}
                        </td>
                        {showRegency && (
                          <td className={`${cellBase} text-gray-600`}>
                            {log.regency_name || '-'}
                          </td>
                        )}
                      </>
                    )}

                    <td className={`${cellBase} text-gray-700`}>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {log.action}
                        </span>
                        {log.target && log.target !== '-' && (
                          <span className="text-xs text-gray-500 mt-1 italic flex items-center gap-1">
                            Target: <span className="bg-gray-100 px-1 rounded text-gray-700 not-italic">{log.target}</span>
                          </span>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  {/* Adjust colspan agar loading text tetap di tengah */}
                  <td colSpan={showDlhSpecificColumns ? (showRegency ? 6 : 5) : 4} className="py-12 text-center text-gray-400 italic bg-gray-50">
                    Belum ada aktivitas tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getRoleColor(role: string) {
  switch(role) {
    case 'dlh': return 'text-blue-600';
    case 'pusdatin': return 'text-green-600';
    case 'admin': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'dlh': return <FaUserTie className="text-blue-600 text-sm" />;
    case 'pusdatin': return <FaUserCog className="text-green-600 text-sm" />;
    case 'admin': return <FaUserShield className="text-red-600 text-sm" />;
    default: return null;
  }
}