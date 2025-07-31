// Kurum CRUD Operations Service
import { 
  getKurumlar, 
  addKurum, 
  updateKurum, 
  deleteKurum, 
  clearAllCache, 
  clearTableCache
} from '../../../lib/api';
import { Kurum, KurumCrudResult } from '../types/KurumManagement.types';
import { 
  validateKurumForm, 
  formatKurumDataForAPI, 
  showSuccessMessage, 
  showErrorMessage 
} from '../utils/kurumHelpers';

export class KurumCrudOperations {
  // Get all kurumlar
  static async getAllKurumlar(forceRefresh = false): Promise<Kurum[]> {
    try {
      return await getKurumlar(forceRefresh);
    } catch (error: any) {
      console.error('Kurumlar yüklenirken hata:', error);
      throw new Error('Kurumlar yüklenirken hata oluştu: ' + error.message);
    }
  }

  // Add new kurum
  static async createKurum(
    formData: any,
    setSuccessMsg: (msg: string) => void,
    setErrorMsg: (msg: string) => void
  ): Promise<KurumCrudResult> {
    try {
      // Validate form
      const validationError = validateKurumForm(formData);
      if (validationError) {
        showErrorMessage(validationError, setErrorMsg);
        return { success: false, message: validationError };
      }

      // Format data for API
      const kurumData = formatKurumDataForAPI(formData);
      
      // Send to API
      const response = await addKurum(kurumData);
      
      if (response.success) {
        showSuccessMessage('Kurum başarıyla kaydedildi!', setSuccessMsg);
        
        // Clear cache
        clearTableCache('30');
        clearAllCache();
        
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Kurum kaydedilemedi';
        showErrorMessage(errorMsg, setErrorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = `Kurum kaydedilirken hata oluştu: ${error.message}`;
      showErrorMessage(errorMsg, setErrorMsg);
      return { success: false, message: errorMsg };
    }
  }

  // Test API connection
  static async testApiConnection(
    setSuccessMsg: (msg: string) => void,
    setErrorMsg: (msg: string) => void
  ): Promise<KurumCrudResult> {
    try {
      // Test API by trying to get kurumlar
      await getKurumlar();
      showSuccessMessage('API bağlantısı başarılı!', setSuccessMsg);
      return { success: true };
    } catch (error: any) {
      showErrorMessage('API bağlantısı başarısız!', setErrorMsg);
      return { success: false, message: error.message };
    }
  }
} 