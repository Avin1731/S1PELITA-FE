'use client';

import { FaUserTie, FaUserCog, FaUserShield, FaUserClock } from 'react-icons/fa';

interface InnerNavProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
  // [FIX] Tambahkan 'yellow' ke dalam definisi tipe
  activeColor?: 'slate' | 'blue' | 'green' | 'red' | 'yellow';
}

export default function InnerNav({ 
  tabs, 
  activeTab, 
  onChange, 
  className = '',
  activeColor
}: InnerNavProps) {
  
  const getTabConfig = (tabValue: string) => {
    const isActive = activeTab === tabValue;
    
    // Logic jika activeColor dipaksa dari parent
    if (isActive && activeColor) {
      switch(activeColor) {
        case 'slate': return { activeBorder: 'border-slate-500', activeText: 'text-slate-600', hoverBorder: 'hover:border-slate-300', hoverText: 'hover:text-slate-700', icon: null };
        case 'blue': return { activeBorder: 'border-blue-500', activeText: 'text-blue-600', hoverBorder: 'hover:border-blue-300', hoverText: 'hover:text-blue-700', icon: <FaUserTie className="text-blue-600 text-base" /> };
        case 'green': return { activeBorder: 'border-green-500', activeText: 'text-green-600', hoverBorder: 'hover:border-green-300', hoverText: 'hover:text-green-700', icon: <FaUserCog className="text-green-600 text-base" /> };
        case 'red': return { activeBorder: 'border-red-500', activeText: 'text-red-600', hoverBorder: 'hover:border-red-300', hoverText: 'hover:text-red-700', icon: <FaUserShield className="text-red-600 text-base" /> };
        // [FIX] Tambahkan case yellow
        case 'yellow': return { activeBorder: 'border-yellow-500', activeText: 'text-yellow-600', hoverBorder: 'hover:border-yellow-300', hoverText: 'hover:text-yellow-700', icon: <FaUserClock className="text-yellow-600 text-base" /> };
      }
    }

    // Default fallback logic
    switch(tabValue.toLowerCase()) {
      case 'dlh':
      case 'provinsi':
      case 'kabkota': return { activeBorder: 'border-blue-500', activeText: 'text-blue-600', hoverBorder: 'hover:border-blue-300', hoverText: 'hover:text-blue-700', icon: <FaUserTie className="text-blue-600 text-base" /> };
      case 'pusdatin': return { activeBorder: 'border-green-500', activeText: 'text-green-600', hoverBorder: 'hover:border-green-300', hoverText: 'hover:text-green-700', icon: <FaUserCog className="text-green-600 text-base" /> };
      case 'admin': return { activeBorder: 'border-red-500', activeText: 'text-red-600', hoverBorder: 'hover:border-red-300', hoverText: 'hover:text-red-700', icon: <FaUserShield className="text-red-600 text-base" /> };
      default: return { activeBorder: 'border-blue-500', activeText: 'text-blue-600', hoverBorder: 'hover:border-gray-300', hoverText: 'hover:text-gray-700', icon: null };
    }
  };

  return (
    <div className={`border-b border-gray-200 mb-6 ${className}`}>
      <nav className="flex space-x-8 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => {
          const config = getTabConfig(tab.value);
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`whitespace-nowrap py-2 px-4 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === tab.value
                  ? `${config.activeBorder} ${config.activeText}`
                  : `border-transparent text-gray-500 ${config.hoverText} ${config.hoverBorder}`
              }`}
            >
              {config.icon}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}