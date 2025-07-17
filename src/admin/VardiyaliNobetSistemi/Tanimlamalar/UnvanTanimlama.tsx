import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { SuccessNotification } from '../../../components/ui/Notification';
import { useDepartmanBirim } from './DepartmanBirimContext';
import { apiRequest } from '../../../lib/api';

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
    // Load unvanlar from HZM API
    const loadUnvanlar = async () => {
      if (kurum_id && departman_id && birim_id) {
        try {
          const response = await apiRequest('/api/v1/data/table/15', {
            method: 'GET'
          });
          
          if (response.success) {
            const filteredUnvanlar = response.data.rows.filter((u: any) => 
              u.kurum_id === kurum_id && 
              u.departman_id === departman_id && 
              u.birim_id === birim_id
            );
            setUnvanlar(filteredUnvanlar);
          }
        } catch (error) {
          console.error('Ünvanlar yüklenemedi:', error);
        }
      }
    };
    
    loadUnvanlar();
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

    try {
      const newUnvan = {
        unvan_adi: unvanAdi.trim(),
        kurum_id,
        departman_id,
        birim_id,
        aktif_mi: true
      };

      const response = await apiRequest('/api/v1/data/table/15/rows', {
        method: 'POST',
        body: JSON.stringify(newUnvan)
      });

      if (response.success) {
        const updatedUnvanlar = [...unvanlar, response.data.row];
        setUnvanlar(updatedUnvanlar);
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        handleUnvanChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        setErrorMsg(null);
      } else {
        setErrorMsg('Ünvan eklenemedi: ' + response.error);
      }
    } catch (error) {
      console.error('Ünvan ekleme hatası:', error);
      setErrorMsg('Ünvan eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleUnvanSil = async (unvanId: string) => {
    try {
      const response = await apiRequest(`/api/v1/data/table/15/rows/${unvanId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        const updatedUnvanlar = unvanlar.filter(unvan => unvan.id !== unvanId);
        setUnvanlar(updatedUnvanlar);
      } else {
        setErrorMsg('Ünvan silinemedi: ' + response.error);
      }
    } catch (error) {
      console.error('Ünvan silme hatası:', error);
      setErrorMsg('Ünvan silinemedi. Lütfen tekrar deneyin.');
    }
  };

  if (!kurum_id || !departman_id || !birim_id) {
    return <div>Yükleniyor, lütfen bekleyin...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
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
  );
};

export default UnvanTanimlama; 