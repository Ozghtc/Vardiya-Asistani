import React, { useState } from 'react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { KurumCrudOperations } from '../services/kurumCrudOperations';
import { 
  IL_OPTIONS, getIlceOptions, KURUM_TURU_OPTIONS, DEPARTMAN_OPTIONS, BIRIM_OPTIONS
} from '../data/locationData';

interface KurumEkleFormuProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const KurumEkleFormu: React.FC<KurumEkleFormuProps> = ({ onSuccess, onCancel }) => {
  // Basic form states
  const [kurumAdi, handleKurumAdiChange] = useCapitalization('');
  const [kurumTuru, handleKurumTuruChange] = useCapitalization('');
  const [adres, handleAdresChange] = useCapitalization('');
  const [telefon, setTelefon] = useState('');
  const [email, setEmail] = useState('');
  const [kurumForm, setKurumForm] = useState({
    il: null as { value: string; label: string } | null,
    ilce: null as { value: string; label: string } | null,
    aktif_mi: true
  });
  
  // Departman/Birim states - RESTORE EDİLDİ
  const [formDepartmanlar, setFormDepartmanlar] = useState<string[]>([]);
  const [formBirimler, setFormBirimler] = useState<string[]>([]);
  const [newDepartmanInput, setNewDepartmanInput] = useState('');
  const [newBirimInput, setNewBirimInput] = useState('');
  
  // Capitalization hooks for departman/birim - RESTORE EDİLDİ
  const [formDepartmanInput, handleFormDepartmanInputChange] = useCapitalization(newDepartmanInput);
  const [formBirimInput, handleFormBirimInputChange] = useCapitalization(newBirimInput);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // API Test fonksiyonu
  const handleAPITest = async () => {
    try {
      await KurumCrudOperations.testApiConnection(setSuccessMsg, setErrorMsg);
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };

  // Departman/Birim handlers - RESTORE EDİLDİ
  const addFormDepartman = () => {
    const departmanAdi = formDepartmanInput.trim();
    if (!departmanAdi) return;
    
    if (!formDepartmanlar.includes(departmanAdi)) {
      setFormDepartmanlar(prev => [...prev, departmanAdi]);
      setNewDepartmanInput('');
      handleFormDepartmanInputChange({ target: { value: '' } } as any);
    }
  };

  const removeFormDepartman = (departmanToRemove: string) => {
    setFormDepartmanlar(prev => prev.filter(d => d !== departmanToRemove));
  };

  const addFormBirim = () => {
    const birimAdi = formBirimInput.trim();
    if (!birimAdi) return;
    
    if (!formBirimler.includes(birimAdi)) {
      setFormBirimler(prev => [...prev, birimAdi]);
      setNewBirimInput('');
      handleFormBirimInputChange({ target: { value: '' } } as any);
    }
  };

  const removeFormBirim = (birimToRemove: string) => {
    setFormBirimler(prev => prev.filter(b => b !== birimToRemove));
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
      telefon: telefon,
      email: email,
      il: kurumForm.il?.value,
      ilce: kurumForm.ilce?.value,
      aktif_mi: kurumForm.aktif_mi,
      // RESTORE EDİLDİ - Departman/Birim verileri
      departmanlar: formDepartmanlar.join(', '),
      birimler: formBirimler.join(', ')
    };

    try {
      const result = await KurumCrudOperations.createKurum(kurumData, setSuccessMsg, setErrorMsg);
      
      if (result.success) {
        // Formu sıfırla - RESTORE EDİLDİ
        handleKurumAdiChange({ target: { value: '' } } as any);
        handleKurumTuruChange({ target: { value: '' } } as any);
        handleAdresChange({ target: { value: '' } } as any);
        setTelefon('');
        setEmail('');
        setKurumForm({ il: null, ilce: null, aktif_mi: true });
        setFormDepartmanlar([]);
        setFormBirimler([]);
        setNewDepartmanInput('');
        setNewBirimInput('');
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      setErrorMsg(`Hata: ${error.message}`);
      console.error('Kurum kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleGoBack}
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
        {/* Kurum Adı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kurum Adı</label>
          <input 
            value={kurumAdi} 
            onChange={handleKurumAdiChange} 
            placeholder="Kurum Adı" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
            required 
          />
        </div>

        {/* Kurum Türü */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kurum Türü</label>
          <CreatableSelect
            options={KURUM_TURU_OPTIONS}
            value={kurumTuru ? { value: kurumTuru, label: kurumTuru } : null}
            onChange={(selected) => {
              const value = selected?.value || '';
              handleKurumTuruChange({ target: { value } } as any);
            }}
            placeholder="Kurum türü seçiniz veya yeni ekleyiniz"
            isClearable
            classNamePrefix="react-select"
            className="react-select-container"
          />
        </div>

        {/* Adres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
          <input 
            value={adres} 
            onChange={handleAdresChange} 
            placeholder="Adres" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
            autoComplete="off" 
          />
        </div>

        {/* İl/İlçe - RESTORE EDİLDİ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
            <Select
              options={IL_OPTIONS}
              value={kurumForm.il}
              onChange={(selected) => setKurumForm(prev => ({ ...prev, il: selected, ilce: null }))}
              placeholder="İl seçiniz"
              isClearable
              classNamePrefix="react-select"
              className="react-select-container"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
            <Select
              options={kurumForm.il ? getIlceOptions(kurumForm.il.value) : []}
              value={kurumForm.ilce}
              onChange={(selected) => setKurumForm(prev => ({ ...prev, ilce: selected }))}
              placeholder="İlçe seçiniz"
              isDisabled={!kurumForm.il}
              isClearable
              classNamePrefix="react-select"
              className="react-select-container"
            />
          </div>
        </div>

        {/* Telefon/Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            value={telefon} 
            onChange={(e) => setTelefon(e.target.value)} 
            placeholder="Telefon" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
            type="tel" 
          />
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="E-posta" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
            type="email" 
          />
        </div>

        {/* Aktif/Departman/Birim - RESTORE EDİLDİ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aktif"
              checked={kurumForm.aktif_mi}
              onChange={(e) => setKurumForm(prev => ({ ...prev, aktif_mi: e.target.checked }))}
              className="text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="aktif" className="text-sm font-medium text-gray-700">Aktif mi?</label>
          </div>

          {/* DEPARTMAN EKLEME - RESTORE EDİLDİ */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formDepartmanInput}
              onChange={handleFormDepartmanInputChange}
              placeholder="Departman ekle (örn: Satış, Üretim, Mutfak, vs.)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFormDepartman();
                }
              }}
            />
            <button
              type="button"
              onClick={addFormDepartman}
              disabled={!formDepartmanInput.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ➕
            </button>
          </div>

          {/* BIRIM EKLEME - RESTORE EDİLDİ */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formBirimInput}
              onChange={handleFormBirimInputChange}
              placeholder="Birim ekle (örn: Kasa, Depo, Servis, vs.)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-green-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFormBirim();
                }
              }}
            />
            <button
              type="button"
              onClick={addFormBirim}
              disabled={!formBirimInput.trim()}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ➕
            </button>
          </div>
        </div>

        {/* Eklenen Departmanlar - RESTORE EDİLDİ */}
        {formDepartmanlar.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-300">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              Eklenen Departmanlar ({formDepartmanlar.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {formDepartmanlar.map((departman, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200 hover:bg-blue-200 transition-colors">
                  <span className="font-medium">{departman}</span>
                  <button
                    type="button"
                    onClick={() => removeFormDepartman(departman)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                    title="Departmanı kaldır"
                  >
                    ❌
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Eklenen Birimler - RESTORE EDİLDİ */}
        {formBirimler.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 transition-all duration-300">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-green-600">🏢</span>
              Eklenen Birimler ({formBirimler.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {formBirimler.map((birim, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-full border border-green-200 hover:bg-green-200 transition-colors">
                  <span className="font-medium">{birim}</span>
                  <button
                    type="button"
                    onClick={() => removeFormBirim(birim)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                    title="Birimi kaldır"
                  >
                    ❌
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? '⏳ Kaydediliyor...' : '🏥 Kurum Ekle'}
        </button>
      </form>
    </div>
  );
};

export default KurumEkleFormu; 