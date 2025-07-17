import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Palette } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { SuccessNotification } from '../../../components/ui/Notification';
import { useDepartmanBirim } from './DepartmanBirimContext';
import { apiRequest } from '../../../lib/api';

interface IzinIstek {
  id: string;
  izin_turu: string;
  kisaltma: string;
  renk: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

const IzinTanimlama: React.FC = () => {
  const [izinAdi, setIzinAdi] = useState('');
  const [kisaltma, setKisaltma] = useState('');
  const [seciliRenk, setSeciliRenk] = useState('#3B82F6');
  const [personnelRequests, setPersonnelRequests] = useState<IzinIstek[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { kurum_id, departman_id, birim_id } = useDepartmanBirim();

  // 12'li renk kombinasyonu
  const renkPaleti = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F43F5E'  // Rose
  ];

  useEffect(() => {
    // Load izin istekleri from HZM API
    const loadIzinIstekleri = async () => {
      if (kurum_id && departman_id && birim_id) {
        try {
          const response = await apiRequest('/api/v1/data/table/16', {
            method: 'GET'
          });
          
          if (response.success) {
            const filteredIzinIstekleri = response.data.rows.filter((i: any) => 
              i.kurum_id === kurum_id && 
              i.departman_id === departman_id && 
              i.birim_id === birim_id
            );
            setPersonnelRequests(filteredIzinIstekleri);
          }
        } catch (error) {
          console.error('İzin istekleri yüklenemedi:', error);
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
      const newIzinIstek = {
        izin_turu: izinAdi.trim(),
        kisaltma: kisaltma.trim().toUpperCase(),
        renk: seciliRenk,
        kurum_id,
        departman_id,
        birim_id,
        aktif_mi: true
      };

      const response = await apiRequest('/api/v1/data/table/16/rows', {
        method: 'POST',
        body: JSON.stringify(newIzinIstek)
      });

      if (response.success) {
        const updatedIzinIstekleri = [...personnelRequests, response.data.row];
        setPersonnelRequests(updatedIzinIstekleri);
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Form'u temizle
        setIzinAdi('');
        setKisaltma('');
        setSeciliRenk('#3B82F6');
      } else {
        setErrorMsg('İzin türü eklenemedi: ' + response.error);
      }
    } catch (error) {
      console.error('İzin türü ekleme hatası:', error);
      setErrorMsg('İzin türü eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleRemoveRequest = async (id: string) => {
    try {
      const response = await apiRequest(`/api/v1/data/table/16/rows/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        const updatedIzinIstekleri = personnelRequests.filter(r => r.id !== id);
        setPersonnelRequests(updatedIzinIstekleri);
      } else {
        setErrorMsg('İzin türü silinemedi: ' + response.error);
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
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">İzin/İstek Tanımları</h2>
      </div>

      {/* Form */}
      <div className="space-y-4 mb-6">
        {/* İzin Adı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İzin/İstek Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={izinAdi}
            onChange={(e) => setIzinAdi(e.target.value)}
            placeholder="Örn: Yıllık İzin, Hastalık İzni"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Kısaltma */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tabloda Görünecek Kısaltma <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={kisaltma}
            onChange={(e) => setKisaltma(e.target.value.toUpperCase())}
            placeholder="Örn: YIL, HAST"
            maxLength={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          />
        </div>

        {/* Renk Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Renk Seçimi
          </label>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              {renkPaleti.map((renk) => (
                <button
                  key={renk}
                  onClick={() => setSeciliRenk(renk)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    seciliRenk === renk ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: renk }}
                  title={`Renk: ${renk}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Seçili: {seciliRenk}</span>
            </div>
          </div>
        </div>

        {/* Ekle Butonu */}
        <button
          onClick={handleAddRequest}
          disabled={!izinAdi.trim() || !kisaltma.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>İzin/İstek Ekle</span>
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Tanımlı İzin/İstekler</h3>
        {personnelRequests.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: item.renk || '#3B82F6' }}
              />
              <div>
                <div className="font-medium text-gray-900">{item.izin_turu}</div>
                <div className="text-sm text-gray-500">
                  Kısaltma: <span className="font-mono bg-gray-200 px-1 rounded">{item.kisaltma || 'N/A'}</span>
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
          <div className="text-center py-8 text-gray-500">
            Henüz izin/istek tanımı bulunmuyor
          </div>
        )}
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