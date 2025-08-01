import React, { useEffect } from 'react';
import { useToast } from '../../../../components/ui/ToastContainer';
import { useAlanTanimlaState } from './hooks/useAlanTanimlaState';
import { useAlanOperations } from './hooks/useAlanOperations';
import { useStepNavigation } from './hooks/useStepNavigation';
import { 
  getUnaddedDays, 
  getAddedHoursForDay, 
  getRemainingHoursForDay, 
  getShiftsForDay, 
  getWeeklyTotalHours,
  allDaysCompleted as calculateAllDaysCompleted
} from './utils/alanCalculations';
import { 
  toggleDay, 
  toggleAllDays, 
  toggleShiftDay, 
  updateDayHour, 
  updateAllDaysHours 
} from './utils/alanHelpers';
import AlanBilgileriFormu from './components/AlanBilgileriFormu';
import MesaiAyarlariFormu from './components/MesaiAyarlariFormu';
import VardiyaEklemeFormu from './components/VardiyaEklemeFormu';
import AlanOnizleme from './components/AlanOnizleme';

const AlanTanimla: React.FC = () => {
  const { showToast } = useToast();
  
  // State management
  const state = useAlanTanimlaState();
  const {
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
  } = state;

  // Operations
  const operations = useAlanOperations(
    // State values
    name,
    description,
    selectedColor,
    areas,
    selectedDays,
    dayHours,
    dailyWorkHours,
    selectedShift,
    selectedShiftDays,
    isProcessing,
    
    // State setters  
    setAreas,
    setShowShiftSettings,
    setShowShiftAddition,
    setSelectedShiftDays,
    setIsSaving,
    setIsProcessing,
    setHasShownCompletionToast,
    handleNameChange,
    setDescription,
    setSelectedColor,
    setSelectedDays,
    setDailyWorkHours,
    setDayHours,
    setSelectedShift
  );

  // Navigation
  const navigation = useStepNavigation(
    showShiftSettings,
    showShiftAddition,
    selectedDays,
    dayHours,
    areas
  );

  // Helper functions
  const handleToggleDay = (day: string) => {
    toggleDay(day, selectedDays, setSelectedDays);
  };

  const handleToggleAllDays = () => {
    toggleAllDays(selectedDays, setSelectedDays);
  };

  const handleToggleShiftDay = (day: string) => {
    toggleShiftDay(day, selectedShiftDays, setSelectedShiftDays);
  };

  const handleUpdateDayHour = (day: string, hours: number) => {
    updateDayHour(day, hours, dayHours, setDayHours);
  };

  const handleUpdateAllDaysHours = () => {
    updateAllDaysHours(dailyWorkHours, dayHours, setDayHours);
  };

  // Calculation functions
  const getUnaddedDaysForCurrentArea = () => getUnaddedDays(areas, selectedDays);
  const getAddedHoursForDayWrapper = (day: string) => getAddedHoursForDay(day, areas);
  const getRemainingHoursForDayWrapper = (day: string) => getRemainingHoursForDay(day, dayHours, areas);
  const getShiftsForDayWrapper = (day: string) => getShiftsForDay(day, areas);
  const getWeeklyTotalHoursWrapper = () => getWeeklyTotalHours(dayHours);

  // All days completed check
  const allCompleted = calculateAllDaysCompleted(selectedDays, dayHours, areas);

  // Textarea için ayrı handler
  const handleDescriptionTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value.toUpperCase());
  };

  // Tüm günler tamamlandığında toast notification göster
  useEffect(() => {
    if (showShiftAddition && allCompleted && !hasShownCompletionToast) {
      showToast({
        type: 'success',
        title: 'Tüm günlere vardiya başarılı bir şekilde eklendi!',
        message: 'Bu alan için tüm günlere vardiya tanımlaması tamamlandı.',
        duration: 4000
      });
      setHasShownCompletionToast(true);
    }
  }, [showShiftAddition, allCompleted, hasShownCompletionToast, showToast, setHasShownCompletionToast]);

  // Step rendering
  if (showShiftSettings) {
    return (
      <>
        <AlanOnizleme
          areas={areas}
          showShiftAddition={showShiftAddition}
          selectedDays={selectedDays}
          onGetAddedHoursForDay={getAddedHoursForDayWrapper}
          onGetRemainingHoursForDay={getRemainingHoursForDayWrapper}
          onGetShiftsForDay={getShiftsForDayWrapper}
          onGetWeeklyTotalHours={getWeeklyTotalHoursWrapper}
        />
        
        <MesaiAyarlariFormu
          areas={areas}
          selectedDays={selectedDays}
          dayHours={dayHours}
          dailyWorkHours={dailyWorkHours}
          isProcessing={isProcessing}
          showShiftAddition={showShiftAddition}
          onToggleDay={handleToggleDay}
          onToggleAllDays={handleToggleAllDays}
          onUpdateDayHour={handleUpdateDayHour}
          onUpdateAllDaysHours={handleUpdateAllDaysHours}
          onSetDailyWorkHours={setDailyWorkHours}
          onSubmit={operations.handleAddShiftSettings}
          onGetAddedHoursForDay={getAddedHoursForDayWrapper}
          onGetRemainingHoursForDay={getRemainingHoursForDayWrapper}
          onGetShiftsForDay={getShiftsForDayWrapper}
          onGetWeeklyTotalHours={getWeeklyTotalHoursWrapper}
        />

        <VardiyaEklemeFormu
          areas={areas}
          selectedDays={selectedDays}
          selectedShift={selectedShift}
          selectedShiftDays={selectedShiftDays}
          isProcessing={isProcessing}
          isSaving={isSaving}
          allDaysCompleted={allCompleted}
          onSetSelectedShift={setSelectedShift}
          onToggleShiftDay={handleToggleShiftDay}
          onAddShift={operations.handleAddShift}
          onSaveToDatabase={operations.handleSaveToDatabase}
          onGetRemainingHoursForDay={getRemainingHoursForDayWrapper}
          onGetUnaddedDays={getUnaddedDaysForCurrentArea}
        />
      </>
    );
  }

  return (
    <AlanBilgileriFormu
      name={name}
      description={description}
      selectedColor={selectedColor}
      usedColors={usedColors}
      isProcessing={isProcessing}
      onNameChange={handleNameChange}
      onDescriptionChange={handleDescriptionTextareaChange}
      onColorSelect={setSelectedColor}
      onSubmit={operations.handleAddArea}
    />
  );
};

export default AlanTanimla; 