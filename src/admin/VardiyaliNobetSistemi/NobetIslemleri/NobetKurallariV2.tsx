import React, { useState, useEffect } from 'react';
import { Clock, Shield, Settings } from 'lucide-react';

interface VardiyaKurali {
  vardiya: string;
  minDinlenme: number;
  maxDinlenme: number;
}

interface DinlenmeKural {
  vardiya: string;
  cikisSaati: string;
  minDinlenme: number;
  minBasla: string;
  maxDinlenme: number;
  maxBasla: string;
}

function addHoursToTime(time: string, hours: number): string {
  if (!time || isNaN(Number(hours))) return '';
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return '';
  let totalMinutes = h * 60 + m + Number(hours) * 60;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const mm = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

const NobetKurallariV2: React.FC = () => {
  const [vardiyaSecenekleri, setVardiyaSecenekleri] = useState<any[]>([]);
  const [vardiyaKurallari, setVardiyaKurallari] = useState<VardiyaKurali[]>([
    { vardiya: 'Sabah (08:00-16:00)', minDinlenme: 1, maxDinlenme: 3 },
    { vardiya: 'Uzun Gündüz (08:00-00:00)', minDinlenme: 2, maxDinlenme: 4 },
    { vardiya: 'Gece (16:00-08:00)', minDinlenme: 2, maxDinlenme: 4 }
  ]);
  const [digerKurallar, setDigerKurallar] = useState({
    ayniGunTekNobet: true,
    ayniGunFarkliAlan: true,
    maxHaftalikVardiya: 3,
    ustUsteAyniAlan: true
  });
  const [seciliVardiya, setSeciliVardiya] = useState<string>('');
  const [eklenenVardiyalar, setEklenenVardiyalar] = useState<any[]>([]);
  const [vardiyaIzinleri, setVardiyaIzinleri] = useState<Record<string, {
    cikisSaati: string;
    minIzin: string;
    maxIzin: string;
  }>>({});
  const [dinlenmeKurallari, setDinlenmeKurallari] = useState<DinlenmeKural[]>([]);

  useEffect(() => {
    const savedShifts = localStorage.getItem('shifts');
    if (savedShifts) {
      setVardiyaSecenekleri(JSON.parse(savedShifts));
    }
  }, []);

  const handleVardiyaEkle = () => {
    if (!seciliVardiya) return;
    const vardiya = vardiyaSecenekleri.find(v => v.name === seciliVardiya);
    if (vardiya && !eklenenVardiyalar.some(v => v.name === vardiya.name)) {
      setEklenenVardiyalar([...eklenenVardiyalar, vardiya]);
      setVardiyaIzinleri(prev => ({
        ...prev,
        [vardiya.name]: {
          cikisSaati: vardiya.endHour, // Automatically set end time from shift
          minIzin: '',
          maxIzin: ''
        }
      }));
    }
  };

  const handleVardiyaSil = (name: string) => {
    setEklenenVardiyalar(eklenenVardiyalar.filter(v => v.name !== name));
    const newIzinler = { ...vardiyaIzinleri };
    delete newIzinler[name];
    setVardiyaIzinleri(newIzinler);
  };

  const handleIzinChange = (vardiyaName: string, field: 'minIzin' | 'maxIzin', value: string) => {
    setVardiyaIzinleri(prev => ({
      ...prev,
      [vardiyaName]: {
        ...prev[vardiyaName],
        [field]: value
      }
    }));
  };

  const handleKaydet = (v: any) => {
    const izin = vardiyaIzinleri[v.name];
    if (!izin || !izin.minIzin || !izin.maxIzin) return;
    
    const minBasla = addHoursToTime(izin.cikisSaati, Number(izin.minIzin));
    const maxBasla = addHoursToTime(izin.cikisSaati, Number(izin.maxIzin));
    
    setDinlenmeKurallari(prev => ([
      ...prev.filter(k => k.vardiya !== `${v.name} (${v.startHour}-${v.endHour})`),
      {
        vardiya: `${v.name} (${v.startHour}-${v.endHour})`,
        cikisSaati: izin.cikisSaati,
        minDinlenme: Number(izin.minIzin),
        minBasla,
        maxDinlenme: Number(izin.maxIzin),
        maxBasla
      }
    ]));
  };

  const handleKuralSil = (vardiya: string) => {
    setDinlenmeKurallari(prev => prev.filter(k => k.vardiya !== vardiya));
  };

  return (
    <div className="space-y-8">
      {/* Vardiya Türleri */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Vardiya Türleri</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <select
            className="border rounded-lg px-4 py-2 w-full md:w-64"
            value={seciliVardiya}
            onChange={e => setSeciliVardiya(e.target.value)}
          >
            <option value="">Vardiya seçiniz</option>
            {vardiyaSecenekleri.map((v, i) => (
              <option key={v.id} value={v.name}>{v.name} ({v.startHour}-{v.endHour})</option>
            ))}
          </select>
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleVardiyaEkle}
          >
            Ekle
          </button>
        </div>
        {eklenenVardiyalar.length > 0 && (
          <div className="space-y-2">
            {eklenenVardiyalar.map((v, i) => {
              const izin = vardiyaIzinleri[v.name] || { cikisSaati: v.endHour, minIzin: '', maxIzin: '' };
              const minBasla = izin.cikisSaati && izin.minIzin ? addHoursToTime(izin.cikisSaati, Number(izin.minIzin)) : '';
              const maxBasla = izin.cikisSaati && izin.maxIzin ? addHoursToTime(izin.cikisSaati, Number(izin.maxIzin)) : '';
              return (
                <div key={v.id} className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-2 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-blue-800 text-lg">{v.name}</div>
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                        onClick={() => handleKaydet(v)}
                      >
                        Kaydet
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 font-bold px-2"
                        onClick={() => handleVardiyaSil(v.name)}
                        title="Kaldır"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Nöbet Çıkış Saati</label>
                      <input
                        type="time"
                        className="border rounded px-2 py-1 w-full bg-gray-100"
                        value={izin.cikisSaati}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Min İzin (saat)</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                        value={izin.minIzin}
                        min={0}
                        onChange={e => handleIzinChange(v.name, 'minIzin', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Başlayabileceği Saat</label>
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full bg-gray-100 text-gray-700"
                        value={minBasla}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Max İzin (saat)</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                        value={izin.maxIzin}
                        min={0}
                        onChange={e => handleIzinChange(v.name, 'maxIzin', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Başlayabileceği Saat</label>
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full bg-gray-100 text-gray-700"
                        value={maxBasla}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Dinlenme Kuralları</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Vardiya</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Çıkış Saati</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Min Dinlenme (saat)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Min. Başlayabileceği Saat</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Max Dinlenme (saat)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Max. Başlayabileceği Saat</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {dinlenmeKurallari.map((kural, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{kural.vardiya}</td>
                  <td className="py-3 px-4">{kural.cikisSaati}</td>
                  <td className="py-3 px-4">{kural.minDinlenme}</td>
                  <td className="py-3 px-4">{kural.minBasla}</td>
                  <td className="py-3 px-4">{kural.maxDinlenme}</td>
                  <td className="py-3 px-4">{kural.maxBasla}</td>
                  <td className="py-3 px-4">
                    <button
                      className="text-red-500 hover:text-red-700 font-bold px-2"
                      onClick={() => handleKuralSil(kural.vardiya)}
                      title="Kuralı Sil"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Diğer Kurallar</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={digerKurallar.ayniGunTekNobet}
              onChange={(e) => setDigerKurallar({ ...digerKurallar, ayniGunTekNobet: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Aynı güne birden fazla nöbet atanmasın</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={digerKurallar.ayniGunFarkliAlan}
              onChange={(e) => setDigerKurallar({ ...digerKurallar, ayniGunFarkliAlan: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Aynı gün iki farklı alanda nöbet atanmasın</span>
          </label>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Haftalık maksimum vardiya sayısı:</span>
            <input
              type="number"
              value={digerKurallar.maxHaftalikVardiya}
              onChange={(e) => setDigerKurallar({ ...digerKurallar, maxHaftalikVardiya: parseInt(e.target.value) })}
              className="w-20 rounded-lg border-gray-300"
              min={1}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={digerKurallar.ustUsteAyniAlan}
              onChange={(e) => setDigerKurallar({ ...digerKurallar, ustUsteAyniAlan: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Aynı alanda 3 gün üst üste görev alma engeli</span>
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Kuralları Kaydet
      </button>
    </div>
  );
};

export default NobetKurallariV2;