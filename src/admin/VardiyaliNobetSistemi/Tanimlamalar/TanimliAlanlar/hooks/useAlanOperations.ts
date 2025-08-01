import { apiRequest, clearAllCache, clearTableCache } from '../../../../../lib/api';
import { AlanOperations } from '../types/TanimliAlanlar.types';
import { TABLE_ID } from '../constants/alanConstants';
import { parseErrorMessage, extractErrorMessage } from '../utils/alanHelpers';

export const useAlanOperations = (
  deleteDialog: { isOpen: boolean; alanId?: number },
  setDeleteDialog: (dialog: { isOpen: boolean; alanId?: number }) => void,
  setLoading: (loading: boolean) => void,
  loadAlanlar: () => Promise<void>
): AlanOperations => {

  const handleDelete = (alanId: number) => {
    // Popup'ı aç
    setDeleteDialog({ isOpen: true, alanId });
  };

  const confirmDelete = async () => {
    const alanId = deleteDialog.alanId;
    if (!alanId) return;

    try {
      setLoading(true);
      
      // Netlify proxy üzerinden silme işlemi - Doğru endpoint
      const result = await apiRequest(`/api/v1/data/table/${TABLE_ID}/rows/${alanId}`, {
        method: 'DELETE'
      });
      
      if (result.success) {
        // Cache temizle ve veri yenile
        clearTableCache(TABLE_ID);
        clearAllCache();
        alert('Alan başarıyla silindi!');
        await loadAlanlar(); // Listeyi yenile
      } else {
        const errorMessage = extractErrorMessage(result);
        alert('Alan silinirken hata oluştu: ' + errorMessage);
      }
    } catch (error: any) {
      const errorMessage = parseErrorMessage(error);
      
      if (error?.message?.includes('Row not found')) {
        loadAlanlar(); // Listeyi yenile
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setDeleteDialog({ isOpen: false }); // Popup'ı kapat
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false });
  };

  // loadAlanlar fonksiyonu zaten useTanimliAlanlar hook'undan geliyor
  const loadAlanlarWrapper = async () => {
    await loadAlanlar();
  };

  return {
    loadAlanlar: loadAlanlarWrapper,
    handleDelete,
    confirmDelete,
    cancelDelete
  };
}; 