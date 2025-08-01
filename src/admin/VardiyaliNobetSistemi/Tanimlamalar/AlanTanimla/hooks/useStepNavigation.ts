import { StepNavigation } from '../types/AlanTanimla.types';
import { allDaysCompleted } from '../utils/alanCalculations';

export const useStepNavigation = (
  showShiftSettings: boolean,
  showShiftAddition: boolean,
  selectedDays: string[],
  dayHours: any,
  areas: any[]
): StepNavigation => {
  // Mevcut adımı belirle
  const getCurrentStep = (): 'form' | 'settings' | 'shifts' => {
    if (!showShiftSettings) return 'form';
    if (showShiftSettings && !showShiftAddition) return 'settings';
    return 'shifts';
  };

  // Ayar adımına geçiş izni
  const canProceedToSettings = !showShiftSettings;

  // Vardiya adımına geçiş izni
  const canProceedToShifts = showShiftSettings && !showShiftAddition;

  // Tüm günler tamamlandı mı?
  const allCompleted = allDaysCompleted(selectedDays, dayHours, areas);

  return {
    currentStep: getCurrentStep(),
    canProceedToSettings,
    canProceedToShifts,
    allDaysCompleted: allCompleted
  };
}; 