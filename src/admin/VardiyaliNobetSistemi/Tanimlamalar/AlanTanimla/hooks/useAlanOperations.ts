import { useCallback } from 'react';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { clearAllCache, clearTableCache } from '../../../../../lib/api';
import { Area, Shift } from '../types/AlanTanimla.types';
import { API_CONFIG } from '../constants/alanConstants';
import { generateId } from '../utils/alanHelpers';

interface UseAlanOperationsProps {
  areas: Area[];
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
  setIsSaving: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  setUsedColors: React.Dispatch<React.SetStateAction<string[]>>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const useAlanOperations = ({
  areas,
  setAreas,
  setIsSaving,
  setIsProcessing,
  setUsedColors,
  showToast
}: UseAlanOperationsProps) => {
  
  const { user } = useAuthContext();
  
  const addArea = useCallback((newArea: Omit<Area, 'id'>) => {
    const area: Area = {
      ...newArea,
      id: generateId()
    };
    
    setAreas(prevAreas => [...prevAreas, area]);
    setUsedColors(prevColors => [...prevColors, area.color]);
  }, [setAreas, setUsedColors]);
  
  const removeArea = useCallback((areaId: string) => {
    setAreas(prevAreas => {
      const updatedAreas = prevAreas.filter(area => area.id !== areaId);
      const updatedColors = updatedAreas.map(area => area.color);
      setUsedColors(updatedColors);
      return updatedAreas;
    });
  }, [setAreas, setUsedColors]);
  
  const addShiftToArea = useCallback((areaId: string, shift: Shift) => {
    setAreas(prevAreas => 
      prevAreas.map(area => 
        area.id === areaId 
          ? { ...area, shifts: [...area.shifts, shift] }
          : area
      )
    );
  }, [setAreas]);
  
  const removeShiftFromArea = useCallback((areaId: string, shiftId: string) => {
    setAreas(prevAreas => 
      prevAreas.map(area => 
        area.id === areaId 
          ? { ...area, shifts: area.shifts.filter(shift => shift.id !== shiftId) }
          : area
      )
    );
  }, [setAreas]);
  
  const saveToDatabase = useCallback(async () => {
    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
      showToast('Kullanıcı bilgileri eksik!', 'error');
      return;
    }
    
    if (areas.length === 0) {
      showToast('Kaydedilecek alan bulunamadı!', 'error');
      return;
    }
    
    setIsSaving(true);
    setIsProcessing(true);
    
    try {
      // Clear cache before saving
      clearAllCache();
      clearTableCache('72');
      
      for (const area of areas) {
        // Prepare data for API
        const alanData = {
          alan_adi: area.name,
          aciklama: area.description,
          renk: area.color,
          gunluk_saatler: JSON.stringify(area.dayHours),
          aktif_gunler: JSON.stringify(area.activeDays),
          vardiyalar: JSON.stringify(area.shifts),
          kurum_id: user.kurum_id,
          departman_id: user.departman_id,
          birim_id: user.birim_id,
          aktif_mi: true
        };
        
        // Save to database
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/72/rows',
            method: 'POST',
            data: alanData,
            apiKey: API_CONFIG.apiKey,
            userEmail: API_CONFIG.userEmail,
            projectPassword: API_CONFIG.projectPassword
          })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Kaydetme işlemi başarısız');
        }
      }
      
      showToast(`${areas.length} alan başarıyla kaydedildi!`, 'success');
      
      // Clear cache after saving
      clearAllCache();
      clearTableCache('72');
      
    } catch (error) {
      console.error('Save error:', error);
      showToast('Kaydetme sırasında hata oluştu!', 'error');
    } finally {
      setIsSaving(false);
      setIsProcessing(false);
    }
  }, [areas, user, setIsSaving, setIsProcessing, showToast]);
  
  return {
    addArea,
    removeArea,
    addShiftToArea,
    removeShiftFromArea,
    saveToDatabase
  };
}; 