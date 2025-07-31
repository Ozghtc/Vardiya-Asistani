// Kurum CRUD Operations Service
// API çağrıları ve iş mantığı

import { 
  getKurumlar, 
  addKurum, 
  updateKurum, 
  deleteKurum,
  clearAllCache,
  clearTableCache,
  cascadeDeleteKurum
} from '../../../lib/api';
import { 
  Kurum, 
  KurumFormData, 
  EditKurumValues,
  KurumCrudResult 
} from '../types/KurumManagement.types';
import { 
  validateKurumForm, 
  formatKurumDataForAPI, 
  showSuccessMessage, 
  showErrorMessage 
} from '../utils/kurumHelpers';

export class KurumCrudOperations {
  private setKurumlar: React.Dispatch<React.SetStateAction<Kurum[]>>;
  private setDepartmanBirimler: React.Dispatch<React.SetStateAction<any[]>>;
  private setSuccessMsg: (msg: string) => void;
  private setErrorMsg: (msg: string) => void;
  private setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  private setOperationLoading: React.Dispatch<React.SetStateAction<string | null>>;
  private loadKurumlar: (forceRefresh?: boolean) => Promise<void>;

  constructor(
    setKurumlar: React.Dispatch<React.SetStateAction<Kurum[]>>,
    setDepartmanBirimler: React.Dispatch<React.SetStateAction<any[]>>,
    setSuccessMsg: (msg: string) => void,
    setErrorMsg: (msg: string) => void,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setOperationLoading: React.Dispatch<React.SetStateAction<string | null>>,
    loadKurumlar: (forceRefresh?: boolean) => Promise<void>
  ) {
    this.setKurumlar = setKurumlar;
    this.setDepartmanBirimler = setDepartmanBirimler;
    this.setSuccessMsg = setSuccessMsg;
    this.setErrorMsg = setErrorMsg;
    this.setLoading = setLoading;
    this.setOperationLoading = setOperationLoading;
    this.loadKurumlar = loadKurumlar;
  }

  // ═══════════════════════════════════════════
  // KURUM EKLEME
  // ═══════════════════════════════════════════
  async addKurum(formData: KurumFormData): Promise<KurumCrudResult> {
    // Form validasyonu
    const validationError = validateKurumForm(formData);
    if (validationError) {
      showErrorMessage(validationError, this.setErrorMsg);
      return { success: false, message: validationError };
    }

    this.setLoading(true);

    try {
      // API formatına çevir
      const kurumData = formatKurumDataForAPI(formData);
      
      // API'ye gönder
      const response = await addKurum(kurumData);
      
      if (response.success) {
        showSuccessMessage('Kurum başarıyla eklendi!', this.setSuccessMsg);
        
        // Kurum listesini yenile
        await this.loadKurumlar(true);
        
        return { success: true, message: 'Kurum başarıyla eklendi!' };
      } else {
        throw new Error(response.message || 'Kurum eklenemedi');
      }
    } catch (error: any) {
      console.error('❌ Kurum ekleme hatası:', error);
      const errorMessage = `Kurum ekleme hatası: ${error.message}`;
      showErrorMessage(errorMessage, this.setErrorMsg);
      return { success: false, message: errorMessage, error: error.message };
    } finally {
      this.setLoading(false);
    }
  }

  // ═══════════════════════════════════════════
  // KURUM GÜNCELLEME
  // ═══════════════════════════════════════════
  async updateKurum(kurumId: string, updateData: Partial<Kurum>): Promise<KurumCrudResult> {
    this.setOperationLoading(kurumId);

    try {
      const response = await updateKurum(kurumId, updateData);
      
      if (response.success) {
        // State'i güncelle
        this.setKurumlar(prev => prev.map(k => 
          k.id === kurumId ? { ...k, ...updateData } : k
        ));
        
        showSuccessMessage('Kurum başarıyla güncellendi!', this.setSuccessMsg);
        return { success: true, message: 'Kurum başarıyla güncellendi!' };
      } else {
        throw new Error(response.message || 'Kurum güncellenemedi');
      }
    } catch (error: any) {
      console.error('❌ Kurum güncelleme hatası:', error);
      const errorMessage = `Kurum güncelleme hatası: ${error.message}`;
      showErrorMessage(errorMessage, this.setErrorMsg);
      return { success: false, message: errorMessage, error: error.message };
    } finally {
      this.setOperationLoading(null);
    }
  }

  // ═══════════════════════════════════════════
  // KURUM SİLME (CASCADE DELETE)
  // ═══════════════════════════════════════════
  async deleteKurum(kurum: Kurum): Promise<KurumCrudResult> {
    this.setOperationLoading(kurum.id);

    try {
      if (!kurum.kurum_id) {
        throw new Error('Kurum ID bulunamadı');
      }
      
      console.log('🗑️ CASCADE DELETE başlatılıyor - Kurum ID:', kurum.kurum_id);
      
      // CASCADE DELETE fonksiyonunu kullan
      const result = await cascadeDeleteKurum(kurum.kurum_id);
      
      if (result.success) {
        // State'den kaldır
        this.setKurumlar(prev => prev.filter(k => k.id !== kurum.id));
        
        // Related departmanları kaldır
        this.setDepartmanBirimler(prev => prev.filter(d => d.kurum_id !== kurum.id));
        
        showSuccessMessage('✅ Kurum ve ona bağlı tüm veriler başarıyla silindi!', this.setSuccessMsg);
        
        // Cache temizle
        clearAllCache();
        ['30', '33', '34', '35', '69', '70', '71', '72', '73'].forEach(tableId => {
          clearTableCache(tableId);
        });
        
        return { success: true, message: 'Kurum başarıyla silindi!' };
      } else {
        throw new Error(result.error || 'Kurum silinirken hata oluştu');
      }
    } catch (error: any) {
      console.error('❌ CASCADE DELETE hatası:', error);
      const errorMessage = `Kurum silme hatası: ${error.message}`;
      showErrorMessage(errorMessage, this.setErrorMsg);
      return { success: false, message: errorMessage, error: error.message };
    } finally {
      this.setOperationLoading(null);
    }
  }

  // ═══════════════════════════════════════════
  // KURUM AKTİF/PASİF DURUMU DEĞİŞTİRME
  // ═══════════════════════════════════════════
  async toggleActive(kurum: Kurum): Promise<KurumCrudResult> {
    try {
      const response = await updateKurum(kurum.id, { aktif_mi: !kurum.aktif_mi });
      
      if (response.success) {
        // State'i güncelle
        this.setKurumlar(prev => prev.map(k => 
          k.id === kurum.id ? { ...k, aktif_mi: !k.aktif_mi } : k
        ));
        
        const statusText = !kurum.aktif_mi ? 'aktif' : 'pasif';
        showSuccessMessage(`Kurum ${statusText} hale getirildi!`, this.setSuccessMsg);
        
        return { success: true, message: `Kurum ${statusText} hale getirildi!` };
      } else {
        throw new Error(response.message || 'Kurum durumu değiştirilemedi');
      }
    } catch (error: any) {
      console.error('❌ Kurum toggle hatası:', error);
      const errorMessage = `Kurum durumu değiştirilirken hata oluştu: ${error.message}`;
      showErrorMessage(errorMessage, this.setErrorMsg);
      return { success: false, message: errorMessage, error: error.message };
    }
  }

  // ═══════════════════════════════════════════
  // INLINE EDİT KAYDETME
  // ═══════════════════════════════════════════
  async saveInlineEdit(kurumId: string, editValues: EditKurumValues): Promise<KurumCrudResult> {
    // Validation
    if (!editValues.kurum_adi.trim()) {
      showErrorMessage('Kurum adı boş olamaz', this.setErrorMsg);
      return { success: false, message: 'Kurum adı boş olamaz' };
    }

    this.setOperationLoading(kurumId);

    try {
      const response = await updateKurum(kurumId, editValues);
      
      if (response.success) {
        // State'i güncelle
        this.setKurumlar(prev => prev.map(k => 
          k.id === kurumId ? { ...k, ...editValues } : k
        ));
        
        showSuccessMessage('Kurum bilgileri güncellendi!', this.setSuccessMsg);
        return { success: true, message: 'Kurum bilgileri güncellendi!' };
      } else {
        throw new Error(response.message || 'Kurum güncellenemedi');
      }
    } catch (error: any) {
      console.error('❌ Inline edit hatası:', error);
      const errorMessage = `Güncelleme hatası: ${error.message}`;
      showErrorMessage(errorMessage, this.setErrorMsg);
      return { success: false, message: errorMessage, error: error.message };
    } finally {
      this.setOperationLoading(null);
    }
  }

  // ═══════════════════════════════════════════
  // VERİ YENİLEME
  // ═══════════════════════════════════════════
  async refreshData(): Promise<KurumCrudResult> {
    try {
      await this.loadKurumlar(true); // Force refresh
      showSuccessMessage('Veriler yenilendi!', this.setSuccessMsg);
      return { success: true, message: 'Veriler yenilendi!' };
    } catch (error: any) {
      console.error('❌ Veri yenileme hatası:', error);
      const errorMessage = `Veriler yenilenirken hata oluştu: ${error.message}`;
      showErrorMessage(errorMessage, this.setErrorMsg);
      return { success: false, message: errorMessage, error: error.message };
    }
  }

  // ═══════════════════════════════════════════
  // API TEST
  // ═══════════════════════════════════════════
  async testAPIConnection(): Promise<KurumCrudResult> {
    try {
      // API test için kurumlar listesini çekmeyi dene
      await getKurumlar(false);
      showSuccessMessage('API bağlantısı başarılı!', this.setSuccessMsg);
      return { success: true, message: 'API bağlantısı başarılı!' };
    } catch (error: any) {
      console.error('❌ API Test hatası:', error);
      const errorMessage = 'API bağlantısı başarısız!';
      showErrorMessage(errorMessage, this.setErrorMsg);
      return { success: false, message: errorMessage, error: error.message };
    }
  }
} 