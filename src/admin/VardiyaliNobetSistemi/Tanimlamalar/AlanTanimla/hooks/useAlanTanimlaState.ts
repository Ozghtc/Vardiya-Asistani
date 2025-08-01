import { useState } from 'react';
import { useCapitalization } from '../../../../../hooks/useCapitalization';
import { Area, DayHours, AlanTanimlaState, AlanTanimlaActions } from '../types/AlanTanimla.types';
import { weekDays, vardiyalar } from '../constants/alanConstants';

export const useAlanTanimlaState = (): AlanTanimlaState & AlanTanimlaActions => {
  // Form states
  const [name, handleNameChange] = useCapitalization('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [usedColors, setUsedColors] = useState<string[]>([]);

  // Navigation states
  const [showShiftSettings, setShowShiftSettings] = useState(false);
  const [showShiftAddition, setShowShiftAddition] = useState(false);

  // Area states
  const [areas, setAreas] = useState<Area[]>([]);

  // Work schedule states
  const [dailyWorkHours, setDailyWorkHours] = useState(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(weekDays.map(day => day.value));
  const [dayHours, setDayHours] = useState<DayHours>(
    weekDays.reduce((acc, day) => ({ ...acc, [day.value]: 40 }), {})
  );

  // Shift states
  const [selectedShift, setSelectedShift] = useState(vardiyalar[0].name);
  const [selectedShiftDays, setSelectedShiftDays] = useState<string[]>([]);

  // Process states
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);

  return {
    // State values
    name,
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

    // Actions
    handleNameChange,
    setDescription,
    setSelectedColor,
    setShowShiftSettings,
    setShowShiftAddition,
    setDailyWorkHours,
    setSelectedDays,
    setDayHours,
    setSelectedShift,
    setSelectedShiftDays,
    setIsSaving,
    setIsProcessing,
    setHasShownCompletionToast,
    setAreas
  };
}; 