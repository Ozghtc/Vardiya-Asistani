import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { SuccessNotification } from '../../../components/ui/Notification';
import { useDepartmanBirim } from './DepartmanBirimContext';

interface Unvan {
  id: string;
  unvan_adi: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

const UnvanTanimlama: React.FC = () => {
  const [unvanAdi, handleUnvanChange] = useCapitalization('');
  const [unvanlar, setUnvanlar] = useState<Unvan[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { kurum_id, departman_id, birim_id } = useDepartmanBirim();

  useEffect(() => {
    // Load unvanlar from localStorage
    const savedUnvanlar = JSON.parse(localStorage.getItem('unvanlar') || '[]');
    if (kurum_id && departman_id && birim_id) {
      const filteredUnvanlar = savedUnvanlar.filter((u: Unvan) => 
        u.kurum_id === kurum_id && 
        u.departman_id === departman_id && 
        u.birim_id === birim_id
      );
      setUnvanlar(filteredUnvanlar);
    }
  }, [kurum_id, departman_id, birim_id]);

  const handleUnvanEkle = async () => {
    if (!unvanAdi.trim()) {
      setErrorMsg('Ünvan adı gereklidir');
      return;
    }
    if (!kurum_id || !departman_id || !birim_id) {
      setErrorMsg('Kurum, departman ve birim seçili değil!');
      return;
    }

    const newUnvan = {
      id: Date.now().toString(),
      unvan_adi: unvanAdi.trim(),
      kurum_id,
      departman_id,
      birim_id
    };

    const updatedUnvanlar = [...unvanlar, newUnvan];
    setUnvanlar(updatedUnvanlar);
    
    // Update localStorage
    const allUnvanlar = JSON.parse(localStorage.getItem('unvanlar') || '[]');
    localStorage.setItem('unvanlar', JSON.stringify([...allUnvanlar, newUnvan]));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleUnvanChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleUnvanSil = async (unvanId: string) => {
    const updatedUnvanlar = unvanlar.filter(unvan => unvan.id !== unvanId);
    setUnvanlar(updatedUnvanlar);
    
    // Update localStorage
    const allUnvanlar = JSON.parse(localStorage.getItem('unvanlar') || '[]');
    localStorage.setItem('unvanlar', JSON.stringify(allUnvanlar.filter((u: Unvan) => u.id !== unvanId)));
  };

  if (!kurum_id || !departman_id || !birim_id) {
    return <div>Yükleniyor, lütfen bekleyin...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6 mt-8 flex">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Personel Ünvan Tanımları</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={unvanAdi}
            onChange={handleUnvanChange}
            placeholder="YENİ ÜNVAN GİRİN"
            className="flex-1 rounded-lg border-gray-300"
          />
          <button
            onClick={handleUnvanEkle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {unvanlar.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{item.unvan_adi}</span>
              <button
                onClick={() => handleUnvanSil(item.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {showSuccess && <SuccessNotification message="Başarıyla eklendi" />}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnvanTanimlama; 