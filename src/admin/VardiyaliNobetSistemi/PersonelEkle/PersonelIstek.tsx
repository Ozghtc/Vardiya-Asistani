import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Clock, AlertCircle } from 'lucide-react';

interface FormData {
  istekTuru: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  tekrarlaniyorMu: boolean;
  aciklama: string;
}

interface SavedRequest {
  id: number;
  istekTuru: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  tekrarlaniyorMu: boolean;
  aciklama: string;
  createdAt: string;
}

interface Props {
  data: FormData;
  onChange: (data: FormData) => void;
  userData?: {
    tcno?: string;
    name?: string;
    surname?: string;
  };
}

const PersonelIstek: React.FC<Props> = ({ data, onChange, userData }) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [isRange, setIsRange] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [addedRanges, setAddedRanges] = useState<{start: string, end: string}[]>([]);
  const [deleteModal, setDeleteModal] = useState<{open: boolean, id: number | null}>({open: false, id: null});
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [personelId, setPersonelId] = useState('');
  const [selectedVardiya, setSelectedVardiya] = useState('');
  const [selectedTarih, setSelectedTarih] = useState('');
  const [istekler, setIstekler] = useState<any[]>([]);

  const istekTurleri = [
    { id: 'yillik-izin', name: 'YILLIK İZİN', description: 'Yıllık izin talebi' },
    { id: 'mazeret', name: 'MAZERET İZNİ', description: 'Mazeret izni talebi' },
    { id: 'nobet', name: 'NÖBET İSTEĞİ', description: 'Nöbet günü tercihi' },
    { id: 'bosluk', name: 'BOŞLUK İSTEĞİ', description: 'Nöbet boşluğu talebi' },
    { id: 'degisim', name: 'NÖBET DEĞİŞİMİ', description: 'Nöbet değişim talebi' }
  ];

  const getIstekTuruName = (id: string) => {
    return istekTurleri.find(tur => tur.id === id)?.name || id;
  };

  const handleIstekEkle = async () => {
    if (!selectedVardiya || !selectedTarih) {
      setError('Vardiya ve tarih seçimi zorunludur');
      return;
    }

    // Supabase ile ilgili kodları kaldır
    // ... existing code ...
  };

  const handleIstekSil = async (istekId: number) => {
    // Supabase ile ilgili kodları kaldır
    // ... existing code ...
  };

  useEffect(() => {
    // Supabase ile ilgili kodları kaldır
    // ... existing code ...
  }, [personelId]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol Panel - Yeni İstek */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Yeni İstek Oluştur</h3>
          
          {/* Tarih Seçimi */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRange"
                checked={isRange}
                onChange={e => {
                  setIsRange(e.target.checked);
                  setRangeStart('');
                  setRangeEnd('');
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isRange" className="text-sm font-medium text-gray-700">
                İki Tarih Aralığı
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!isRange ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="date"
                    value={singleDate}
                    onChange={e => setSingleDate(e.target.value)}
                    className="flex-1 rounded-lg border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (singleDate) {
                        setAddedRanges(prev => [...prev, { start: singleDate, end: singleDate }]);
                        setSingleDate('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={!singleDate}
                  >
                    Ekle
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Başlangıç</label>
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={e => setRangeStart(e.target.value)}
                      className="w-full rounded-lg border-gray-300"
                      max={rangeEnd || undefined}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Bitiş</label>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={e => setRangeEnd(e.target.value)}
                      className="w-full rounded-lg border-gray-300"
                      min={rangeStart || undefined}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (rangeStart && rangeEnd && rangeStart <= rangeEnd) {
                          setAddedRanges(prev => [...prev, { start: rangeStart, end: rangeEnd }]);
                          setRangeStart('');
                          setRangeEnd('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={!(rangeStart && rangeEnd && rangeStart <= rangeEnd)}
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Eklenen Tarihler */}
            {addedRanges.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                {addedRanges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {range.start === range.end ? range.start : `${range.start} - ${range.end}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddedRanges(ranges => ranges.filter((_, i) => i !== index))}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* İstek Türü */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İstek Türü
            </label>
            <select
              value={data.istekTuru}
              onChange={(e) => onChange({ ...data, istekTuru: e.target.value })}
              className="w-full rounded-lg border-gray-300"
            >
              <option value="">İstek türü seçin</option>
              {istekTurleri.map(tur => (
                <option key={tur.id} value={tur.id}>{tur.name}</option>
              ))}
            </select>
          </div>

          {/* Tekrarlanma */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.tekrarlaniyorMu}
                onChange={(e) => onChange({ ...data, tekrarlaniyorMu: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Bu istek haftalık olarak tekrarlansın</span>
            </label>
          </div>

          {/* Açıklama */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={data.aciklama}
              onChange={(e) => onChange({ ...data, aciklama: e.target.value })}
              rows={4}
              className="w-full rounded-lg border-gray-300"
              placeholder="İsteğinizle ilgili açıklama ekleyin..."
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const newRequests = addedRanges.map(range => ({
                id: Date.now() + Math.random(),
                istekTuru: data.istekTuru,
                baslangicTarihi: range.start,
                bitisTarihi: range.end,
                tekrarlaniyorMu: data.tekrarlaniyorMu,
                aciklama: data.aciklama,
                createdAt: new Date().toLocaleString()
              }));

              setSavedRequests(prev => [...prev, ...newRequests]);
              setAddedRanges([]);
              onChange({
                istekTuru: '',
                baslangicTarihi: '',
                bitisTarihi: '',
                tekrarlaniyorMu: false,
                aciklama: ''
              });
            }}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={addedRanges.length === 0 || !data.istekTuru}
          >
            İsteği Kaydet
          </button>
        </div>

        {/* Sağ Panel - Kayıtlı İstekler */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Kayıtlı İstekler</h3>
          
          {savedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Henüz kayıtlı istek bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRequests.map(request => (
                <div key={request.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {getIstekTuruName(request.istekTuru)}
                    </span>
                    <button
                      onClick={() => setDeleteModal({open: true, id: request.id})}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {request.baslangicTarihi}
                        {request.bitisTarihi !== request.baslangicTarihi && 
                          ` - ${request.bitisTarihi}`
                        }
                      </span>
                    </div>

                    {request.tekrarlaniyorMu && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Clock className="w-4 h-4" />
                        <span>Haftalık tekrar</span>
                      </div>
                    )}

                    {request.aciklama && (
                      <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
                        {request.aciklama}
                      </p>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      Oluşturulma: {request.createdAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Silme Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">İsteği Sil</h4>
            <p className="text-gray-600 mb-6">Bu isteği silmek istediğinize emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setDeleteModal({open: false, id: null})}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => {
                  setSavedRequests(prev => prev.filter(r => r.id !== deleteModal.id));
                  setDeleteModal({open: false, id: null});
                }}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonelIstek;