import { DayHours } from '../types/AlanTanimla.types';
import { weekDays } from '../constants/alanConstants';

/**
 * Günlük saatleri hesaplar
 */
export const calculateDayHours = (totalHours: number, selectedDays: string[]): DayHours => {
  const dayHours: DayHours = {};
  const hoursPerDay = selectedDays.length > 0 ? totalHours / selectedDays.length : 0;
  
  weekDays.forEach(day => {
    dayHours[day.value] = selectedDays.includes(day.value) ? hoursPerDay : 0;
  });
  
  return dayHours;
};

/**
 * Toplam saatleri hesaplar
 */
export const calculateTotalHours = (dayHours: DayHours): number => {
  return Object.values(dayHours).reduce((total, hours) => total + hours, 0);
};

/**
 * Gün adlarını formatlar
 */
export const formatDayNames = (days: string[]): string => {
  const dayMap: { [key: string]: string } = {
    'pazartesi': 'Pzt',
    'sali': 'Sal',
    'carsamba': 'Çar',
    'persembe': 'Per',
    'cuma': 'Cum',
    'cumartesi': 'Cmt',
    'pazar': 'Paz'
  };
  
  return days.map(day => dayMap[day] || day).join(', ');
};

/**
 * Renk kullanımını kontrol eder
 */
export const isColorUsed = (color: string, usedColors: string[]): boolean => {
  return usedColors.includes(color);
};

/**
 * Unique ID oluşturur
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}; 