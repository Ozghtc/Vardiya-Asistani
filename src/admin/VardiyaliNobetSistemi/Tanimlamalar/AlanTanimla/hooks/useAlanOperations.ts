import { useCallback } from 'react';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { useToast } from '../../../../../components/ui/ToastContainer';
import { clearAllCache, clearTableCache } from '../../../../../lib/api';
import { Area, Shift } from '../types/AlanTanimla.types';
import { API_CONFIG, vardiyalar, weekDays } from '../constants/alanConstants';
import { resetFormState, resetToInitialState } from '../utils/alanHelpers';

interface UseAlanOperationsProps {
  // State values
  name: string;
  description: string;
  selectedColor: string;
  areas: Area[];
  selectedDays: string[];
  dayHours: any;
  dailyWorkHours: number;
  selectedShift: string;
  selectedShiftDays: string[];
  isProcessing: boolean;
  
  // State setters
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
  setShowShiftSettings: (value: boolean) => void;
  setShowShiftAddition: (value: boolean) => void;
  setSelectedShiftDays: React.Dispatch<React.SetStateAction<string[]>>;
  setIsSaving: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  setHasShownCompletionToast: (value: boolean) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDescription: (value: string) => void;
  setSelectedColor: (value: string) => void;
  setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
  setDailyWorkHours: (value: number) => void;
  setDayHours: any;
  setSelectedShift: (value: string) => void;
}

export const useAlanOperations = (props: UseAlanOperationsProps) => {
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const handleAddArea = useCallback(() => {
    if (!props.name.trim() || !props.selectedColor || props.isProcessing) {
      if (props.isProcessing) {
        alert('İşlem devam ediyor, lütfen bekleyin!');
        return;
      }
      alert('Lütfen alan adı ve renk seçin!');
      return;
    }

    props.setIsProcessing(true);
    
    const newArea: Area = {
      id: Date.now().toString(),
      name: props.name.trim(),
      color: props.selectedColor,
      description: props.description.trim(),
      dailyHours: props.dailyWorkHours,
      activeDays: [...props.selectedDays],
      dayHours: { ...props.dayHours },
      shifts: []
    };

    props.setAreas([...props.areas, newArea]);
    props.setShowShiftSettings(true);
    
    // Form reset
    props.handleNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    props.setDescription('');
    props.setSelectedColor('');
    
    props.setIsProcessing(false);
  }, [props]);

  const handleAddShiftSettings = useCallback(() => {
    if (props.selectedDays.length === 0 || props.isProcessing) {
      if (props.isProcessing) {
        alert('İşlem devam ediyor, lütfen bekleyin!');
        return;
      }
      alert('Lütfen en az bir gün seçin!');
      return;
    }

    props.setIsProcessing(true);

    // Son eklenen alanı güncelle
    props.setAreas(prevAreas => {
      const updatedAreas = [...prevAreas];
      if (updatedAreas.length > 0) {
        const lastArea = updatedAreas[updatedAreas.length - 1];
        lastArea.activeDays = [...props.selectedDays];
        lastArea.dayHours = { ...props.dayHours };
        lastArea.dailyHours = props.dailyWorkHours;
        lastArea.shifts = [];
      }
      return updatedAreas;
    });

    props.setShowShiftAddition(true);
    props.setSelectedShiftDays([...props.selectedDays]);
    
    props.setIsProcessing(false);
  }, [props]);

  const handleAddShift = useCallback(() => {
    if (props.selectedShiftDays.length === 0 || props.isProcessing) {
      if (props.isProcessing) {
        alert('İşlem devam ediyor, lütfen bekleyin!');
        return;
      }
      alert('Lütfen en az bir gün seçin!');
      return;
    }

    props.setIsProcessing(true);

    const shift = vardiyalar.find(v => v.name === props.selectedShift);
    if (!shift) {
      props.setIsProcessing(false);
      return;
    }

    const newShift: Shift = {
      id: Date.now().toString(),
      name: shift.name,
      hours: shift.hours,
      duration: shift.duration,
      days: [...props.selectedShiftDays]
    };

    // Son eklenen alana vardiyayı ekle
    props.setAreas(prevAreas => {
      const updatedAreas = [...prevAreas];
      if (updatedAreas.length > 0) {
        const lastArea = updatedAreas[updatedAreas.length - 1];
        lastArea.shifts = [...lastArea.shifts, newShift];
      }
      return updatedAreas;
    });

    // Toast notification göster
    showToast({
      type: 'success',
      title: 'Vardiya başarıyla eklendi!',
      message: `${shift.name} vardiyası seçilen günlere eklendi.`,
      duration: 3000
    });
    
    props.setIsProcessing(false);
  }, [props, showToast]);

  const handleSaveToDatabase = useCallback(async () => {
    if (props.areas.length === 0 || props.isProcessing) {
      if (props.isProcessing) {
        alert('İşlem devam ediyor, lütfen bekleyin!');
        return;
      }
      alert('Kaydedilecek alan bulunamadı!');
      return;
    }

    // User bilgileri kontrolü
    if (!user || !user.kurum_id || !user.departman_id || !user.birim_id) {
      alert('Kullanıcı bilgileri eksik. Lütfen sayfayı yenileyin.');
      props.setIsSaving(false);
      props.setIsProcessing(false);
      return;
    }

    // API configuration kontrolü
    if (!API_CONFIG.apiKey || !API_CONFIG.userEmail || !API_CONFIG.projectPassword) {
      alert('API ayarları eksik. Lütfen sistem yöneticisine başvurun.');
      props.setIsSaving(false);
      props.setIsProcessing(false);
      return;
    }

    props.setIsSaving(true);
    props.setIsProcessing(true);
    
    try {
      const area = props.areas[props.areas.length - 1];
      
      const data = {
        alan_adi: area.name,
        renk: area.color,
        aciklama: area.description,
        gunluk_saatler: JSON.stringify(area.dayHours),
        aktif_gunler: JSON.stringify(area.activeDays),
        vardiyalar: JSON.stringify(area.shifts),
        kullanici_id: user?.id,
        kurum_id: user?.kurum_id,
        departman_id: user?.departman_id,
        birim_id: user?.birim_id
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
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (response.ok) {
        clearTableCache('18');
        clearAllCache();
        
        showToast({
          type: 'success',
          title: 'Alan başarıyla kaydedildi!',
          message: 'Tüm günlere vardiya başarılı bir şekilde eklendi.',
          duration: 4000
        });
        
        // Reset to initial state
        const resetState = resetToInitialState();
        props.setAreas(resetState.areas);
        props.setShowShiftSettings(resetState.showShiftSettings);
        props.setShowShiftAddition(resetState.showShiftAddition);
        props.setSelectedDays(resetState.selectedDays);
        props.setDayHours(resetState.dayHours);
        props.setDailyWorkHours(resetState.dailyWorkHours);
        props.setSelectedShiftDays(resetState.selectedShiftDays);
        props.setSelectedShift(resetState.selectedShift);
      } else {
        let errorMessage = 'Bilinmeyen hata';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'API hatası';
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        showToast({
          type: 'error',
          title: 'Kaydetme hatası!',
          message: errorMessage,
          duration: 5000
        });
      }
    } catch (error: any) {
      let errorMessage = 'Bilinmeyen hata';
      
      if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
        errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
      } else if (error?.name === 'AbortError') {
        errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      } else {
        errorMessage = error?.message || 'Bilinmeyen hata';
      }
      
      showToast({
        type: 'error',
        title: 'Kaydetme hatası!',
        message: `Kaydetme sırasında bir hata oluştu: ${errorMessage}`,
        duration: 5000
      });
    } finally {
      props.setIsSaving(false);
      props.setIsProcessing(false);
    }
  }, [props, user, showToast]);

  return {
    handleAddArea,
    handleAddShiftSettings,
    handleAddShift,
    handleSaveToDatabase
  };
}; 