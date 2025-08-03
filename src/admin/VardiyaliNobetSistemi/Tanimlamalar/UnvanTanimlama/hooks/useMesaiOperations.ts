import { useState } from 'react';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { addTableData, deleteTableData, clearTableCache, clearAllCache } from '../../../../../lib/api';
import API_CONFIG from '../../../../../lib/api';
import { KaydedilenMesai, MesaiFormData, MesaiOperations } from '../types/UnvanTanimlama.types';
import { isDuplicateUnvan, isDuplicateMesaiSaati, createParentId, matchesUserContext } from '../utils/unvanHelpers';

export const useMesaiOperations = (
  kaydedilenMesaiTurleri: KaydedilenMesai[],
  setKaydedilenMesaiTurleri: React.Dispatch<React.SetStateAction<KaydedilenMesai[]>>,
  showSuccessToast: (message: string) => void,
  showErrorToast: (message: string) => void,
  loadMesaiTurleri: () => Promise<void>
): { handleMesaiEkle: (mesaiData: MesaiFormData) => Promise<void>; handleMesaiTuruSil: (mesaiId: number) => Promise<void> } => {
  const { user } = useAuthContext();



  const handleMesaiEkle = async (mesaiData: MesaiFormData): Promise<void> => {
    if (!mesaiData.mesaiAdi.trim()) {
      showErrorToast('Mesai adı gereklidir!');
      return;
    }

    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
      showErrorToast('Kullanıcı bilgileri eksik!');
      return;
    }

    try {
      // Fresh data ile duplicate kontrolü
      clearAllCache();
      clearTableCache('73');
      
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/73',
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
      let mesaiArray: any[] = [];
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        mesaiArray = data.data.rows.filter((mesai: any) => 
          matchesUserContext(mesai, user)
        );
      }
      
      // Duplicate kontrol
      if (isDuplicateUnvan(mesaiArray, mesaiData.mesaiAdi, 'mesai_adi')) {
        showErrorToast(`"${mesaiData.mesaiAdi}" mesai türü zaten mevcut. Aynı mesai türü tekrar eklenemez.`);
        return;
      }
      
      if (isDuplicateMesaiSaati(mesaiArray, mesaiData.mesaiSaati)) {
        showErrorToast(`${mesaiData.mesaiSaati} saatlik mesai türü zaten mevcut. Aynı mesai saati tekrar eklenemez.`);
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
            type: 'MESAI',
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

      const mesaiId = idResult.data.generated_id; // "6_D1_B1-MESAI-001"

      const newMesaiData = {
        mesai_id: mesaiId,
        mesai_adi: mesaiData.mesaiAdi.trim(),
        gunler: JSON.stringify(['Haftalık']),
        mesai_saati: parseInt(mesaiData.mesaiSaati.toString()),
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id,
        aktif_mi: true
      };

      const result = await addTableData('73', newMesaiData);
      
      if (result.success) {
        console.log('✅ Mesai başarıyla kaydedildi');
        
        // Fresh data çek
        await loadMesaiTurleri();
        
        showSuccessToast('Mesai türü başarıyla kaydedildi!');
      } else {
        console.error('❌ Mesai kaydetme hatası:', result.error);
        showErrorToast('Mesai türü kaydedilemedi: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('🚨 Mesai kaydetme hatası:', error);
      showErrorToast('Mesai türü kaydedilirken hata oluştu');
    }
  };

  const handleMesaiTuruSil = async (mesaiId: number): Promise<void> => {
    if (!confirm('Bu mesai türünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      console.log('🗑️ Mesai türü siliniyor:', mesaiId);
      
      clearTableCache('73');
      
      const result = await deleteTableData('73', mesaiId.toString());
      
      if (result.success) {
        console.log('✅ Mesai türü başarıyla silindi');
        
        clearAllCache();
        await loadMesaiTurleri();
        
        showSuccessToast('Mesai türü başarıyla silindi!');
      } else {
        console.error('❌ Silme API Hatası:', result.error);
        showErrorToast('Mesai türü silinemedi: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('🚨 Mesai türü silme hatası:', error);
      showErrorToast('Mesai türü silinirken hata oluştu');
    }
  };

  return {
    handleMesaiEkle,
    handleMesaiTuruSil
  };
}; 