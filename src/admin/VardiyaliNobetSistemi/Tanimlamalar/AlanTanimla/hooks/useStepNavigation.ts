import { useCallback } from 'react';

interface UseStepNavigationProps {
  showShiftSettings: boolean;
  showShiftAddition: boolean;
  setShowShiftSettings: (value: boolean) => void;
  setShowShiftAddition: (value: boolean) => void;
  alanAdi: string;
  selectedColor: string;
}

export const useStepNavigation = ({
  showShiftSettings,
  showShiftAddition,
  setShowShiftSettings,
  setShowShiftAddition,
  alanAdi,
  selectedColor
}: UseStepNavigationProps) => {
  
  const goToShiftSettings = useCallback(() => {
    if (alanAdi.trim() && selectedColor) {
      setShowShiftSettings(true);
    }
  }, [alanAdi, selectedColor, setShowShiftSettings]);
  
  const goToShiftAddition = useCallback(() => {
    setShowShiftAddition(true);
  }, [setShowShiftAddition]);
  
  const goBackToSettings = useCallback(() => {
    setShowShiftAddition(false);
  }, [setShowShiftAddition]);
  
  const goBackToForm = useCallback(() => {
    setShowShiftSettings(false);
    setShowShiftAddition(false);
  }, [setShowShiftSettings, setShowShiftAddition]);
  
  const canProceedToSettings = useCallback(() => {
    return alanAdi.trim() !== '' && selectedColor !== '';
  }, [alanAdi, selectedColor]);
  
  const getCurrentStep = useCallback(() => {
    if (showShiftAddition) return 'shift-addition';
    if (showShiftSettings) return 'shift-settings';
    return 'form';
  }, [showShiftSettings, showShiftAddition]);
  
  return {
    goToShiftSettings,
    goToShiftAddition,
    goBackToSettings,
    goBackToForm,
    canProceedToSettings,
    getCurrentStep
  };
}; 