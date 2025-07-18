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
  gunler: string[];
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
  
  // Popup state'leri
  const [showMesaiPopup, setShowMesaiPopup] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']);
  const [mesaiAdi, setMesaiAdi] = useState('');
  const [mesaiSaati, setMesaiSaati] = useState<number>(8);
  const [mesaiTanımları, setMesaiTanımları] = useState<MesaiTanimi[]>([]);
  const [kaydedilenMesai, setKaydedilenMesai] = useState<any>(null);
  
  // Tüm kaydedilen mesai türleri için state
  const [kaydedilenMesaiTurleri, setKaydedilenMesaiTurleri] = useState<KaydedilenMesai[]>([]);
  const [mesaiLoading, setMesaiLoading] = useState(false);

  const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Mesai türlerini fresh olarak yükle
  const loadMesaiTurleri = async () => {
    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) return;

    setMesaiLoading(true);
    try {
      // Cache'i zorla temizle
      clearTableCache('24');
      
      // Fresh data çek
      const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
      const data = await getTableData('24', filterParams, true); // Force fresh
      
      console.log('📋 Fresh mesai türleri:', data);
      setKaydedilenMesaiTurleri(data);
    } catch (error) {
      console.error('Mesai türleri yüklenirken hata:', error);
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
          
          const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
          const data = await getTableData('15', filterParams);
          
          console.log('📦 Ünvanlar yüklendi:', data);
          setUnvanlar(data);
        } catch (error) {
          console.error('🚨 Ünvanlar yüklenemedi:', error);
          setError('Ünvanlar yüklenemedi. Lütfen tekrar deneyin.');
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
      setError('Kurum, departman ve birim seçili değil!');
      return;
    }

    try {
      const newUnvan = {
        unvan_adi: yeniUnvan.trim(),
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id,
        aktif_mi: true
      };

      const result = await addTableData('15', newUnvan);

      if (result.success) {
        // Veriyi yeniden yükle
        const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
        const data = await getTableData('15', filterParams, true);
        setUnvanlar(data);
        
        setYeniUnvan('');
        setError(null);
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
      const result = await deleteTableData('15', unvanId.toString());

      if (result.success && user) {
        // Veriyi yeniden yükle
        const filterParams = `kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`;
        const data = await getTableData('15', filterParams, true);
        setUnvanlar(data);
      } else {
        setError('Ünvan silinemedi: ' + result.error);
      }
    } catch (error) {
      console.error('Ünvan silme hatası:', error);
      setError('Ünvan silinemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleMesaiPopupOpen = () => {
    setShowMesaiPopup(true);
    setSelectedDays(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']);
    setMesaiAdi('');
    setMesaiSaati(8);
    setMesaiTanımları([]);
  };

  const handleDayToggle = (gun: string) => {
    setSelectedDays(prev => 
      prev.includes(gun) 
        ? prev.filter(g => g !== gun)
        : [...prev, gun]
    );
  };

  const handleMesaiEkle = () => {
    if (!mesaiAdi.trim() || selectedDays.length === 0) {
      showErrorToast('Lütfen mesai adı girin ve en az bir gün seçin');
      return;
    }

    const yeniMesai: MesaiTanimi = {
      id: Date.now().toString(),
      gunler: [...selectedDays],
      mesaiAdi: mesaiAdi.trim(),
      mesaiSaati: mesaiSaati
    };

    setMesaiTanımları(prev => [...prev, yeniMesai]);
    setMesaiAdi('');
    setMesaiSaati(8);
  };

  const handleMesaiKaydet = async () => {
    if (!mesaiAdi || !selectedDays.length || !mesaiSaati) {
      showErrorToast('Lütfen tüm alanları doldurun');
      return;
    }

    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
      showErrorToast('Kullanıcı bilgisi bulunamadı');
      return;
    }

    const mesaiData = {
      mesai_adi: mesaiAdi,
      gunler: JSON.stringify(selectedDays),
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
      
      const result = await addTableData('24', mesaiData);
      
      if (result.success) {
        console.log('✅ Mesai başarıyla kaydedildi');
        
        // Cache'i tekrar temizle ve fresh data çek
        clearTableCache('24');
        
        // Modal'ı kapat ve formu temizle
        setShowMesaiPopup(false);
        setMesaiAdi('');
        setSelectedDays([]);
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

  const handleMesaiSil = (id: string) => {
    setMesaiTanımları(prev => prev.filter(mesai => mesai.id !== id));
  };

  // Mesai türünü veritabanından sil
  const handleMesaiTuruSil = async (mesaiId: number) => {
    if (!confirm('Bu mesai türünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      console.log('🗑️ Mesai türü siliniyor:', mesaiId);
      
      // Cache'i temizle
      clearTableCache('24');
      
      const result = await deleteTableData('24', mesaiId.toString());
      
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

      {/* Personel Gün Mesai Tanımlama Butonu */}
      <button
        onClick={handleMesaiPopupOpen}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Clock className="w-5 h-5" />
        Personel Gün Mesai Tanımlama
      </button>

      {/* Mesai Tanımlama Popup */}
      {showMesaiPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Personel Gün Mesai Tanımlama</h2>
                <button
                  onClick={() => setShowMesaiPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Üst Kısım - Gün Seçimi ve Mesai Ekleme */}
              <div className="space-y-4 mb-6">
                {/* Gün Seçimi */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Vardiya Eklenecek Günler</p>
                  <div className="grid grid-cols-7 gap-2">
                    {gunler.map((gun) => (
                      <button
                        key={gun}
                        onClick={() => handleDayToggle(gun)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedDays.includes(gun)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {gun}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mesai Bilgileri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mesai Adı
                    </label>
                    <input
                      type="text"
                      value={mesaiAdi}
                      onChange={(e) => setMesaiAdi(e.target.value)}
                      placeholder="Örn: Gündüz Mesai"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mesai Saati
                    </label>
                    <input
                      type="number"
                      value={mesaiSaati}
                      onChange={(e) => setMesaiSaati(Number(e.target.value))}
                      min="1"
                      max="24"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleMesaiEkle}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Ekle
                </button>
              </div>

              {/* Alt Kısım - Eklenen Mesai Tanımları */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Eklenen Mesai Tanımları</h3>
                
                {mesaiTanımları.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Henüz mesai tanımı eklenmedi</p>
                ) : (
                  <div className="space-y-3">
                    {mesaiTanımları.map((mesai) => (
                      <div key={mesai.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{mesai.mesaiAdi}</p>
                          <p className="text-sm text-gray-600">
                            Günler: {mesai.gunler.join(', ')} | {mesai.mesaiSaati} saat
                          </p>
                        </div>
                        <button
                          onClick={() => handleMesaiSil(mesai.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kaydet Butonu */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowMesaiPopup(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleMesaiKaydet}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kaydedilen Mesai Türleri Listesi */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Kaydedilen Mesai Türleri
        </h2>
        
        {mesaiLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Mesai türleri yükleniyor...</p>
          </div>
        ) : kaydedilenMesaiTurleri.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Henüz kaydedilmiş mesai türü bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kaydedilenMesaiTurleri.map((mesai) => (
              <div key={mesai.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{mesai.mesai_adi}</h3>
                    <div className="text-gray-600 text-sm">
                      <span className="font-medium">Günler:</span> {JSON.parse(mesai.gunler).join(', ')} | {mesai.mesai_saati} saat
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