import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, UserPlus, FileText, Clock, Building2, MapPin, UserCircle, BellRing } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface KurumBilgisi {
  id: number;
  kurum_adi: string;
  kurum_turu: string;
  adres: string;
  il: string;
  ilce: string;
  aktif_mi: boolean;
  departmanlar: string;
  birimler: string;
}

const VardiyaliNobet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [kurumBilgisi, setKurumBilgisi] = useState<KurumBilgisi | null>(null);

  // Simulated stats
  const stats = {
    totalPersonnel: 45,
    activeShifts: 12,
    pendingRequests: 8,
    monthlyHours: 1240
  };

  // Kurum bilgilerini API'den çek
  useEffect(() => {
    const fetchKurumBilgisi = async () => {
      try {
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/10',
            method: 'GET'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.rows) {
            let kurum = null;
            
            // Kullanıcı bilgileri varsa o kurumu bul
            if (user?.kurum_id) {
              kurum = result.data.rows.find((k: KurumBilgisi) => 
                k.id === parseInt(user.kurum_id!) || 
                k.id === Number(user.kurum_id!) ||
                String(k.id) === String(user.kurum_id!)
              );
            } else {
              // Demo kullanıcısı için sabit kurum
              kurum = result.data.rows.find((k: KurumBilgisi) => k.id === 6);
            }
            
            if (kurum) {
              setKurumBilgisi(kurum);
              console.log('Kurum bilgisi yüklendi:', kurum);
            }
          }
        }
      } catch (error) {
        console.error('Kurum bilgisi yüklenirken hata:', error);
      }
    };

    fetchKurumBilgisi();
  }, [user]);

  useEffect(() => {
    if (user) {
      // AuthContext'ten gelen gerçek kullanıcı bilgilerini kullan
      const enrichedUser = {
        ...user,
        kurum_adi: kurumBilgisi?.kurum_adi || 'Serik Devlet Hastanesi',
        departman_adi: user.departman_id?.replace('6_', '') || 'Acil Servis',
        birim_adi: user.birim_id?.replace('6_', '') || 'Hemşire'
      };
      setCurrentUser(enrichedUser);
    } else {
      // Demo kullanıcısı için sabit bilgiler
      const demoUser = {
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com',
        rol: 'admin',
        kurum_id: "6",
        departman_id: "6_ACİL SERVİS",
        birim_id: "6_HEMSİRE",
        kurum_adi: kurumBilgisi?.kurum_adi || 'Serik Devlet Hastanesi',
        departman_adi: 'Acil Servis',
        birim_adi: 'Hemşire'
      };
      setCurrentUser(demoUser);
    }
    setCheckingAuth(false);
  }, [user, kurumBilgisi]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Sistem hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Hoş Geldiniz, {currentUser.name || currentUser.ad || user?.name || 'Kullanıcı'}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{currentUser.kurum_adi}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-purple-600" />
                  <span>{(currentUser.rol || currentUser.role || 'Yönetici')} - {currentUser.departman_adi}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>{currentUser.birim_adi}</span>
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

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vardiyalı Nöbet Sistemi</h2>
          <p className="text-gray-600">Vardiya sistemi yönetimi ve planlaması</p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.route)}
              className={`${card.bgColor} ${card.hoverColor} rounded-xl p-6 text-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VardiyaliNobet;