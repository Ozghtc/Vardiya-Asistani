import { useState } from 'react';
import { AlanTanimlaHookReturn, Area, DayHours } from '../types/AlanTanimla.types';
import { weekDays, vardiyalar } from '../constants/alanConstants';
import { calculateDayHours } from '../utils/alanHelpers';

export const useAlanTanimlaState = (): AlanTanimlaHookReturn => {
  // Form state'leri
  const [alanAdi, setAlanAdi] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [usedColors, setUsedColors] = useState<string[]>([]);
  
  // UI state'leri
  const [showShiftSettings, setShowShiftSettings] = useState(false);
  const [showShiftAddition, setShowShiftAddition] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  
  // Data state'leri
  const [areas, setAreas] = useState<Area[]>([]);
  
  // Mesai ayarları
  const [dailyWorkHours, setDailyWorkHours] = useState(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(weekDays.map(day => day.value));
  const [dayHours, setDayHours] = useState<DayHours>(
    calculateDayHours(40, weekDays.map(day => day.value))
  );
  
  // Vardiya ayarları
  const [selectedShift, setSelectedShift] = useState(vardiyalar[0].name);
  const [selectedShiftDays, setSelectedShiftDays] = useState<string[]>([]);

  return {
    // State values
    alanAdi,
    description,
    selectedColor,
    usedColors,
    showShiftSettings,
    showShiftAddition,
    areas,
    dailyWorkHours,
    selectedDays,
    dayHours,
    selectedShift,
    selectedShiftDays,
    isSaving,
    isProcessing,
    hasShownCompletionToast,
    
    // State setters
    setAlanAdi,
    setDescription,
    setSelectedColor,
    setUsedColors,
    setShowShiftSettings,
    setShowShiftAddition,
    setAreas,
    setDailyWorkHours,
    setSelectedDays,
    setDayHours,
    setSelectedShift,
    setSelectedShiftDays,
    setIsSaving,
    setIsProcessing,
    setHasShownCompletionToast
  };
}; 