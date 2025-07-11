import React, { useState, useRef } from 'react';
import { useCapitalization } from '../../hooks/useCapitalization';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import Select from 'react-select';
import turkiyeIller from './il-ilceler/turkiye-il-ilce.json';
import { useNavigate } from 'react-router-dom';
import { addKurum, testAPI } from '../../lib/api';

function generateKurumKodu() {
  return (
    'KURUM-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

// Benzersiz id üretmek için
// @ts-ignore
const getUUID = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 12));

// Türkiye il-ilçe listesi (örnek, tam liste eklenebilir)
const ILLER = [
  { ad: 'İstanbul', ilceler: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Bakırköy', 'Şişli'] },
  { ad: 'Ankara', ilceler: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Sincan'] },
  { ad: 'İzmir', ilceler: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Gaziemir'] },
  // ... diğer iller ve ilçeler
];

// Türkçe karakterleri normalize eden küçük harfe çevirme fonksiyonu
function normalizeTr(str: string) {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ş/g, 'ş')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
}

function DepartmanKarti({ kurumId }: { kurumId: string }) {
  const [departmanlar, setDepartmanlar] = useState([{ id: Date.now(), ad: '' }]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const yeni = [...departmanlar];
    yeni[i].ad = e.target.value.toUpperCase();
    setDepartmanlar(yeni);
  };

  const handleAdd = () => {
    setDepartmanlar([...departmanlar, { id: Date.now(), ad: '' }]);
    setTimeout(() => {
      inputRefs.current[departmanlar.length]?.focus();
    }, 100);
  };

  const handleRemove = (i: number) => {
    setDepartmanlar(departmanlar.filter((_, idx) => idx !== i));
  };

  const handleKaydet = async () => {
    setSuccessMsg(''); setErrorMsg('');
    const kaydedilecekler = departmanlar.filter(d => d.ad.trim() !== '');
    if (kaydedilecekler.length === 0) {
      setErrorMsg('En az bir departman girin!');
      return;
    }
    
    // LocalStorage'a kaydet
    let localDep = [];
    try { localDep = JSON.parse(localStorage.getItem('admin_kurumlar_departmanlar') || '[]'); } catch {}
    kaydedilecekler.forEach(d => localDep.push({ ad: d.ad, kurum_id: kurumId }));
    localStorage.setItem('admin_kurumlar_departmanlar', JSON.stringify(localDep));
    
    setSuccessMsg('Departmanlar başarıyla kaydedildi!');
    setDepartmanlar([{ id: Date.now(), ad: '' }]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex-1 mr-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
          <span role="img" aria-label="departman">🏥</span> Departman Tanımları
        </div>
        <button onClick={handleAdd} className="p-2 bg-blue-100 rounded hover:bg-blue-200"><Plus /></button>
      </div>
      <div className="space-y-2">
        {departmanlar.map((d, i) => (
          <div key={d.id} className="flex items-center gap-2">
            <input
              ref={el => inputRefs.current[i] = el}
              value={d.ad}
              onChange={e => handleInputChange(i, e)}
              placeholder="Departman Adı"
              className="flex-1 border rounded p-2"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={() => handleRemove(i)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 /></button>
          </div>
        ))}
      </div>
      <button onClick={handleKaydet} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">KAYDET</button>
      {successMsg && <div className="text-green-600 mt-2 text-sm">{successMsg}</div>}
      {errorMsg && <div className="text-red-600 mt-2 text-sm">{errorMsg}</div>}
    </div>
  );
}

function BirimKarti({ kurumId }: { kurumId: string }) {
  const [birimler, setBirimler] = useState([{ id: Date.now(), ad: '' }]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const yeni = [...birimler];
    yeni[i].ad = e.target.value.toUpperCase();
    setBirimler(yeni);
  };

  const handleAdd = () => {
    setBirimler([...birimler, { id: Date.now(), ad: '' }]);
    setTimeout(() => {
      inputRefs.current[birimler.length]?.focus();
    }, 100);
  };

  const handleRemove = (i: number) => {
    setBirimler(birimler.filter((_, idx) => idx !== i));
  };

  const handleKaydet = async () => {
    setSuccessMsg(''); setErrorMsg('');
    const kaydedilecekler = birimler.filter(b => b.ad.trim() !== '');
    if (kaydedilecekler.length === 0) {
      setErrorMsg('En az bir birim girin!');
      return;
    }
    
    // LocalStorage'a kaydet
    let localBirim = [];
    try { localBirim = JSON.parse(localStorage.getItem('admin_kurumlar_birimler') || '[]'); } catch {}
    kaydedilecekler.forEach(b => localBirim.push({ ad: b.ad, kurum_id: kurumId }));
    localStorage.setItem('admin_kurumlar_birimler', JSON.stringify(localBirim));
    
    setSuccessMsg('Birimler başarıyla kaydedildi!');
    setBirimler([{ id: Date.now(), ad: '' }]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex-1 ml-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-green-700 font-semibold text-lg">
          <span role="img" aria-label="birim">👩‍⚕️</span> Birim Tanımları
        </div>
        <button onClick={handleAdd} className="p-2 bg-green-100 rounded hover:bg-green-200"><Plus /></button>
      </div>
      <div className="space-y-2">
        {birimler.map((b, i) => (
          <div key={b.id} className="flex items-center gap-2">
            <input
              ref={el => inputRefs.current[i] = el}
              value={b.ad}
              onChange={e => handleInputChange(i, e)}
              placeholder="Birim Adı"
              className="flex-1 border rounded p-2"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={() => handleRemove(i)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 /></button>
          </div>
        ))}
      </div>
      <button onClick={handleKaydet} className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">KAYDET</button>
      {successMsg && <div className="text-green-600 mt-2 text-sm">{successMsg}</div>}
      {errorMsg && <div className="text-red-600 mt-2 text-sm">{errorMsg}</div>}
    </div>
  );
}

const KurumEkleFormu = () => {
  const [kurumAdi, handleKurumAdiChange] = useCapitalization('');
  const [kurumTuru, handleKurumTuruChange] = useCapitalization('');
  const [adres, handleAdresChange] = useCapitalization('');
  const [il, setIl] = useState<{ value: string; label: string } | null>(null);
  const [ilce, setIlce] = useState<{ value: string; label: string } | null>(null);
  const [aktifMi, setAktifMi] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // API Test fonksiyonu
  const handleAPITest = async () => {
    try {
      const result = await testAPI();
      setSuccessMsg('API bağlantısı başarılı!');
      console.log('API Test:', result);
    } catch (error) {
      setErrorMsg('API bağlantısı başarısız!');
      console.error('API Test Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const kurumData = {
      kurum_adi: kurumAdi,
      kurum_turu: kurumTuru,
      adres: adres,
      il: il?.value || '',
      ilce: ilce?.value || '',
      aktif_mi: aktifMi,
    };

    try {
      // Gerçek API'ye kaydet
      const response = await addKurum(kurumData);
      
      if (response.success) {
        setSuccessMsg('Kurum başarıyla kaydedildi!');
        
        // LocalStorage'a da kaydet (fallback için)
        const localKurumlar = JSON.parse(localStorage.getItem('admin_kurumlar') || '[]');
        const kurumKaydi = { ...kurumData, id: Date.now().toString() };
        localKurumlar.push(kurumKaydi);
        localStorage.setItem('admin_kurumlar', JSON.stringify(localKurumlar));
        
        // Formu sıfırla
        handleKurumAdiChange({ target: { value: '' } } as any);
        handleKurumTuruChange({ target: { value: '' } } as any);
        handleAdresChange({ target: { value: '' } } as any);
        setIl(null);
        setIlce(null);
        setAktifMi(true);
      } else {
        throw new Error(response.error || 'Kurum kaydedilemedi');
      }
    } catch (error: any) {
      setErrorMsg(`Hata: ${error.message}`);
      console.error('Kurum kaydetme hatası:', error);
      
      // Hata durumunda LocalStorage'a kaydet
      const localKurumlar = JSON.parse(localStorage.getItem('admin_kurumlar') || '[]');
      const kurumKaydi = { ...kurumData, id: Date.now().toString() };
      localKurumlar.push(kurumKaydi);
      localStorage.setItem('admin_kurumlar', JSON.stringify(localKurumlar));
      setSuccessMsg('Kurum LocalStorage\'a kaydedildi (API hatası)');
    } finally {
      setLoading(false);
    }
  };

  const filterOption = (option: any, inputValue: string) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase());

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
        
        <button
          onClick={handleAPITest}
          className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition shadow-sm"
        >
          API Test
        </button>
      </div>

      {/* Error/Success Messages */}
      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          value={kurumAdi} 
          onChange={handleKurumAdiChange} 
          placeholder="Kurum Adı" 
          className="border p-2 w-full rounded-lg" 
          required 
        />
        <input 
          value={kurumTuru} 
          onChange={handleKurumTuruChange} 
          placeholder="Kurum Türü" 
          className="border p-2 w-full rounded-lg" 
        />
        <input 
          value={adres} 
          onChange={handleAdresChange} 
          placeholder="Adres" 
          className="border p-2 w-full rounded-lg" 
          autoComplete="off" 
        />
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={turkiyeIller.map(i => ({ value: i.ad, label: i.ad }))}
              value={il}
              onChange={v => { setIl(v); setIlce(null); }}
              placeholder="İl"
              isClearable
              classNamePrefix="react-select"
              filterOption={filterOption}
            />
          </div>
          <div className="flex-1">
            <Select
              options={
                il
                  ? (turkiyeIller.find(i => i.ad === il.value)?.ilceler || []).map(ilceAd => ({ value: ilceAd, label: ilceAd }))
                  : []
              }
              value={ilce}
              onChange={v => setIlce(v)}
              placeholder="İlçe"
              isClearable
              isDisabled={!il}
              classNamePrefix="react-select"
              filterOption={filterOption}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="aktif"
            checked={aktifMi}
            onChange={(e) => setAktifMi(e.target.checked)}
          />
          <label htmlFor="aktif" className="text-sm">Aktif mi?</label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'KAYDET'}
        </button>
      </form>
    </div>
  );
};

export default KurumEkleFormu; 