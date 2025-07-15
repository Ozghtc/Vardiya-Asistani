import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, UserPlus, FileText, Clock } from 'lucide-react';

const VardiyaliNobet: React.FC = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setCheckingAuth(false);
    };
    checkUser();
  }, [navigate]);

  const mainCards = [
    {
      title: 'Nöbet İşlemleri',
      description: 'Nöbet takvimi ve planlama',
      icon: <Clock className="w-8 h-8 text-white" />,
      route: '/nobet/ekran',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      title: 'Personel Ekle',
      description: 'Yeni personel kaydı oluştur',
      icon: <UserPlus className="w-8 h-8 text-white" />,
      route: '/personel-ekle',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    {
      title: 'Personel Listesi',
      description: 'Tüm personelleri görüntüle',
      icon: <Users className="w-8 h-8 text-white" />,
      route: '/personel-listesi',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      title: 'Tanımlamalar',
      description: 'Sistem tanımlamalarını yönet',
      icon: <Settings className="w-8 h-8 text-white" />,
      route: '/tanimlamalar',
      bgColor: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700'
    }
  ];

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Yönetici Bilgi Kartı - Basit Versiyon */}
      {currentUser && (
        <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Hoşgeldin,</p>
            <p className="text-lg font-semibold text-blue-800">
              {currentUser.name || currentUser.email?.split('@')[0]?.toUpperCase() || 'YÖNETİCİ'}
            </p>
            {currentUser.kurum_adi && (
              <p className="text-sm text-gray-600 mt-2">
                📍 {currentUser.kurum_adi}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sayfa Başlığı */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vardiyalı Nöbet Sistemi</h1>
        <p className="text-gray-600 mt-2">Vardiya sistemi yönetimi ve planlaması</p>
      </div>

      {/* Ana Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainCards.map((card, index) => (
          <div 
            key={index}
            onClick={() => navigate(card.route)}
            className={`${card.bgColor} ${card.hoverColor} rounded-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-start">
              <div className="p-3 rounded-lg">
                {card.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-1 text-white opacity-90">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VardiyaliNobet;