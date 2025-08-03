import { useState } from 'react';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { addTableData, deleteTableData, clearTableCache, clearAllCache } from '../../../../../lib/api';
import API_CONFIG from '../../../../../lib/api';
import { Unvan, UnvanFormData, UnvanOperations } from '../types/UnvanTanimlama.types';
import { isDuplicateUnvan, createParentId, matchesUserContext } from '../utils/unvanHelpers';

export const useUnvanOperations = (
  unvanlar: Unvan[],
  setUnvanlar: React.Dispatch<React.SetStateAction<Unvan[]>>,
  showSuccessToast: (message: string) => void,
  showErrorToast: (message: string) => void
): UnvanOperations => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnvanEkle = async (unvanData: UnvanFormData): Promise<void> => {
    if (!unvanData.yeniUnvan.trim()) {
      setError('Ünvan adı gereklidir');
      return;
    }

    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      // KURAL 17: Fresh data ile duplicate kontrolü
      clearAllCache();
      clearTableCache('69');
      
      // Fresh data al
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/69',
          method: 'GET',
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      let unvanArray: any[] = [];
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        unvanArray = data.data.rows.filter((unvan: any) => 
          matchesUserContext(unvan, user)
        );
      }
      
      // Duplicate kontrol
      if (isDuplicateUnvan(unvanArray, unvanData.yeniUnvan)) {
        setError(`"${unvanData.yeniUnvan}" ünvanı zaten mevcut. Aynı ünvan tekrar eklenemez.`);
        return;
      }
      
      // KURAL 18: ID üretimi backend'e taşındı - Sequential ID Generation API
      const parent_id = createParentId(user.kurum_id, user.departman_id, user.birim_id);
      
      const idResponse = await fetch(
        'https://hzmbackendveritabani-production.up.railway.app/api/v1/admin/generate-sequential-id',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_HZM_API_KEY,
            'X-User-Email': import.meta.env.VITE_HZM_USER_EMAIL,
            'X-Project-Password': import.meta.env.VITE_HZM_PROJECT_PASSWORD
          },
          body: JSON.stringify({
            type: 'UNVAN',
            parent_id: parent_id,
            padding: 3
          })
        }
      );

      if (!idResponse.ok) {
        throw new Error('ID generation failed');
      }

      const idResult = await idResponse.json();
      if (!idResult.success) {
        throw new Error(idResult.message || 'ID generation failed');
      }

      const unvanId = idResult.data.generated_id; // "6_D1_B1-UNVAN-001"

      const newUnvan = {
        unvan_id: unvanId,
        unvan_adi: unvanData.yeniUnvan.trim(),
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id,
        aktif_mi: true
      };

      const result = await addTableData('69', newUnvan);

      if (result.success) {
        // Fresh data yeniden yükle
        clearAllCache();
        clearTableCache('69');
        
        const reloadResponse = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/69',
            method: 'GET',
            apiKey: API_CONFIG.apiKey,
            userEmail: API_CONFIG.userEmail,
            projectPassword: API_CONFIG.projectPassword
          })
        });

        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          if (reloadData.success && reloadData.data && Array.isArray(reloadData.data.rows)) {
            const filteredUnvanlar = reloadData.data.rows.filter((unvan: any) => 
              matchesUserContext(unvan, user)
            );
            setUnvanlar(filteredUnvanlar);
          }
        }
        
        setError(null);
        showSuccessToast('Ünvan başarıyla eklendi!');
      } else {
        setError('Ünvan eklenemedi: ' + result.error);
        showErrorToast('Ünvan eklenemedi: ' + result.error);
      }
    } catch (error) {
      console.error('Ünvan ekleme hatası:', error);
      const errorMessage = 'Ünvan eklenemedi. Lütfen tekrar deneyin.';
      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  const handleUnvanSil = async (unvanId: number): Promise<void> => {
    try {
      const result = await deleteTableData('69', unvanId.toString());

      if (result.success && user) {
        clearAllCache();
        clearTableCache('69');
        
        // Fresh data yeniden yükle
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/69',
            method: 'GET',
            apiKey: API_CONFIG.apiKey,
            userEmail: API_CONFIG.userEmail,
            projectPassword: API_CONFIG.projectPassword
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data.rows)) {
            const filteredUnvanlar = data.data.rows.filter((unvan: any) => 
              matchesUserContext(unvan, user)
            );
            setUnvanlar(filteredUnvanlar);
          }
        }
        
        showSuccessToast('Ünvan başarıyla silindi!');
      } else {
        const errorMessage = 'Ünvan silinemedi: ' + result.error;
        setError(errorMessage);
        showErrorToast(errorMessage);
      }
    } catch (error) {
      console.error('Ünvan silme hatası:', error);
      const errorMessage = 'Ünvan silinemedi. Lütfen tekrar deneyin.';
      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  return {
    handleUnvanEkle,
    handleUnvanSil,
    loading,
    error
  };
}; 