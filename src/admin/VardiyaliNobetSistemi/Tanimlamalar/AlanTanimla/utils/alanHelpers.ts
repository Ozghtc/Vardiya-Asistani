import { DayHours } from '../types/AlanTanimla.types';
import { weekDays } from '../constants/alanConstants';

/**
 * Gün geçiş işlemleri
 */
export const toggleDay = (day: string, selectedDays: string[]): string[] => {
  return selectedDays.includes(day) 
    ? selectedDays.filter(d => d !== day) 
    : [...selectedDays, day];
};

export const toggleAllDays = (selectedDays: string[]): string[] => {
  return selectedDays.length === weekDays.length 
    ? [] 
    : weekDays.map(day => day.value);
};

export const toggleShiftDay = (day: string, selectedShiftDays: string[]): string[] => {
  return selectedShiftDays.includes(day) 
    ? selectedShiftDays.filter(d => d !== day) 
    : [...selectedShiftDays, day];
};

/**
 * Saat hesapları
 */
export const updateAllDaysHours = (dailyWorkHours: number, dayHours: DayHours): DayHours => {
  const newDayHours = { ...dayHours };
  weekDays.forEach(day => {
    newDayHours[day.value] = dailyWorkHours;
  });
  return newDayHours;
};

export const updateDayHour = (day: string, hours: number, dayHours: DayHours): DayHours => {
  return {
    ...dayHours,
    [day]: hours
  };
};

/**
 * Renk yardımcıları
 */
export const isColorUsed = (color: string, usedColors: string[]): boolean => {
  return usedColors.includes(color);
};

/**
 * Form reset helpers
 */
export const resetFormState = () => {
  return {
    name: '',
    description: '',
    selectedColor: '',
    selectedShiftDays: [],
    hasShownCompletionToast: false
  };
};

export const resetToInitialState = () => {
  return {
    areas: [],
    showShiftSettings: false,
    showShiftAddition: false,
    selectedDays: weekDays.map(day => day.value),
    dayHours: weekDays.reduce((acc, day) => ({ ...acc, [day.value]: 40 }), {}),
    dailyWorkHours: 40,
    selectedShiftDays: [],
    selectedShift: 'GÜNDÜZ'
  };
}; 