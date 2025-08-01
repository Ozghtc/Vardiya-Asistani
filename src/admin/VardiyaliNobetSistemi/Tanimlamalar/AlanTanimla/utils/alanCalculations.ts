import { Area, Shift, DayHours } from '../types/AlanTanimla.types';

// Eklenmemiş günleri hesapla
export const getUnaddedDays = (areas: Area[], selectedDays: string[]): string[] => {
  if (areas.length === 0) return selectedDays;
  
  const lastArea = areas[areas.length - 1];
  if (!lastArea.shifts || lastArea.shifts.length === 0) {
    return selectedDays;
  }
  
  // Tüm vardiyalarda hangi günlerin eklendiğini topla
  const addedDays = new Set<string>();
  lastArea.shifts.forEach(shift => {
    shift.days.forEach(day => addedDays.add(day));
  });
  
  // Eklenmemiş günleri döndür
  return selectedDays.filter(day => !addedDays.has(day));
};

// Gün için eklenen mesai saatini hesapla
export const getAddedHoursForDay = (day: string, areas: Area[]): number => {
  if (areas.length === 0) return 0;
  
  const lastArea = areas[areas.length - 1];
  if (!lastArea.shifts) return 0;
  
  return lastArea.shifts
    .filter(shift => shift.days.includes(day))
    .reduce((total, shift) => total + shift.duration, 0);
};

// Gün için kalan mesai saatini hesapla
export const getRemainingHoursForDay = (day: string, dayHours: DayHours, areas: Area[]): number => {
  const totalHours = dayHours[day] || 0;
  const addedHours = getAddedHoursForDay(day, areas);
  return Math.max(0, totalHours - addedHours);
};

// Gün için vardiya bilgilerini al
export const getShiftsForDay = (day: string, areas: Area[]): Shift[] => {
  if (areas.length === 0) return [];
  
  const lastArea = areas[areas.length - 1];
  if (!lastArea.shifts) return [];
  
  return lastArea.shifts.filter(shift => shift.days.includes(day));
};

// Haftalık toplam mesai saatini hesapla
export const getWeeklyTotalHours = (dayHours: DayHours): number => {
  return Object.values(dayHours).reduce((total, hours) => total + hours, 0);
};

// Tüm günlerin kalan mesaisi 0 mı kontrol et
export const allDaysCompleted = (selectedDays: string[], dayHours: DayHours, areas: Area[]): boolean => {
  return selectedDays.every(day => getRemainingHoursForDay(day, dayHours, areas) === 0);
};

// Vardiya için kalan mesai saati olan günleri getir
export const getRemainingWorkDays = (selectedDays: string[], dayHours: DayHours, areas: Area[]): string[] => {
  return selectedDays.filter(day => getRemainingHoursForDay(day, dayHours, areas) > 0);
}; 