import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, Plus, ArrowRight } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

interface Personnel {
  id: number;
  tcno: string;
  ad: string;
  soyad: string;
  unvan: string;
  aktif_mi: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

interface KayitliNobetTanimlamasi {
  id: number;
  personel_id: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
}

const PersonelIslemleri: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [kayitliNobetTanimlama, setKayitliNobetTanimlama] = useState<KayitliNobetTanimlamasi[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const loadPersonnel = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/21',
          method: 'GET'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rows) {
          const filteredPersonnel = result.data.rows.filter((person: Personnel) => 
            person.kurum_id === user.kurum_id &&
            person.departman_id === user.departman_id &&
            person.birim_id === user.birim_id
          );
          
          setPersonnel(filteredPersonnel);
        }
      }
    } catch (error) {
      console.error('Personel yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKayitliNobetTanimlama = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/22',
          method: 'GET'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rows) {
          const filteredNobetler = result.data.rows.filter((nobet: KayitliNobetTanimlamasi) => 
            nobet.kurum_id === user.kurum_id &&
            nobet.departman_id === user.departman_id &&
            nobet.birim_id === user.birim_id &&
            nobet.aktif_mi
          );
          
          setKayitliNobetTanimlama(filteredNobetler);
        }
      }
    } catch (error) {
      console.error('Nöbet tanımlamaları yükleme hatası:', error);
    }
  };

  useEffect(() => {
    loadPersonnel();
    loadKayitliNobetTanimlama();
  }, [user]);

  const getPersonelIstatistikleri = () => {
    const toplamPersonel = personnel.length;
    const nobetTanimliPersonel = personnel.filter(person => 
      kayitliNobetTanimlama.some(nobet => parseInt(nobet.personel_id) === person.id)
    ).length;
    const nobetTanimsizPersonel = toplamPersonel - nobetTanimliPersonel;
    const toplamNobetTanimlama = kayitliNobetTanimlama.length;
    
    return {
      toplamPersonel,
      nobetTanimliPersonel,
      nobetTanimsizPersonel,
      toplamNobetTanimlama
    };
  };

  const istatistikler = getPersonelIstatistikleri();

  const sections = [
    {
      id: 'liste',
      title: 'Personel Listesi',
      description: 'Personel listesi ve yönetimi',
      icon: <Users className="w-8 h-8" />,
      color: 'blue',
      stats: `${istatistikler.toplamPersonel} personel`,
      path: '/personel-listesi'
    },
    {
      id: 'nobet',
      title: 'Alan Tanımlama',
      description: 'Personel alan tanımlamaları',
      icon: <Calendar className="w-8 h-8" />,
      color: 'green',
      stats: `${istatistikler.nobetTanimliPersonel} tanımlı`,
      path: '/personel-nobet-tanimlama'
    },
    {
      id: 'istek',
      title: 'İzin İstekleri',
      description: 'Özel istekler ve izin talepleri',
      icon: <FileText className="w-8 h-8" />,
      color: 'purple',
      stats: 'İstek yönetimi',
      path: '/personel-izin-istekleri'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Personel İşlemleri</h1>
          <p className="text-gray-600 mt-2">Personel yönetimi ve nöbet sistemi</p>
        </div>
        <button
          onClick={() => navigate('/personel-ekle')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Personel</span>
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Toplam Personel</p>
              <p className="text-3xl font-bold text-blue-900">{istatistikler.toplamPersonel}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Nöbet Tanımlı</p>
              <p className="text-3xl font-bold text-green-900">{istatistikler.nobetTanimliPersonel}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Nöbet Tanımsız</p>
              <p className="text-3xl font-bold text-red-900">{istatistikler.nobetTanimsizPersonel}</p>
            </div>
            <Users className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Toplam Tanımlama</p>
              <p className="text-3xl font-bold text-purple-900">{istatistikler.toplamNobetTanimlama}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Bölüm Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            onClick={() => navigate(section.path)}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`text-${section.color}-600`}>
                {section.icon}
              </div>
              <ArrowRight className={`w-5 h-5 text-${section.color}-600`} />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {section.title}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {section.description}
            </p>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${section.color}-100 text-${section.color}-800`}>
              {section.stats}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonelIslemleri; 