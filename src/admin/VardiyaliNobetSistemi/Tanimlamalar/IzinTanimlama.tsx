import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { SuccessNotification } from '../../../components/ui/Notification';
import { useDepartmanBirim } from './DepartmanBirimContext';
import { apiRequest } from '../../../lib/api';

interface IzinIstek {
  id: string;
  izin_turu: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

const IzinTanimlama: React.FC = () => {
  const [personnelRequest, handlePersonnelRequestChange] = useCapitalization('');
  const [personnelRequests, setPersonnelRequests] = useState<IzinIstek[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { kurum_id, departman_id, birim_id } = useDepartmanBirim();

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
    if (!personnelRequest.trim()) return;
    if (!kurum_id || !departman_id || !birim_id) {
      setErrorMsg('Kurum, departman ve birim seçili değil!');
      return;
    }

    try {
      const newIzinIstek = {
        izin_turu: personnelRequest.trim(),
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
        handlePersonnelRequestChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
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
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6 mt-8 flex">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">İzin/İstek Tanımları</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={personnelRequest}
            onChange={handlePersonnelRequestChange}
            placeholder="YENİ İZİN/İSTEK GİRİN"
            className="flex-1 rounded-lg border-gray-300"
          />
          <button
            onClick={handleAddRequest}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {personnelRequests.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{item.izin_turu}</span>
              <button
                onClick={() => handleRemoveRequest(item.id)}
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

export default IzinTanimlama; 