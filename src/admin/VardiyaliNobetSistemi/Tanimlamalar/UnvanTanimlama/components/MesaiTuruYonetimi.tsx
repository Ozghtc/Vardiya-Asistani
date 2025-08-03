import React, { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { KaydedilenMesai, MesaiFormData } from '../types/UnvanTanimlama.types';

interface MesaiTuruYonetimiProps {
  kaydedilenMesaiTurleri: KaydedilenMesai[];
  mesaiLoading: boolean;
  onMesaiEkle: (mesaiData: MesaiFormData) => Promise<void>;
  onMesaiTuruSil: (mesaiId: number) => Promise<void>;
}

const MesaiTuruYonetimi: React.FC<MesaiTuruYonetimiProps> = ({
  kaydedilenMesaiTurleri,
  mesaiLoading,
  onMesaiEkle,
  onMesaiTuruSil
}) => {
  const [mesaiAdi, setMesaiAdi] = useState('');
  const [mesaiSaati, setMesaiSaati] = useState<number>(8);

  const handleSubmit = async () => {
    if (!mesaiAdi.trim()) return;
    
    await onMesaiEkle({ mesaiAdi, mesaiSaati });
    setMesaiAdi('');
    setMesaiSaati(8);
  };

  return (
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
              onClick={handleSubmit}
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
                    onClick={() => onMesaiTuruSil(mesai.id)}
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
  );
};

export default MesaiTuruYonetimi; 