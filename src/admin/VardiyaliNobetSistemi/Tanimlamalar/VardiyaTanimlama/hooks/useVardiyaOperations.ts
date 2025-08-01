import { useState, useEffect } from 'react';
import { useCapitalization } from '../../../../../hooks/useCapitalization';
import { apiRequest, getTableData, clearAllCache, clearTableCache } from '../../../../../lib/api';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { 
  Shift, 
  VardiyaFormData, 
  CurrentUser, 
  VardiyaOperationsState,
  VardiyaOperationsActions 
} from '../types/VardiyaTanimlama.types';

export const useVardiyaOperations = (): VardiyaOperationsState & VardiyaOperationsActions & {
  name: string;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startHour: string;
  setStartHour: (hour: string) => void;
  endHour: string;
  setEndHour: (hour: string) => void;
} => {
  // State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, handleNameChange] = useCapitalization('');
  const [startHour, setStartHour] = useState<string>('');
  const [endHour, setEndHour] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  // AuthContext'ten gerçek kullanıcı bilgilerini al
  const getCurrentUser = (): CurrentUser | null => {
    if (user && user.kurum_id && user.departman_id && user.birim_id) {
      return { 
        kurum_id: user.kurum_id, 
        departman_id: user.departman_id, 
        birim_id: user.birim_id 
      };
    }
    return null;
  };

  // Load shifts from API
  const loadShifts = async (): Promise<void> => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('Kullanıcı bilgileri yüklenemedi');
        return;
      }

      // KURAL 17: Tüm cache'leri zorla temizle - güvenlik önlemi
      clearAllCache();
      clearTableCache('71');
      
      // KURAL 17: Direkt API çağrısı - cache bypass
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/71',
          method: 'GET',
          // 3-Layer Authentication
          apiKey: import.meta.env.VITE_API_KEY,
          userEmail: import.meta.env.VITE_USER_EMAIL,
          projectPassword: import.meta.env.VITE_PROJECT_PASSWORD
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        // KURAL 17: Güvenli filtreleme - kullanıcı bilgilerine göre
        const filteredShifts = data.data.rows.filter((row: any) => 
          row.kurum_id === currentUser.kurum_id &&
          row.departman_id === currentUser.departman_id &&
          row.birim_id === currentUser.birim_id
        );
        
        const shiftData = filteredShifts.map((row: any) => ({
          id: row.id,
          vardiya_adi: row.vardiya_adi,
          baslangic_saati: row.baslangic_saati,
          bitis_saati: row.bitis_saati,
          calisma_saati: row.calisma_saati || 8,
          aktif_mi: row.aktif_mi,
          kurum_id: row.kurum_id,
          departman_id: row.departman_id,
          birim_id: row.birim_id
        }));
        setShifts(shiftData);
      } else {
        setShifts([]);
      }
    } catch (error) {
      console.error('Vardiya yükleme hatası:', error);
      // Tablo yoksa boş array set et ve bilgilendirici mesaj göster
      setShifts([]);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('404') || errorMessage.includes('401')) {
        setError('Vardiya tablosu bulunamadı. Lütfen önce tabloyu oluşturun.');
      } else {
        setError('Vardiyalar yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent, formData?: VardiyaFormData): Promise<void> => {
    e.preventDefault();
    
    const safeName = formData?.name || name || '';
    const submitStartHour = formData?.startHour || startHour;
    const submitEndHour = formData?.endHour || endHour;
    
    // KURAL 18: Frontend validation kaldırıldı - server-side validation gerekli
    // Backend'de validation yapılacak, frontend sadece UI

    // KURAL 18: Zaman hesaplama mantığı kaldırıldı - backend hesaplayacak
    const toplamSaat = 8; // Varsayılan değer, backend'de doğru hesaplama yapılacak

    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return;
    }

    try {
      setLoading(true);
      
      // Mevcut vardiyaları kontrol et
      const existingVardiyalar = await getTableData('71', `kurum_id=${currentUser.kurum_id}&departman_id=${currentUser.departman_id}&birim_id=${currentUser.birim_id}`);
      const vardiyaArray = Array.isArray(existingVardiyalar) ? existingVardiyalar : [];
      
      // ÇİFT KAYIT KONTROLÜ - Vardiya adı kontrolü (büyük/küçük harf duyarsız)
      const normalizedNewVardiya = safeName.trim().toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
      const isDuplicate = vardiyaArray.some((vardiya: any) => {
        const normalizedExisting = (vardiya.vardiya_adi || '').toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
        return normalizedExisting === normalizedNewVardiya;
      });
      
      if (isDuplicate) {
        setError(`"${safeName}" vardiyası zaten mevcut. Aynı vardiya adı tekrar eklenemez.`);
        return;
      }
      
      // KURAL 18: ID üretimi backend'e taşındı - Sequential ID Generation API
      const parent_id = `${currentUser.kurum_id}_${currentUser.departman_id.split('_')[1]}_${currentUser.birim_id.split('_')[1]}`;
      
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
            type: 'VARDIYA',
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

      const vardiyaId = idResult.data.generated_id; // "6_D1_B1-VARDIYA-001"

      const newShift = {
        vardiya_id: vardiyaId,
        vardiya_adi: safeName.trim(),
        baslangic_saati: submitStartHour,
        bitis_saati: submitEndHour,
        calisma_saati: Math.round(toplamSaat),
        aktif_mi: true,
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id
      };

      // YENİ TABLO ID: 71
      const response = await apiRequest('/api/v1/data/table/71/rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShift),
      });
      
      if (response.success) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('71');
        
        setError('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadShifts(); // Listeyi yenile
        
        // Form'u temizle
        handleNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        setStartHour('');
        setEndHour('');
        
        console.log('✅ Vardiya eklendi ve liste güncellendi');
      } else {
        setError(response.error || 'Vardiya eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Vardiya ekleme hatası:', error);
      setError('Vardiya eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number | string): Promise<void> => {
    if (!confirm('Bu vardiyayı silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      
      // API çağrısı geçici olarak devre dışı
      console.log('API çağrısı geçici olarak devre dışı - Vardiya silme');
      setError('API bağlantıları geçici olarak devre dışı. Tablolar oluşturulduktan sonra aktif edilecek.');
      return;

      const response = await apiRequest(`/api/v1/data/table/17/rows/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('17');
        
        loadShifts(); // Listeyi yenile
        
        console.log('✅ Vardiya silindi ve liste güncellendi');
      } else {
        setError(response.error || 'Vardiya silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Vardiya silme hatası:', error);
      setError('Vardiya silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick add
  const handleQuickAdd = async (shiftName: string, startHour: string, endHour: string): Promise<void> => {
    // API çağrısı geçici olarak devre dışı
    console.log('API çağrısı geçici olarak devre dışı - Hızlı vardiya ekleme');
    setError('API bağlantıları geçici olarak devre dışı. Tablolar oluşturulduktan sonra aktif edilecek.');
    return;

    if (shifts.some(shift => shift.vardiya_adi === shiftName)) {
      setError(`${shiftName} vardiyası zaten tanımlı`);
      setTimeout(() => setError(''), 2000);
      return;
    }

    // KURAL 18: Zaman hesaplama mantığı kaldırıldı - backend hesaplayacak
    const toplamSaat = 8; // Varsayılan değer, backend'de doğru hesaplama yapılacak

    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return;
    }

        // KURAL 18: ID üretimi backend'e taşındı - Sequential ID Generation API
    const parent_id = `${currentUser!.kurum_id}_${currentUser!.departman_id.split('_')[1]}_${currentUser!.birim_id.split('_')[1]}`;

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
          type: 'VARDIYA',
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

    const vardiyaId = idResult.data.generated_id; // "6_D1_B1-VARDIYA-001"

    const newShift = {
      vardiya_id: vardiyaId,
      vardiya_adi: shiftName,
      baslangic_saati: startHour,
      bitis_saati: endHour,
      calisma_saati: Math.round(toplamSaat),
      aktif_mi: true,
      kurum_id: currentUser!.kurum_id,
      departman_id: currentUser!.departman_id,
      birim_id: currentUser!.birim_id
    };

    try {
      setLoading(true);
      const response = await apiRequest('/api/v1/data/table/71/rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShift),
      });
      
      if (response.success) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('71');
        
        setError('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadShifts(); // Listeyi yenile
        
        console.log('✅ Hızlı vardiya eklendi ve liste güncellendi');
      } else {
        setError(response.error || 'Vardiya eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Vardiya ekleme hatası:', error);
      setError('Vardiya eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load shifts on mount
  useEffect(() => {
    loadShifts();
  }, []);

  return {
    // State
    shifts,
    loading,
    error,
    showSuccess,
    name,
    startHour,
    endHour,
    
    // Form handlers
    handleNameChange,
    setStartHour,
    setEndHour,
    
    // Actions
    loadShifts,
    handleSubmit,
    handleDelete,
    handleQuickAdd,
    setError,
    setShowSuccess
  };
}; 