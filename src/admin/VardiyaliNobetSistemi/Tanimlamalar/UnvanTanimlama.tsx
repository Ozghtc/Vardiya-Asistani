import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { apiRequest } from '../../../lib/api';
import { Trash2, Plus, Clock } from 'lucide-react';

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

  const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  useEffect(() => {
    // Load unvanlar from HZM API
    const loadUnvanlar = async () => {
      if (user?.kurum_id && user?.departman_id && user?.birim_id) {
        setLoading(true);
        setError(null);
        
        try {
          const response = await apiRequest(`/api/v1/data/table/15?kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`, {
            method: 'GET'
          });
          
          if (response.success) {
            setUnvanlar(response.data.rows);
          } else {
            setError('Ünvanlar yüklenemedi: ' + (response.error || 'Bilinmeyen hata'));
          }
        } catch (error) {
          console.error('Ünvanlar yüklenemedi:', error);
          setError('Ünvanlar yüklenemedi. Lütfen tekrar deneyin.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadUnvanlar();
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

              const response = await apiRequest('/api/v1/data/table/15/rows', {
          method: 'POST',
          body: JSON.stringify(newUnvan)
        });

      if (response.success) {
        const updatedUnvanlar = [...unvanlar, response.data.row];
        setUnvanlar(updatedUnvanlar);
        
        setYeniUnvan('');
        setError(null);
      } else {
        setError('Ünvan eklenemedi: ' + response.error);
      }
    } catch (error) {
      console.error('Ünvan ekleme hatası:', error);
      setError('Ünvan eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleUnvanSil = async (unvanId: number) => {
    try {
              const response = await apiRequest(`/api/v1/data/table/15/rows/${unvanId}`, {
          method: 'DELETE'
        });

      if (response.success) {
        const updatedUnvanlar = unvanlar.filter(unvan => unvan.id !== unvanId);
        setUnvanlar(updatedUnvanlar);
      } else {
        setError('Ünvan silinemedi: ' + response.error);
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
      alert('Lütfen mesai adı girin ve en az bir gün seçin');
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

  const handleMesaiKaydet = () => {
    console.log('Mesai tanımları:', mesaiTanımları);
    console.log('Bu veriler veritabanına kaydedilecek');
    setShowMesaiPopup(false);
  };

  const handleMesaiSil = (id: string) => {
    setMesaiTanımları(prev => prev.filter(mesai => mesai.id !== id));
  };

  if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
    return <div>Yükleniyor, lütfen bekleyin...</div>;
  }

  return (
    <div className="space-y-6">
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