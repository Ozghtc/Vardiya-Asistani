import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, FileText, Settings, PieChart, ArrowLeft } from 'lucide-react';

const VardiyaPlanla: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      title: 'Nöbet Ekranı',
      route: '/nobet/ekran',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      title: 'Nöbet Kuralları',
      route: '/nobet/kurallar',
      icon: <Settings className="w-5 h-5" />
    },
    {
      title: 'Nöbet Oluştur',
      route: '/nobet/olustur',
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: 'Raporlar',
      route: '/nobet/raporlar',
      icon: <PieChart className="w-5 h-5" />
    }
  ];

  return (
    <div>
      <div className="bg-white border-b">
        <div className="container mx-auto">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/vardiyali-nobet')}
              className="p-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.route)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 hover:bg-gray-50 transition-colors ${
                  location.pathname === item.route
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:border-gray-300'
                }`}
              >
                {item.icon}
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Content will be rendered through nested routes */}
      </div>
    </div>
  );
};

export default VardiyaPlanla;