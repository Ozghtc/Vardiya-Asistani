import { useAuthContext } from '../../../../../contexts/AuthContext';
import { useToast } from '../../../../../components/ui/ToastContainer';
import { clearAllCache, clearTableCache } from '../../../../../lib/api';
import { Area, Shift, CurrentUser, AlanOperations } from '../types/AlanTanimla.types';
import { API_CONFIG, vardiyalar } from '../constants/alanConstants';
import { resetFormData, resetToInitialState, validateAreaForm, validateShiftSettings, validateShiftAddition } from '../utils/alanHelpers';
import { getRemainingWorkDays } from '../utils/alanCalculations';

export const useAlanOperations = (
  // State values
  name: string,
  description: string,
  selectedColor: string,
  areas: Area[],
  selectedDays: string[],
  dayHours: any,
  dailyWorkHours: number,
  selectedShift: string,
  selectedShiftDays: string[],
  isProcessing: boolean,
  
  // State setters
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>,
  setShowShiftSettings: (show: boolean) => void,
  setShowShiftAddition: (show: boolean) => void,
  setSelectedShiftDays: (days: string[]) => void,
  setIsSaving: (saving: boolean) => void,
  setIsProcessing: (processing: boolean) => void,
  setHasShownCompletionToast: (shown: boolean) => void,
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  setDescription: (description: string) => void,
  setSelectedColor: (color: string) => void,
  setSelectedDays: (days: string[]) => void,
  setDailyWorkHours: (hours: number) => void,
  setDayHours: (dayHours: any) => void,
  setSelectedShift: (shift: string) => void
): AlanOperations => {
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const getCurrentUser = (): CurrentUser | null => {
    if (!user) return null;
    return {
      id: user.id,
      kurum_id: user.kurum_id,
      departman_id: user.departman_id,
      birim_id: user.birim_id
    };
  };

  const handleAddArea = () => {
    if (isProcessing) {
      alert('İşlem devam ediyor, lütfen bekleyin!');
      return;
    }

    const validationError = validateAreaForm(name, selectedColor);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsProcessing(true);
    
    const newArea: Area = {
      id: Date.now().toString(),
      name: name.trim(),
      color: selectedColor,
      description: description.trim(),
      dailyHours: dailyWorkHours,
      activeDays: [...selectedDays],
      dayHours: { ...dayHours },
      shifts: []
    };

    setAreas([...areas, newArea]);
    setShowShiftSettings(true);
    
    // Form reset
    resetFormData(handleNameChange, setDescription, setSelectedColor);
    
    setIsProcessing(false);
  };

  const handleAddShiftSettings = () => {
    if (isProcessing) {
      alert('İşlem devam ediyor, lütfen bekleyin!');
      return;
    }

    const validationError = validateShiftSettings(selectedDays);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsProcessing(true);

    // Son eklenen alanı güncelle
    setAreas((prevAreas: Area[]) => {
      const updatedAreas = [...prevAreas];
      if (updatedAreas.length > 0) {
        const lastArea = updatedAreas[updatedAreas.length - 1];
        lastArea.activeDays = [...selectedDays];
        lastArea.dayHours = { ...dayHours };
        lastArea.dailyHours = dailyWorkHours;
        lastArea.shifts = [];
      }
      return updatedAreas;
    });

    setShowShiftAddition(true);
    setSelectedShiftDays([...selectedDays]);
    
    setIsProcessing(false);
  };

  const handleAddShift = () => {
    if (isProcessing) {
      alert('İşlem devam ediyor, lütfen bekleyin!');
      return;
    }

    const validationError = validateShiftAddition(selectedShiftDays);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsProcessing(true);

    const shift = vardiyalar.find(v => v.name === selectedShift);
    if (!shift) {
      setIsProcessing(false);
      return;
    }

    const newShift: Shift = {
      id: Date.now().toString(),
      name: shift.name,
      hours: shift.hours,
      duration: shift.duration,
      days: [...selectedShiftDays]
    };

    // Son eklenen alana vardiyayı ekle
    setAreas((prevAreas: Area[]) => {
      const updatedAreas = [...prevAreas];
      if (updatedAreas.length > 0) {
        const lastArea = updatedAreas[updatedAreas.length - 1];
        lastArea.shifts = [...lastArea.shifts, newShift];
      }
      return updatedAreas;
    });

    // Kalan mesai saati olan tüm günleri otomatik seç
    const remainingDays = getRemainingWorkDays(selectedDays, dayHours, areas);
    setSelectedShiftDays(remainingDays);
    
    // Toast notification göster
    showToast({
      type: 'success',
      title: 'Vardiya başarıyla eklendi!',
      message: `${shift.name} vardiyası seçilen günlere eklendi.`,
      duration: 3000
    });
    
    setIsProcessing(false);
  };

  const handleSaveToDatabase = async (): Promise<void> => {
    if (areas.length === 0 || isProcessing) {
      if (isProcessing) {
        alert('İşlem devam ediyor, lütfen bekleyin!');
        return;
      }
      alert('Kaydedilecek alan bulunamadı!');
      return;
    }

    const currentUser = getCurrentUser();
    
    // KURAL 18: User bilgileri zorunlu - hard-coded fallback'ler kaldırıldı
    if (!currentUser || !currentUser.kurum_id || !currentUser.departman_id || !currentUser.birim_id) {
      alert('Kullanıcı bilgileri eksik. Lütfen sayfayı yenileyin.');
      setIsSaving(false);
      setIsProcessing(false);
      return;
    }

    // 3-Layer API Authentication zorunlu
    if (!API_CONFIG.apiKey || !API_CONFIG.userEmail || !API_CONFIG.projectPassword) {
      alert('API ayarları eksik. Lütfen sistem yöneticisine başvurun.');
      setIsSaving(false);
      setIsProcessing(false);
      return;
    }

    setIsSaving(true);
    setIsProcessing(true);
    
    try {
      const area = areas[areas.length - 1];
      
      const data = {
        alan_adi: area.name,
        renk: area.color,
        aciklama: area.description,
        gunluk_saatler: JSON.stringify(area.dayHours),
        aktif_gunler: JSON.stringify(area.activeDays),
        vardiyalar: JSON.stringify(area.shifts),
        kullanici_id: currentUser?.id,
        kurum_id: currentUser?.kurum_id,
        departman_id: currentUser?.departman_id,
        birim_id: currentUser?.birim_id
      };

      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/18/rows',
          method: 'POST',
          body: data,
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Cache temizle ve veri yenile
        clearTableCache('18');
        clearAllCache();
        
        // Toast notification göster
        showToast({
          type: 'success',
          title: 'Alan başarıyla kaydedildi!',
          message: 'Tüm günlere vardiya başarılı bir şekilde eklendi.',
          duration: 4000
        });
        
        // Sayfayı eski haline döndür
        resetToInitialState(
          setAreas,
          setShowShiftSettings,
          setShowShiftAddition,
          setSelectedDays,
          setDayHours,
          setDailyWorkHours,
          setSelectedShiftDays,
          setSelectedShift
        );
      } else {
        let errorMessage = 'Bilinmeyen hata';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'API hatası';
          console.error('❌ API Hatası:', errorData);
        } catch (parseError) {
          console.error('❌ Response parse hatası:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // Hata toast notification'ı göster
        showToast({
          type: 'error',
          title: 'Kaydetme hatası!',
          message: errorMessage,
          duration: 5000
        });
      }
    } catch (error: any) {
      console.error('🚨 Kaydetme hatası:', error);
      let errorMessage = 'Bilinmeyen hata';
      
      if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
        errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
      } else if (error?.name === 'AbortError') {
        errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      } else {
        errorMessage = error?.message || 'Bilinmeyen hata';
      }
      
      // Hata toast notification'ı göster
      showToast({
        type: 'error',
        title: 'Kaydetme hatası!',
        message: `Kaydetme sırasında bir hata oluştu: ${errorMessage}`,
        duration: 5000
      });
    } finally {
      setIsSaving(false);
      setIsProcessing(false);
    }
  };

  return {
    handleAddArea,
    handleAddShiftSettings,
    handleAddShift,
    handleSaveToDatabase
  };
}; 