import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, FileText, Search, Filter } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

// 3-Layer API Key Configuration
const API_CONFIG = {
  apiKey: import.meta.env.VITE_API_KEY,
  userEmail: import.meta.env.VITE_USER_EMAIL,
  projectPassword: import.meta.env.VITE_PROJECT_PASSWORD,
  baseURL: import.meta.env.VITE_BASE_URL || 'https://hzmbackendveritabani-production.up.railway.app'
};

interface IzinIstegi {
  id: string;
  kullanici_id: string;
  kullanici_adi: string;
  izin_turu: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  aciklama: string;
  durum: 'beklemede' | 'onaylandi' | 'reddedildi';
  olusturma_tarihi: string;
  yanit_tarihi?: string;
  yanit_notu?: string;
  yonetici_id?: string;
}

const PersonelIzinIstekleri: React.FC = () => {
  const { user } = useAuthContext();
  const [izinIstekleri, setIzinIstekleri] = useState<IzinIstegi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDurum, setFilterDurum] = useState<string>('all');
  const [selectedIstek, setSelectedIstek] = useState<IzinIstegi | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // İzin isteklerini yükle
  const loadIzinIstekleri = async () => {
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
        throw new Error('API request failed');
      }

      const data = await response.json();
      console.log('🔍 İzin İstekleri API Response:', data);
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        // Aynı kurum/departman/birim isteklerine filtrele
        const filteredIstekler = data.data.rows.filter((istek: any) => 
          istek.kurum_id === user.kurum_id &&
          istek.departman_id === user.departman_id &&
          istek.birim_id === user.birim_id
        );
        setIzinIstekleri(filteredIstekler);
        console.log(`✅ ${filteredIstekler.length} izin isteği yüklendi`);
      } else {
        console.warn('⚠️ Beklenmeyen API response formatı:', data);
        setIzinIstekleri([]);
      }
    } catch (error) {
      console.error('❌ İzin istekleri yüklenirken hata:', error);
      setError('İzin istekleri yüklenirken bir hata oluştu');
      setIzinIstekleri([]);
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda istekleri yükle
  useEffect(() => {
    loadIzinIstekleri();
  }, [user]);

  // Arama ve filtreleme
  const filteredIstekler = izinIstekleri.filter(istek => {
    const matchesSearch = istek.kullanici_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         istek.izin_turu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         istek.aciklama.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDurum = filterDurum === 'all' || istek.durum === filterDurum;
    
    return matchesSearch && matchesDurum;
  });

  // İzin isteğini yanıtla
  const handleYanitla = async (istekId: string, durum: 'onaylandi' | 'reddedildi', yanit_notu: string = '') => {
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/70/rows/${istekId}`,
          method: 'PUT',
          body: {
            durum,
            yanit_tarihi: new Date().toISOString(),
            yanit_notu,
                         yonetici_id: user?.id
          },
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (response.ok) {
        console.log('✅ İzin isteği yanıtlandı');
        loadIzinIstekleri(); // Listeyi yenile
        setShowDetailModal(false);
        setSelectedIstek(null);
      } else {
        throw new Error('İzin isteği yanıtlanamadı');
      }
    } catch (error) {
      console.error('❌ İzin isteği yanıtlama hatası:', error);
      setError('İzin isteği yanıtlanırken bir hata oluştu');
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

  const openDetailModal = (istek: IzinIstegi) => {
    setSelectedIstek(istek);
    setShowDetailModal(true);
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
          <h2 className="text-2xl font-bold text-gray-900">Personel İzin İstekleri</h2>
          <p className="text-gray-600 mt-1">
            {user.kurum_adi} - {user.departman_adi} - {user.birim_adi}
          </p>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Personel adı, izin türü veya açıklama ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterDurum}
            onChange={(e) => setFilterDurum(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="beklemede">Beklemede</option>
            <option value="onaylandi">Onaylandı</option>
            <option value="reddedildi">Reddedildi</option>
          </select>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            İzin istekleri yükleniyor...
          </div>
        </div>
      )}

      {/* İzin İstekleri Listesi */}
      {!loading && (
        <div className="space-y-4">
          {filteredIstekler.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterDurum !== 'all' 
                  ? 'Arama kriterlerinize uygun istek bulunamadı'
                  : 'Henüz izin isteği bulunmuyor'
                }
              </h3>
              <p className="text-gray-600">
                Personel izin istekleri burada görünecek.
              </p>
            </div>
          ) : (
            filteredIstekler.map((istek) => (
              <div key={istek.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {istek.kullanici_adi}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {istek.izin_turu} - {new Date(istek.olusturma_tarihi).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getDurumIcon(istek.durum)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDurumColor(istek.durum)}`}>
                        {getDurumText(istek.durum)}
                      </span>
                    </div>
                  </div>

                  {/* Tarih Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Başlangıç: {new Date(istek.baslangic_tarihi).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Bitiş: {new Date(istek.bitis_tarihi).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  {/* Açıklama */}
                  {istek.aciklama && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {istek.aciklama}
                      </p>
                    </div>
                  )}

                  {/* Yanıt Bilgisi */}
                  {istek.yanit_tarihi && (
                    <div className="border-t pt-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(istek.yanit_tarihi).toLocaleDateString('tr-TR')} tarihinde yanıtlandı
                        </span>
                      </div>
                      {istek.yanit_notu && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Yönetici Notu:</strong> {istek.yanit_notu}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Aksiyonlar */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailModal(istek)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Detay Görüntüle
                    </button>
                    
                    {istek.durum === 'beklemede' && (
                      <>
                        <button
                          onClick={() => handleYanitla(istek.id, 'onaylandi')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleYanitla(istek.id, 'reddedildi')}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Reddet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detay Modal */}
      {showDetailModal && selectedIstek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">İzin İsteği Detayı</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Personel</label>
                <p className="text-sm text-gray-900">{selectedIstek.kullanici_adi}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">İzin Türü</label>
                <p className="text-sm text-gray-900">{selectedIstek.izin_turu}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedIstek.baslangic_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedIstek.bitis_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {selectedIstek.aciklama && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedIstek.aciklama}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Durum</label>
                <div className="flex items-center gap-2 mt-1">
                  {getDurumIcon(selectedIstek.durum)}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDurumColor(selectedIstek.durum)}`}>
                    {getDurumText(selectedIstek.durum)}
                  </span>
                </div>
              </div>

              {selectedIstek.durum === 'beklemede' && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">İsteği Yanıtla</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleYanitla(selectedIstek.id, 'onaylandi')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => handleYanitla(selectedIstek.id, 'reddedildi')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* İstatistikler */}
      {!loading && izinIstekleri.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{izinIstekleri.length}</div>
            <div className="text-sm text-gray-600">Toplam İstek</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              0 {/* KURAL 18: filter().length backend Reporting API'de yapılacak */}
            </div>
            <div className="text-sm text-gray-600">Beklemede</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              0 {/* KURAL 18: filter().length backend Reporting API'de yapılacak */}
            </div>
            <div className="text-sm text-gray-600">Onaylandı</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              0 {/* KURAL 18: filter().length backend Reporting API'de yapılacak */}
            </div>
            <div className="text-sm text-gray-600">Reddedildi</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonelIzinIstekleri; 