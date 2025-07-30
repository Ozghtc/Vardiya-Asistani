import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Palette, ChevronDown, Clock } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { SuccessNotification } from '../../../components/ui/Notification';
import { useDepartmanBirim } from './DepartmanBirimContext';
import { apiRequest, getTableData, addTableData, deleteTableData, clearAllCache, clearTableCache } from '../../../lib/api';

interface IzinIstek {
  id: string;
  izin_turu: string;
  kisaltma: string;
  renk: string;
  mesai_dusumu: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

const IzinTanimlama: React.FC = () => {
  const [izinAdi, setIzinAdi] = useState('');
  const [kisaltma, setKisaltma] = useState('');
  const [seciliRenk, setSeciliRenk] = useState('#3B82F6');
  const [renkDropdownAcik, setRenkDropdownAcik] = useState(false);
  const [mesaiDusumu, setMesaiDusumu] = useState(false);
  const [personnelRequests, setPersonnelRequests] = useState<IzinIstek[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { kurum_id, departman_id, birim_id } = useDepartmanBirim();

  // Canlı 12'li renk kombinasyonu
  const renkPaleti = [
    { kod: '#3B82F6', ad: 'Canlı Mavi' },
    { kod: '#EF4444', ad: 'Canlı Kırmızı' },
    { kod: '#10B981', ad: 'Canlı Yeşil' },
    { kod: '#F59E0B', ad: 'Canlı Turuncu' },
    { kod: '#8B5CF6', ad: 'Canlı Mor' },
    { kod: '#EC4899', ad: 'Canlı Pembe' },
    { kod: '#06B6D4', ad: 'Canlı Cyan' },
    { kod: '#84CC16', ad: 'Canlı Lime' },
    { kod: '#F97316', ad: 'Canlı Amber' },
    { kod: '#6366F1', ad: 'Canlı İndigo' },
    { kod: '#14B8A6', ad: 'Canlı Teal' },
    { kod: '#F43F5E', ad: 'Canlı Rose' }
  ];

  // Yıllık izin kontrolü
  useEffect(() => {
    const isYillikIzin = izinAdi.toLowerCase().includes('yıllık') || izinAdi.toLowerCase().includes('yillik');
    setMesaiDusumu(isYillikIzin);
  }, [izinAdi]);

  useEffect(() => {
    // Load izin istekleri from HZM API - KURAL 17 GÜVENLİK DÜZELTMESİ
    const loadIzinIstekleri = async () => {
      if (kurum_id && departman_id && birim_id) {
        try {
          // KURAL 17: Tüm cache'leri zorla temizle - güvenlik önlemi
          clearAllCache();
          clearTableCache('70');
          
          // KURAL 17: Direkt API çağrısı - cache bypass
          const response = await fetch('/.netlify/functions/api-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: '/api/v1/data/table/70',
              method: 'GET',
              // 3-Layer Authentication
              apiKey: import.meta.env.VITE_HZM_API_KEY,
              userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
              projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD
            })
          });

          if (!response.ok) {
            throw new Error('API request failed');
          }

          const data = await response.json();
          
          if (data.success && data.data && Array.isArray(data.data.rows)) {
            // KURAL 17: Güvenli filtreleme - kullanıcı bilgilerine göre
            const filteredIzinler = data.data.rows.filter((izin: any) => 
              izin.kurum_id === kurum_id &&
              izin.departman_id === departman_id &&
              izin.birim_id === birim_id
            );
            setPersonnelRequests(filteredIzinler);
          } else {
            setPersonnelRequests([]);
          }
        } catch (error) {
          console.error('İzin istekleri yüklenemedi:', error);
          // Tablo yoksa boş array set et, sayfa erişimini engelleme
          setPersonnelRequests([]);
        }
      }
    };
    
    loadIzinIstekleri();
  }, [kurum_id, departman_id, birim_id]);

  const handleAddRequest = async () => {
    setErrorMsg(null);
    if (!izinAdi.trim() || !kisaltma.trim()) {
      setErrorMsg('İzin adı ve kısaltma alanları zorunludur!');
      return;
    }
    if (!kurum_id || !departman_id || !birim_id) {
      setErrorMsg('Kurum, departman ve birim seçili değil!');
      return;
    }

    try {
      // KURAL 18: Dizi operasyonları ve duplicate kontrolü backend'de yapılmalı
      // Backend'den unique ID ve duplicate kontrolü gelecek
      const nextSira = 1; // Backend'den gelecek
      
      // DOĞRU FORMAT: kurum_D#_B#_sira (HIYERARSIK_ID_SISTEMI.md uyumlu)
      const departmanKodu = departman_id.split('_')[1] || 'D1'; // "6_D1" -> "D1"
      const birimKodu = birim_id.split('_')[1] || 'B1'; // "6_B1" -> "B1"
      const izinId = `${kurum_id}_${departmanKodu}_${birimKodu}_${nextSira}`;

      const newIzinIstek = {
        izin_id: izinId,
        izin_turu: izinAdi.trim(),
        kisaltma: kisaltma.trim(),
        renk: seciliRenk,
        mesai_dusumu: mesaiDusumu,
        kurum_id: kurum_id,
        departman_id: departman_id,
        birim_id: birim_id,
        aktif_mi: true
      };

      // YENİ TABLO ID: 70
      const result = await addTableData('70', newIzinIstek);

      if (result.success) {
        // KURAL 18: Güçlü cache temizleme ve fresh data
        clearAllCache();
        clearTableCache('70');
        
        // KURAL 18: Direkt API çağrısı ile fresh data - cache bypass
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/70',
            method: 'GET',
            // 3-Layer Authentication
            apiKey: import.meta.env.VITE_API_KEY,
            userEmail: import.meta.env.VITE_USER_EMAIL,
            projectPassword: import.meta.env.VITE_PROJECT_PASSWORD
          })
        });

        const freshData = await response.json();
        
        if (freshData.success && freshData.data && Array.isArray(freshData.data.rows)) {
          // KURAL 18: Filtreleme backend'de yapılmalı ama geçici frontend'de
          const filteredIzinler = freshData.data.rows.filter((izin: any) =>
            izin.kurum_id === kurum_id &&
            izin.departman_id === departman_id &&
            izin.birim_id === birim_id
          );
          
          setPersonnelRequests(filteredIzinler);
          console.log('🚀 KURAL 18: Fresh izin verileri yüklendi:', filteredIzinler.length, 'kayıt');
        }
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Form'u temizle
        setIzinAdi('');
        setKisaltma('');
        setSeciliRenk('#3B82F6');
        setMesaiDusumu(false);
      } else {
        setErrorMsg('İzin türü eklenemedi: ' + result.error);
      }
    } catch (error) {
      console.error('İzin türü ekleme hatası:', error);
      setErrorMsg('İzin türü eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleRemoveRequest = async (id: string) => {
    try {
      const result = await deleteTableData('70', id);

      if (result.success) {
        // KURAL 18: Güçlü cache temizleme ve fresh data
        clearAllCache();
        clearTableCache('70');
        
        // KURAL 18: Direkt API çağrısı ile fresh data - cache bypass
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/70',
            method: 'GET',
            // 3-Layer Authentication
            apiKey: import.meta.env.VITE_API_KEY,
            userEmail: import.meta.env.VITE_USER_EMAIL,
            projectPassword: import.meta.env.VITE_PROJECT_PASSWORD
          })
        });

        const freshData = await response.json();
        
        if (freshData.success && freshData.data && Array.isArray(freshData.data.rows)) {
          // KURAL 18: Filtreleme backend'de yapılmalı ama geçici frontend'de
          const filteredIzinler = freshData.data.rows.filter((izin: any) =>
            izin.kurum_id === kurum_id &&
            izin.departman_id === departman_id &&
            izin.birim_id === birim_id
          );
          
          setPersonnelRequests(filteredIzinler);
          console.log('🚀 KURAL 18: İzin silindi, fresh veriler yüklendi:', filteredIzinler.length, 'kayıt');
        }
      } else {
        setErrorMsg('İzin türü silinemedi: ' + result.error);
      }
    } catch (error) {
      console.error('İzin türü silme hatası:', error);
      setErrorMsg('İzin türü silinemedi. Lütfen tekrar deneyin.');
    }
  };

  if (!kurum_id || !departman_id || !birim_id) {
    return <div>Yükleniyor, lütfen bekleyin...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">İzin/İstek Tanımları</h2>
      </div>

      {/* Kompakt Form - Responsive */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        {/* İlk Satır - İzin Adı ve Kısaltma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* İzin Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İzin/İstek Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={izinAdi}
              onChange={(e) => setIzinAdi(e.target.value)}
              placeholder="Örn: Yıllık İzin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Kısaltma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kısaltma <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kisaltma}
              onChange={(e) => setKisaltma(e.target.value.toUpperCase())}
              placeholder="YIL"
              maxLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-center font-bold"
            />
          </div>
        </div>

        {/* İkinci Satır - Renk ve Mesai Düşümü */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Renk Seçimi - Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renk
            </label>
            <button
              onClick={() => setRenkDropdownAcik(!renkDropdownAcik)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: seciliRenk }}
                />
                <span className="text-sm font-medium">
                  {renkPaleti.find(r => r.kod === seciliRenk)?.ad || 'Renk Seç'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${renkDropdownAcik ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {renkDropdownAcik && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {renkPaleti.map((renk) => (
                  <button
                    key={renk.kod}
                    onClick={() => {
                      setSeciliRenk(renk.kod);
                      setRenkDropdownAcik(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: renk.kod }}
                    />
                    <span className="text-sm font-medium">{renk.ad}</span>
                    <span className="text-xs text-gray-500 ml-auto">{renk.kod}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mesai Düşümü Checkbox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesai Düşümü
            </label>
            <div className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                checked={mesaiDusumu}
                onChange={(e) => setMesaiDusumu(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {mesaiDusumu ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            {mesaiDusumu && (
              <p className="text-xs text-gray-500 mt-1">
                Yıllık izin mesaiden düşülecek
              </p>
            )}
          </div>
        </div>

        {/* Üçüncü Satır - Ekle Butonu */}
        <div className="flex justify-end">
          <button
            onClick={handleAddRequest}
            disabled={!izinAdi.trim() || !kisaltma.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ekle</span>
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Tanımlı İzin/İstekler</h3>
        <div className="grid gap-3">
          {personnelRequests.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: item.renk || '#3B82F6' }}
                />
                <div>
                  <div className="font-medium text-gray-900">{item.izin_turu}</div>
                  <div className="text-sm text-gray-500">
                    Kısaltma: <span className="font-mono bg-white px-2 py-1 rounded border font-bold">{item.kisaltma || 'N/A'}</span>
                    {item.mesai_dusumu && (
                      <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                        <Clock className="w-3 h-3" />
                        Mesai Düşümü
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveRequest(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {personnelRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              Henüz izin/istek tanımı bulunmuyor
            </div>
          )}
        </div>
      </div>

      {showSuccess && <SuccessNotification message="Başarıyla eklendi" />}
      {errorMsg && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default IzinTanimlama; 