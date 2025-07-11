import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, FileText, Settings, PieChart } from 'lucide-react';

const NobetNavigation: React.FC = () => {
  const location = useLocation();

  const tabs = [
    {
      path: '/nobet/kurallar',
      name: 'Nöbet Kuralları',
      icon: Settings,
      bgColor: 'bg-blue-600',
    },
    {
      path: '/nobet/ekran',
      name: 'Nöbet Ekranı',
      icon: Calendar,
      bgColor: 'bg-green-600',
    },
    {
      path: '/nobet/olustur',
      name: 'Nöbet Oluştur',
      icon: FileText,
      bgColor: 'bg-yellow-500',
    },
    {
      path: '/nobet/raporlar',
      name: 'Raporlar',
      icon: PieChart,
      bgColor: 'bg-purple-600',
    }
  ];

  return (
    <div className="flex items-center gap-4 mb-6">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`
              flex items-center gap-3 w-64 px-4 py-3 rounded-lg transition-all duration-300
              font-medium shadow-sm
              ${isActive ? `${tab.bgColor} text-white shadow-lg` : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}
              ${!isActive ? 'border border-gray-200' : ''}
            `}
            style={{ outline: isActive ? '2px solid #2563eb' : 'none', outlineOffset: isActive ? '2px' : '0' }}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default NobetNavigation;