import { DayHours } from '../types/AlanTanimla.types';
import { weekDays } from '../constants/alanConstants';

// Gün toggle işlemleri
export const toggleDay = (day: string, selectedDays: string[], setSelectedDays: (days: string[]) => void) => {
  setSelectedDays(
    selectedDays.includes(day) 
      ? selectedDays.filter(d => d !== day) 
      : [...selectedDays, day]
  );
};

export const toggleAllDays = (selectedDays: string[], setSelectedDays: (days: string[]) => void) => {
  if (selectedDays.length === weekDays.length) {
    setSelectedDays([]);
  } else {
    setSelectedDays(weekDays.map(day => day.value));
  }
};

// Vardiya gün toggle işlemleri
export const toggleShiftDay = (day: string, selectedShiftDays: string[], setSelectedShiftDays: (days: string[]) => void) => {
  setSelectedShiftDays(
    selectedShiftDays.includes(day) 
      ? selectedShiftDays.filter(d => d !== day) 
      : [...selectedShiftDays, day]
  );
};

// Mesai saati güncelleme işlemleri
export const updateDayHour = (day: string, hours: number, dayHours: DayHours, setDayHours: (dayHours: DayHours) => void) => {
  setDayHours({
    ...dayHours,
    [day]: hours
  });
};

export const updateAllDaysHours = (dailyWorkHours: number, dayHours: DayHours, setDayHours: (dayHours: DayHours) => void) => {
  const newDayHours = { ...dayHours };
  weekDays.forEach(day => {
    newDayHours[day.value] = dailyWorkHours;
  });
  setDayHours(newDayHours);
};

// Form reset işlemleri
export const resetFormData = (
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  setDescription: (description: string) => void,
  setSelectedColor: (color: string) => void
) => {
  handleNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  setDescription('');
  setSelectedColor('');
};

export const resetToInitialState = (
  setAreas: (areas: any[]) => void,
  setShowShiftSettings: (show: boolean) => void,
  setShowShiftAddition: (show: boolean) => void,
  setSelectedDays: (days: string[]) => void,
  setDayHours: (dayHours: DayHours) => void,
  setDailyWorkHours: (hours: number) => void,
  setSelectedShiftDays: (days: string[]) => void,
  setSelectedShift: (shift: string) => void
) => {
  setAreas([]);
  setShowShiftSettings(false);
  setShowShiftAddition(false);
  setSelectedDays(weekDays.map(day => day.value));
  setDayHours(weekDays.reduce((acc, day) => ({ ...acc, [day.value]: 40 }), {}));
  setDailyWorkHours(40);
  setSelectedShiftDays([]);
  setSelectedShift('GÜNDÜZ');
};

// Validation helpers
export const validateAreaForm = (name: string, selectedColor: string): string | null => {
  if (!name.trim()) {
    return 'Lütfen alan adı girin!';
  }
  if (!selectedColor) {
    return 'Lütfen renk seçin!';
  }
  return null;
};

export const validateShiftSettings = (selectedDays: string[]): string | null => {
  if (selectedDays.length === 0) {
    return 'Lütfen en az bir gün seçin!';
  }
  return null;
};

export const validateShiftAddition = (selectedShiftDays: string[]): string | null => {
  if (selectedShiftDays.length === 0) {
    return 'Lütfen en az bir gün seçin!';
  }
  return null;
}; 