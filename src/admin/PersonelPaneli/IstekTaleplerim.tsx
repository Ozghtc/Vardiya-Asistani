import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

// 3-Layer API Key Configuration
const API_CONFIG = {
  apiKey: import.meta.env.VITE_HZM_API_KEY,
  userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
  projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD,
  baseURL: import.meta.env.VITE_HZM_BASE_URL || 'https://hzmbackendveritabani-production.up.railway.app'
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

const IstekTaleplerim: React.FC = () => {
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
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        // Kullanıcının taleplerine filtrele
        const userTalepler = data.data.rows.filter((talep: any) => 
          talep.kullanici_id === user.id
        );
        setTalepler(userTalepler);
      } else {
        console.warn('Beklenmeyen API response formatı:', data);
        setTalepler([]);
      }
    } catch (error) {
      console.error('Talepler yüklenirken hata:', error);
      setError('İstek ve talepleriniz yüklenirken bir hata oluştu');
      setTalepler([]);
    } finally {
      setLoading(false);
    }
  };

  const getDurumIcon = (durum: string) => {
    switch (durum) {
      case 'onaylandi':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reddedildi':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'onaylandi':
        return 'Onaylandı';
      case 'reddedildi':
        return 'Reddedildi';
      default:
        return 'Beklemede';
    }
  };

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'reddedildi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500">Kullanıcı bilgileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">İstek ve Taleplerim</h2>
          <p className="text-gray-600 mt-1">
            Gönderdiğiniz izin ve vardiya talepleri
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Talepler yükleniyor...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Talepler Listesi */}
      {!loading && !error && (
        <div className="space-y-4">
          {talepler.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Henüz talep bulunmuyor
              </h3>
              <p className="text-gray-600">
                İzin veya vardiya değişikliği talepleriniz burada görünecek.
              </p>
            </div>
          ) : (
            talepler.map((talep) => (
              <div key={talep.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {talep.talep_turu}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(talep.olusturma_tarihi).toLocaleDateString('tr-TR')} tarihinde gönderildi
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getDurumIcon(talep.durum)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDurumColor(talep.durum)}`}>
                        {getDurumText(talep.durum)}
                      </span>
                    </div>
                  </div>

                  {/* Tarih Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Başlangıç: {new Date(talep.baslangic_tarihi).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Bitiş: {new Date(talep.bitis_tarihi).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  {/* Açıklama */}
                  {talep.aciklama && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Açıklama:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {talep.aciklama}
                      </p>
                    </div>
                  )}

                  {/* Yanıt Bilgisi */}
                  {talep.yanit_tarihi && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(talep.yanit_tarihi).toLocaleDateString('tr-TR')} tarihinde yanıtlandı
                        </span>
                      </div>
                      {talep.yanit_notu && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Yönetici Notu:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {talep.yanit_notu}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default IstekTaleplerim;