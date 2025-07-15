// Dosyayı SistemTanimlamalari.tsx olarak yeniden adlandır
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, MapPin, UserPlus, Settings, UserCog } from 'lucide-react';
import UnvanTanimlama from './UnvanTanimlama';
import IzinTanimlama from './IzinTanimlama';
import VardiyaTanimlama from './VardiyaTanimlama';
import AlanTanimlama from './AlanTanimlama';
import TanimliAlanlar from './TanimliAlanlar';
import TanimliVardiyalar from './TanimliVardiyalar';
import { useDepartmanBirim } from './DepartmanBirimContext';
// Otomatik tablo oluşturma kaldırıldı - Kural 15 gereği

const SistemTanimlamalari: React.FC = () => {
  const [activeTab, setActiveTab] = useState('unvan-izin');
  const navigate = useNavigate();
  const { setDepartmanBirim } = useDepartmanBirim();

  // Otomatik tablo oluşturma kaldırıldı - Kural 15 gereği

  useEffect(() => {
    const fetchAndSetContext = async () => {
      // Önce currentUser'ı localStorage'dan al
      const userStr = localStorage.getItem('currentUser');
      let kurum_id = '', departman_id = '', birim_id = '';
      if (userStr) {
        const user = JSON.parse(userStr);
        kurum_id = user.kurum_id || '';
        departman_id = user.departman_id || '';
        birim_id = user.birim_id || '';
      }
      // Eğer currentUser'da id'ler varsa onları kullan
      if (kurum_id && departman_id && birim_id) {
        setDepartmanBirim({ kurum_id, departman_id, birim_id });
      }
    };
    fetchAndSetContext();
  }, [setDepartmanBirim]);

  // Otomatik useEffect'ler kaldırıldı - Kural 15 gereği

  const tabs = [
    {
      id: 'unvan-izin',
      name: 'Ünvan/İzin Tanımlamaları',
      icon: <Users className="w-5 h-5" />, // veya başka uygun bir ikon
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <UnvanTanimlama />
          <IzinTanimlama />
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
      id: 'alan',
      name: 'Alan',
      icon: <MapPin className="w-5 h-5" />, 
      component: <AlanTanimlama />
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
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>
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

export default SistemTanimlamalari;