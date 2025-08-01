import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, UserPlus, Settings, UserCog } from 'lucide-react';
import UnvanTanimlama from './UnvanTanimlama';
import IzinTanimlama from './IzinTanimlama';
import VardiyaTanimlama from './VardiyaTanimlama/VardiyaTanimlama';

import TanimliAlanlar from './TanimliAlanlar';

import AlanTanimla from './AlanTanimla/AlanTanimla';
import { useDepartmanBirim } from './DepartmanBirimContext';
import { useAuthContext } from '../../../contexts/AuthContext';

const TanimlamalarPaneli: React.FC = () => {
  const [activeTab, setActiveTab] = useState('unvan-izin');
  const navigate = useNavigate();
  const { setDepartmanBirim } = useDepartmanBirim();
  const { user } = useAuthContext();

  // Kullanıcı rolüne göre ana sayfa route'unu belirle
  const getHomeRoute = () => {
    if (!user) return '/';
    switch (user.rol) {
      case 'admin':
        return '/admin';
      case 'yonetici':
        return '/vardiyali-nobet';
      case 'personel':
        return '/personel/panel';
      default:
        return '/';
    }
  };

  // Otomatik tablo oluşturma kaldırıldı - Kural 15 gereği

  useEffect(() => {
    const fetchAndSetContext = async () => {
      // AuthContext'ten gerçek kullanıcı bilgilerini al
      if (user && user.kurum_id && user.departman_id && user.birim_id) {
        setDepartmanBirim({ 
          kurum_id: user.kurum_id, 
          departman_id: user.departman_id, 
          birim_id: user.birim_id 
        });
      }
    };
    fetchAndSetContext();
  }, [setDepartmanBirim, user]);

  // Otomatik useEffect'ler kaldırıldı - Kural 15 gereği

  const tabs = [
    {
      id: 'unvan-izin',
      name: 'Ünvan/İzin Tanımlamaları',
      icon: <Users className="w-5 h-5" />, // veya başka uygun bir ikon
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <UnvanTanimlama />
          </div>
          <div className="lg:col-span-2">
            <IzinTanimlama />
          </div>
        </div>
      )
    },
    {
      id: 'vardiya',
      name: 'Vardiya',
      icon: <Clock className="w-5 h-5" />, 
      component: <VardiyaTanimlama />
    },

    {
      id: 'alan-tanimla',
      name: 'Alan Tanımla',
      icon: <UserCog className="w-5 h-5" />, 
      component: <AlanTanimla />
    },
    {
      id: 'tanimli-alanlar',
      name: 'Tanımlı Alanlar',
      icon: <Settings className="w-5 h-5" />, 
      component: <TanimliAlanlar />
    }
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sistem Tanımlamaları</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/personel-ekle')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Personel Ekle
          </button>
          <button
            onClick={() => navigate(getHomeRoute())}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </button>
        </div>
      </div>

      {/* Otomatik mesajlar kaldırıldı - Kural 15 gereği */}

      {/* Sekmeli yapı */}
      <div className="bg-white border-b mb-6">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default TanimlamalarPaneli;