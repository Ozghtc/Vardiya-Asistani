import React, { useState } from 'react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KurumCrudOperations } from '../services/kurumCrudOperations';

interface KurumEkleFormuProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const KurumEkleFormu: React.FC<KurumEkleFormuProps> = ({ onSuccess, onCancel }) => {
  const [kurumAdi, handleKurumAdiChange] = useCapitalization('');
  const [adres, handleAdresChange] = useCapitalization('');
  const [telefon, setTelefon] = useState('');
  const [email, setEmail] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const kurumData = {
      kurum_adi: kurumAdi,
      adres: adres,
      telefon: telefon,
      email: email,
    };

    try {
      const result = await KurumCrudOperations.createKurum(kurumData, setSuccessMsg, setErrorMsg);
      
      if (result.success) {
        // Formu sıfırla
        handleKurumAdiChange({ target: { value: '' } } as any);
        handleAdresChange({ target: { value: '' } } as any);
        setTelefon('');
        setEmail('');
        
        // Callback çağır
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
        <input 
          value={kurumAdi} 
          onChange={handleKurumAdiChange} 
          placeholder="Kurum Adı" 
          className="border p-2 w-full rounded-lg" 
          required 
        />
        <input 
          value={adres} 
          onChange={handleAdresChange} 
          placeholder="Adres" 
          className="border p-2 w-full rounded-lg" 
          autoComplete="off" 
        />
        <input 
          value={telefon} 
          onChange={(e) => setTelefon(e.target.value)} 
          placeholder="Telefon" 
          className="border p-2 w-full rounded-lg" 
          type="tel" 
        />
        <input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="E-posta" 
          className="border p-2 w-full rounded-lg" 
          type="email" 
        />

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