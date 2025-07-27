import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { apiRequest, getTableData, addTableData, deleteTableData, clearTableCache, updateTableData, clearAllCache } from '../../../lib/api';
import { Trash2, Plus, Clock, CheckCircle, X } from 'lucide-react';

interface Unvan {
  id: number;
  unvan_adi: string;
  kurum_id: string;
}

interface MesaiTanimi {
  id: string;
  mesaiAdi: string;
  mesaiSaati: number;
}

interface KaydedilenMesai {
  id: number;
  mesai_adi: string;
  gunler: string;
  mesai_saati: number;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

const UnvanTanimlama: React.FC = () => {
  const { user } = useAuthContext();
  const [unvanlar, setUnvanlar] = useState<Unvan[]>([]);
  const [yeniUnvan, setYeniUnvan] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mesai form state'leri
  const [mesaiAdi, setMesaiAdi] = useState('');
  const [mesaiSaati, setMesaiSaati] = useState<number>(8);
  
  // Tüm kaydedilen mesai türleri için state
  const [kaydedilenMesaiTurleri, setKaydedilenMesaiTurleri] = useState<KaydedilenMesai[]>([]);
  const [mesaiLoading, setMesaiLoading] = useState(false);

  // Mesai türlerini fresh olarak yükle
  const loadMesaiTurleri = async () => {
    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) return;

    setMesaiLoading(true);
    try {
      // Cache'i zorla temizle
      clearTableCache('73');
      
      // Fresh data çek - YENİ TABLO ID: 73
      const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
      const data = await getTableData('73', filterParams, true); // Force fresh
      
      console.log('📋 Fresh mesai türleri:', data);
      // Veriyi array olarak garanti et
      const mesaiArray = Array.isArray(data) ? data : [];
      setKaydedilenMesaiTurleri(mesaiArray);
    } catch (error) {
      console.error('Mesai türleri yüklenirken hata:', error);
      // Tablo yoksa boş array set et, hata verme
      setKaydedilenMesaiTurleri([]);
    } finally {
      setMesaiLoading(false);
    }
  };

  useEffect(() => {
    // Load unvanlar from HZM API
    const loadUnvanlar = async () => {
      if (user?.kurum_id && user?.departman_id && user?.birim_id) {
        setLoading(true);
        setError(null);
        
        try {
          console.log('🔍 Ünvanlar yükleniyor...', {
            kurum_id: user.kurum_id,
            departman_id: user.departman_id,
            birim_id: user.birim_id
          });
          
          // YENİ TABLO ID: 69
          const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
          const data = await getTableData('69', filterParams);
          
          console.log('📦 Ünvanlar yüklendi:', data);
          // Veriyi array olarak garanti et
          const unvanArray = Array.isArray(data) ? data : [];
          setUnvanlar(unvanArray);
        } catch (error) {
          console.error('🚨 Ünvanlar yüklenemedi:', error);
          // Tablo yoksa boş array set et ve bilgilendirici mesaj göster
          setUnvanlar([]);
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('404') || errorMessage.includes('401')) {
            setError('Ünvan tablosu bulunamadı. Lütfen önce tabloyu oluşturun.');
          } else {
            setError('Ünvanlar yüklenemedi. Lütfen tekrar deneyin.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadUnvanlar();
    loadMesaiTurleri();
  }, [user?.kurum_id, user?.departman_id, user?.birim_id]);

  const handleUnvanEkle = async () => {
    if (!yeniUnvan.trim()) {
      setError('Ünvan adı gereklidir');
      return;
    }

    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      // Yeni ünvan ID'si oluştur
      const existingUnvanlar = await getTableData('69', `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`);
      const unvanArray = Array.isArray(existingUnvanlar) ? existingUnvanlar : [];
      
      // ÇİFT KAYIT KONTROLÜ - Büyük/küçük harf duyarsız
      const normalizedNewUnvan = yeniUnvan.trim().toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
      const isDuplicate = unvanArray.some((unvan: any) => {
        const normalizedExisting = (unvan.unvan_adi || '').toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
        return normalizedExisting === normalizedNewUnvan;
      });
      
      if (isDuplicate) {
        setError(`"${yeniUnvan}" ünvanı zaten mevcut. Aynı ünvan tekrar eklenemez.`);
        return;
      }
      
      const nextSira = unvanArray.length + 1;
      
      // DOĞRU FORMAT: kurum_D#_B#_sira (HIYERARSIK_ID_SISTEMI.md uyumlu)
      const departmanKodu = user.departman_id.split('_')[1] || 'D1'; // "6_D1" -> "D1"
      const birimKodu = user.birim_id.split('_')[1] || 'B1'; // "6_B1" -> "B1"
      const unvanId = `${user.kurum_id}_${departmanKodu}_${birimKodu}_${nextSira}`;

      const newUnvan = {
        unvan_id: unvanId,
        unvan_adi: yeniUnvan.trim(),
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id,
        aktif_mi: true
      };

      // YENİ TABLO ID: 69
      const result = await addTableData('69', newUnvan);

      if (result.success) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('69');
        
        // Fresh veriyi yeniden yükle
        const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
        const data = await getTableData('69', filterParams, true);
        setUnvanlar(data);
        
        setYeniUnvan('');
        setError(null);
        
        console.log('✅ Ünvan eklendi ve liste güncellendi:', data);
      } else {
        setError('Ünvan eklenemedi: ' + result.error);
      }
    } catch (error) {
      console.error('Ünvan ekleme hatası:', error);
      setError('Ünvan eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleUnvanSil = async (unvanId: number) => {
    try {
      const result = await deleteTableData('69', unvanId.toString());

      if (result.success && user) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('69');
        
        // Fresh veriyi yeniden yükle
        const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
        const data = await getTableData('69', filterParams, true);
        const unvanArray = Array.isArray(data) ? data : [];
        setUnvanlar(unvanArray);
        
        console.log('✅ Ünvan silindi ve liste güncellendi:', data);
      } else {
        setError('Ünvan silinemedi: ' + result.error);
      }
    } catch (error) {
      console.error('Ünvan silme hatası:', error);
      setError('Ünvan silinemedi. Lütfen tekrar deneyin.');
    }
  };



  const handleMesaiEkle = async () => {
    if (!mesaiAdi.trim()) {
      showErrorToast('Mesai adı gereklidir!');
      return;
    }

    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
      showErrorToast('Kullanıcı bilgileri eksik!');
      return;
    }

    // Yeni mesai ID'si oluştur
    const existingMesaiTurleri = await getTableData('73', `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`);
    const mesaiArray = Array.isArray(existingMesaiTurleri) ? existingMesaiTurleri : [];
    
    // ÇİFT KAYIT KONTROLÜ - Mesai adı ve saati kontrolü
    const normalizedNewMesai = mesaiAdi.trim().toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
    const isDuplicateName = mesaiArray.some((mesai: any) => {
      const normalizedExisting = (mesai.mesai_adi || '').toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
      return normalizedExisting === normalizedNewMesai;
    });
    
    const isDuplicateHour = mesaiArray.some((mesai: any) => {
      return parseInt(mesai.mesai_saati) === parseInt(mesaiSaati.toString());
    });
    
    if (isDuplicateName) {
      showErrorToast(`"${mesaiAdi}" mesai türü zaten mevcut. Aynı mesai türü tekrar eklenemez.`);
      return;
    }
    
    if (isDuplicateHour) {
      showErrorToast(`${mesaiSaati} saatlik mesai türü zaten mevcut. Aynı mesai saati tekrar eklenemez.`);
      return;
    }
    
    const nextSira = mesaiArray.length + 1;
    
    // DOĞRU FORMAT: kurum_D#_B#_sira (HIYERARSIK_ID_SISTEMI.md uyumlu)
    const departmanKodu = user.departman_id.split('_')[1] || 'D1'; // "6_D1" -> "D1"
    const birimKodu = user.birim_id.split('_')[1] || 'B1'; // "6_B1" -> "B1"
    const mesaiId = `${user.kurum_id}_${departmanKodu}_${birimKodu}_${nextSira}`;

    const mesaiData = {
      mesai_id: mesaiId,
      mesai_adi: mesaiAdi,
      gunler: JSON.stringify(['Haftalık']),
      mesai_saati: parseInt(mesaiSaati.toString()),
      kurum_id: user.kurum_id,
      departman_id: user.departman_id,
      birim_id: user.birim_id,
      aktif_mi: true
    };

    try {
      console.log('🚀 Mesai kaydediliyor:', mesaiData);
      
      // Tüm cache'i temizle
      clearAllCache();
      
      const result = await addTableData('73', mesaiData);
      
      if (result.success) {
        console.log('✅ Mesai başarıyla kaydedildi');
        
        // Cache'i tekrar temizle ve fresh data çek
        clearTableCache('73');
        
        // Formu temizle
        setMesaiAdi('');
        setMesaiSaati(8);
        
        // Fresh data çek
        await loadMesaiTurleri();
        
        showSuccessToast('Mesai türü başarıyla kaydedildi!');
      } else {
        console.error('❌ Mesai kaydetme hatası:', result.error);
        showErrorToast('Mesai türü kaydedilemedi: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('🚨 Mesai kaydetme hatası:', error);
      showErrorToast('Mesai türü kaydedilirken hata oluştu');
    }
  };



  // Mesai türünü veritabanından sil
  const handleMesaiTuruSil = async (mesaiId: number) => {
    if (!confirm('Bu mesai türünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      console.log('🗑️ Mesai türü siliniyor:', mesaiId);
      
      // Cache'i temizle
      clearTableCache('73');
      
      const result = await deleteTableData('73', mesaiId.toString());
      
      console.log('📥 Silme API yanıtı:', result);
      
      if (result.success) {
        console.log('✅ Mesai türü başarıyla silindi');
        
        // Cache'i tekrar temizle ve fresh data çek
        clearAllCache();
        await loadMesaiTurleri();
        
        showSuccessToast('Mesai türü başarıyla silindi!');
      } else {
        console.error('❌ Silme API Hatası:', result.error);
        showErrorToast('Mesai türü silinemedi: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('🚨 Mesai türü silme hatası:', error);
      showErrorToast('Mesai türü silinirken hata oluştu');
    }
  };

  // Toast mesajları
  const [toasts, setToasts] = useState<Array<{id: number, message: string, type: 'success' | 'error'}>>([]);

  const showSuccessToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const showErrorToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'error' }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
    return <div>Yükleniyor, lütfen bekleyin...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-slide-in ${
              toast.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Haftalık Minimum Mesai Tanımlama */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Haftalık Minimum Mesai Tanımlama
        </h2>

        {/* Mesai Ekleme Formu */}
        <div className="space-y-4 mb-6">
          {/* Mesai Adı - Üstte tek başına */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesai Adı
            </label>
            <input
              type="text"
              value={mesaiAdi}
              onChange={(e) => setMesaiAdi(e.target.value)}
              placeholder="Örn: Tam Mesai, Part-Time, Vardiyalı Çalışma, Esnek Mesai"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Haftalık Saat ve Ekle butonu - Altta yan yana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Haftalık Saat
              </label>
              <input
                type="number"
                value={mesaiSaati}
                onChange={(e) => setMesaiSaati(Number(e.target.value))}
                min="1"
                max="168"
                placeholder="40"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleMesaiEkle}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Kaydedilen Mesai Türleri */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kaydedilen Mesai Türleri</h3>
          
          {mesaiLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Mesai türleri yükleniyor...</p>
            </div>
          ) : kaydedilenMesaiTurleri.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">Henüz kaydedilmiş mesai türü bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-2">
              {kaydedilenMesaiTurleri.map((mesai) => (
                <div key={mesai.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{mesai.mesai_adi}</h4>
                      <div className="text-gray-600 text-sm">
                        <span className="font-medium">Haftalık Kapasite:</span> {mesai.mesai_saati} saat
                      </div>
                    </div>
                    <button
                      onClick={() => handleMesaiTuruSil(mesai.id)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-4 flex-shrink-0"
                      title="Mesai türünü sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mevcut Unvan Tanımları */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Personel Ünvan Tanımları
        </h2>

        {/* Yeni Unvan Ekleme */}
        <div className="flex gap-3 mb-6">
        <input
          type="text"
            value={yeniUnvan}
            onChange={(e) => setYeniUnvan(e.target.value)}
          placeholder="YENİ ÜNVAN GİRİN"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleUnvanEkle}
        />
        <button
          onClick={handleUnvanEkle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
            +
        </button>
      </div>

        {/* Unvan Listesi */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unvanlar.map((unvan) => (
              <div key={unvan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">{unvan.unvan_adi}</span>
            <button
                  onClick={() => handleUnvanSil(unvan.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
        )}
        </div>
    </div>
  );
};

export default UnvanTanimlama; 