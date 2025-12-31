'use client';

import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

export interface UserTableRow {
  id: number;
  name: string;
  email: string;
  role: string;
  jenis_dlh?: string;
  status: 'aktif' | 'pending' | string;
  province?: string | null;
  regency?: string | null;
}

interface UserTableProps {
  users: UserTableRow[];
  // [FIX] Tambahkan 'yellow' ke dalam definisi tipe theme
  theme?: 'slate' | 'blue' | 'green' | 'red' | 'yellow'; 
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
  showLocation?: boolean;
  showRegency?: boolean;
  showDlhSpecificColumns?: boolean;
  isSubmitting?: boolean;
}

export default function UserTable({
  users,
  theme = 'slate',
  onApprove,
  onReject,
  onDelete,
  showLocation = false,
  showRegency = true,
  showDlhSpecificColumns = false,
  isSubmitting = false,
}: UserTableProps) {

  const getHeaderClass = () => {
    const base = "py-3 px-4 text-left text-xs font-bold uppercase tracking-wider border-b";
    switch (theme) {
      case 'blue': return `${base} bg-blue-100 text-blue-800 border-blue-200`;
      case 'green': return `${base} bg-green-100 text-green-800 border-green-200`;
      case 'red': return `${base} bg-red-100 text-red-800 border-red-200`;
      // [FIX] Handle warna yellow
      case 'yellow': return `${base} bg-yellow-100 text-yellow-800 border-yellow-200`;
      default: return `${base} bg-slate-100 text-slate-700 border-gray-200`;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'bg-red-100 text-red-800 border-red-200';
    if (r.includes('pusdatin')) return 'bg-green-100 text-green-800 border-green-200';
    if (r.includes('dlh') || r.includes('provinsi') || r.includes('kabupaten')) {
       // Opsional: Jika tema tabel kuning, badge DLH bisa ikut kuning
       return theme === 'yellow' 
         ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
         : 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDisplayRole = (user: UserTableRow): string => {
    if (user.role === 'DLH' && user.jenis_dlh) return user.jenis_dlh;
    return user.role;
  };

  const hasActions = (onApprove && onReject) || onDelete;
  const headerClass = getHeaderClass();
  const shouldShowRegency = showLocation && showRegency;

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Tidak ada data pengguna.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className={headerClass}>Nama / Instansi</th>
              <th className={headerClass}>Email</th>
              <th className={headerClass}>Role</th>
              {showDlhSpecificColumns && <th className={headerClass}>Jenis DLH</th>}
              
              {showLocation && (
                <>
                  <th className={headerClass}>Provinsi</th>
                  {shouldShowRegency && <th className={headerClass}>Kab/Kota</th>}
                </>
              )}
              
              <th className={headerClass}>Status</th>
              {hasActions && <th className={`${headerClass} text-center`}>Aksi</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                <td className="py-4 px-4 text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                    {getDisplayRole(user)}
                  </span>
                </td>

                {showDlhSpecificColumns && (
                  <td className="py-4 px-4 text-sm text-gray-600">{user.jenis_dlh || '-'}</td>
                )}

                {showLocation && (
                  <>
                    <td className="py-4 px-4 text-sm text-gray-600">{user.province || '-'}</td>
                    {shouldShowRegency && (
                      <td className="py-4 px-4 text-sm text-gray-600">{user.regency || '-'}</td>
                    )}
                  </>
                )}

                <td className="py-4 px-4 text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'aktif' || user.status === 'approved' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {user.status === 'aktif' || user.status === 'approved' ? 'Aktif' : 'Pending'}
                  </span>
                </td>

                {hasActions && (
                  <td className="py-4 px-4 text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {onApprove && (
                        <button onClick={() => onApprove(user.id)} disabled={isSubmitting} className="text-green-600 hover:bg-green-50 p-2 rounded transition" title="Approve">
                          <FaCheck />
                        </button>
                      )}
                      {onReject && (
                        <button onClick={() => onReject(user.id)} disabled={isSubmitting} className="text-red-600 hover:bg-red-50 p-2 rounded transition" title="Reject">
                          <FaTimes />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(user.id)} disabled={isSubmitting} className="text-red-600 hover:bg-red-50 p-2 rounded transition" title="Delete">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}