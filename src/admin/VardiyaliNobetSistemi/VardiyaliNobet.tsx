import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, UserPlus, FileText, Clock, Building2, MapPin, UserCircle, BellRing } from 'lucide-react';

const VardiyaliNobet: React.FC = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Simulated stats
  const stats = {
    totalPersonnel: 45,
    activeShifts: 12,
    pendingRequests: 8,
    monthlyHours: 1240
  };

  useEffect(() => {
    const checkUser = async () => {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        navigate('/');
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
      {/* Welcome Section */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Hoş Geldiniz, {currentUser.name || currentUser.ad || 'Kullanıcı'}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{currentUser.kurum_adi || 'Kurum Belirtilmemiş'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-purple-600" />
                  <span>{(currentUser.rol || currentUser.role || 'Rol Belirtilmemiş')} - {currentUser.departman_adi || 'Departman'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>{currentUser.birim_adi || 'Birim Belirtilmemiş'}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Personel</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPersonnel}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Vardiyalar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShifts}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen Talepler</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
            <BellRing className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aylık Saat</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyHours}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

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