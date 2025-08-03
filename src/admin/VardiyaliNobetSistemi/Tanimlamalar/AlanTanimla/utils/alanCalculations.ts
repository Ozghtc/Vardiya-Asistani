import { Area, Shift, DayHours } from '../types/AlanTanimla.types';

/**
 * Vardiya saatlerini hesaplar
 */
export const calculateShiftHours = (start: string, end: string): number => {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  // Gece vardiyası kontrolü (ör: 22:00-06:00)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Ertesi güne geç
  }
  
  return (endMinutes - startMinutes) / 60;
};

/**
 * Alan toplam saatlerini hesaplar
 */
export const calculateAreaTotalHours = (area: Area): number => {
  return area.shifts.reduce((total, shift) => {
    const shiftHours = calculateShiftHours(shift.start, shift.end);
    return total + (shiftHours * shift.days.length);
  }, 0);
};

/**
 * Haftalık toplam saatleri hesaplar
 */
export const calculateWeeklyHours = (dayHours: DayHours): number => {
  return Object.values(dayHours).reduce((total, hours) => total + hours, 0);
};

/**
 * Ortalama günlük saatleri hesaplar
 */
export const calculateAverageDailyHours = (dayHours: DayHours, activeDays: string[]): number => {
  if (activeDays.length === 0) return 0;
  
  const totalHours = activeDays.reduce((total, day) => total + (dayHours[day] || 0), 0);
  return totalHours / activeDays.length;
};

/**
 * Vardiya çakışmasını kontrol eder
 */
export const checkShiftOverlap = (shift1: Shift, shift2: Shift): boolean => {
  // Aynı günlerde çalışıyorlar mı?
  const commonDays = shift1.days.filter(day => shift2.days.includes(day));
  if (commonDays.length === 0) return false;
  
  // Saat çakışması var mı?
  const start1 = shift1.start;
  const end1 = shift1.end;
  const start2 = shift2.start;
  const end2 = shift2.end;
  
  return !(end1 <= start2 || end2 <= start1);
}; 