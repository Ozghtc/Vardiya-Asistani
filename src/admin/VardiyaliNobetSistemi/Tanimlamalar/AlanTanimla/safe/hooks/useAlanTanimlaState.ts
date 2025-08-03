import { useState } from 'react';
import { useCapitalization } from '../../../../../../hooks/useCapitalization';
import { Area, DayHours, AlanTanimlaState } from '../types/AlanTanimla.types';
import { weekDays, vardiyalar } from '../constants/alanConstants';

export const useAlanTanimlaState = () => {
  // Capitalization hook
  const [name, handleNameChange] = useCapitalization('');
  
  // Basic form state
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [usedColors, setUsedColors] = useState<string[]>([]);
  
  // UI state
  const [showShiftSettings, setShowShiftSettings] = useState(false);
  const [showShiftAddition, setShowShiftAddition] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  
  // Data state
  const [areas, setAreas] = useState<Area[]>([]);
  
  // Work schedule state
  const [dailyWorkHours, setDailyWorkHours] = useState(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(weekDays.map(day => day.value));
  const [dayHours, setDayHours] = useState<DayHours>(
    weekDays.reduce((acc, day) => ({ ...acc, [day.value]: 40 }), {})
  );
  
  // Shift state
  const [selectedShift, setSelectedShift] = useState(vardiyalar[0].name);
  const [selectedShiftDays, setSelectedShiftDays] = useState<string[]>([]);

  // Textarea handler
  const handleDescriptionTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value.toUpperCase());
  };

  return {
    // Values
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
    
    // Handlers
    handleNameChange,
    handleDescriptionTextareaChange,
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