import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

// 3-Layer API Key Configuration
const API_CONFIG = {
  apiKey: import.meta.env.VITE_API_KEY,
  userEmail: import.meta.env.VITE_USER_EMAIL,
  projectPassword: import.meta.env.VITE_PROJECT_PASSWORD,
  baseURL: import.meta.env.VITE_BASE_URL || 'https://hzmbackendveritabani-production.up.railway.app'
};

interface IstekTalep {
  id: string;
  talep_turu: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  aciklama: string;
  durum: 'beklemede' | 'onaylandi' | 'reddedildi';
  olusturma_tarihi: string;
  yanit_tarihi?: string;
  yanit_notu?: string;
}

const IstekTaleplerimPanel: React.FC = () => {
  const { user } = useAuthContext();
  const [talepler, setTalepler] = useState<IstekTalep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTalepler();
  }, [user]);

  const loadTalepler = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/70',
          method: 'GET',
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword,
          baseURL: API_CONFIG.baseURL
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (result.success && result.data?.rows) {
        // Kullanıcının taleplerine filtrele (personel_id bazında)
        const userTalepler = result.data.rows.filter((talep: any) => 
          talep.personel_id === user.id ||
          talep.kullanici_id === user.id ||
          talep.personel_tc === user.email
        );

        const formattedTalepler: IstekTalep[] = userTalepler.map((row: any) => ({
          id: row.id || '',
          talep_turu: row.talep_turu || 'İzin',
          baslangic_tarihi: row.baslangic_tarihi || '',
          bitis_tarihi: row.bitis_tarihi || '',
          aciklama: row.aciklama || '',
          durum: row.durum || 'beklemede',
          olusturma_tarihi: row.olusturma_tarihi || '',
          yanit_tarihi: row.yanit_tarihi,
          yanit_notu: row.yanit_notu
        }));

        setTalepler(formattedTalepler);
      } else {
        console.log('No data found or API error:', result);
        setTalepler([]);
      }
    } catch (err) {
      console.error('Error loading talepler:', err);
      setError('İstek talepleriniz yüklenirken bir hata oluştu.');
      setTalepler([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (durum: string) => {
    switch (durum) {
      case 'onaylandi':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reddedildi':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (durum: string) => {
    switch (durum) {
      case 'onaylandi':
        return 'Onaylandı';
      case 'reddedildi':
        return 'Reddedildi';
      default:
        return 'Bekliyor';
    }
  };

  const getStatusBgColor = (durum: string) => {
    switch (durum) {
      case 'onaylandi':
        return 'bg-green-50 border-green-200';
      case 'reddedildi':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">İstek Taleplerim</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">İstek Taleplerim</h2>
        </div>
        <div className="text-center text-red-500 py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p>{error}</p>
          <button 
            onClick={loadTalepler}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold">İstek Taleplerim</h2>
        <span className="ml-auto text-sm text-gray-500">
          Toplam: {talepler.length} talep
        </span>
      </div>

      {talepler.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz hiç istek talebiniz yok</p>
          <p className="text-sm mt-1">İzin veya diğer talepleriniz burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-4">
          {talepler.map((talep) => (
            <div 
              key={talep.id} 
              className={`border rounded-lg p-4 ${getStatusBgColor(talep.durum)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(talep.durum)}
                  <span className="font-medium text-gray-900">
                    {talep.talep_turu}
                  </span>
                  <span className="text-sm text-gray-500">
                    - {getStatusText(talep.durum)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(talep.olusturma_tarihi)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Başlangıç: {formatDate(talep.baslangic_tarihi)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Bitiş: {formatDate(talep.bitis_tarihi)}</span>
                </div>
              </div>

              {talep.aciklama && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                    {talep.aciklama}
                  </p>
                </div>
              )}

              {talep.yanit_notu && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Yönetici Yanıtı:
                  </h4>
                  <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                    {talep.yanit_notu}
                  </p>
                  {talep.yanit_tarihi && (
                    <p className="text-xs text-gray-500 mt-1">
                      Yanıt Tarihi: {formatDate(talep.yanit_tarihi)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IstekTaleplerimPanel; 