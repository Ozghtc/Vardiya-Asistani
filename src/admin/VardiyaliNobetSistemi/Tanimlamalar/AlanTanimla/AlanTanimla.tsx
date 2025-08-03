import React from 'react';
import { ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContainer';
import { clearAllCache, clearTableCache } from '../../../../lib/api';

// Hooks
import { useAlanTanimlaState } from './hooks/useAlanTanimlaState';
import { useStepNavigation } from './hooks/useStepNavigation';
import { useAlanOperations } from './hooks/useAlanOperations';

// Components  
import AlanBilgileriFormu from './components/AlanBilgileriFormu';
import MesaiAyarlariFormu from './components/MesaiAyarlariFormu';
import VardiyaEklemeFormu from './components/VardiyaEklemeFormu';
import AlanOnizleme from './components/AlanOnizleme';

// Types
import { Area, Shift } from './types/AlanTanimla.types';

// Utils
import { calculateDayHours } from './utils/alanHelpers';

const AlanTanimla: React.FC = () => {
  const { showToast } = useToast();
  
  // State Management
  const state = useAlanTanimlaState();
  
  // Navigation Logic
  const navigation = useStepNavigation({
    showShiftSettings: state.showShiftSettings,
    showShiftAddition: state.showShiftAddition,
    setShowShiftSettings: state.setShowShiftSettings,
    setShowShiftAddition: state.setShowShiftAddition,
    alanAdi: state.alanAdi,
    selectedColor: state.selectedColor
  });
  
  // CRUD Operations
  const operations = useAlanOperations({
    areas: state.areas,
    setAreas: state.setAreas,
    setIsSaving: state.setIsSaving,
    setIsProcessing: state.setIsProcessing,
    setUsedColors: state.setUsedColors,
    showToast: (message: string, type: 'success' | 'error') => {
      showToast({ type, title: message, message: '', duration: 3000 });
    }
  });

  // Form Handlers
  const handleDayHoursChange = (newDayHours: typeof state.dayHours) => {
    state.setDayHours(newDayHours);
    // Recalculate daily work hours based on total
    const totalHours = Object.values(newDayHours).reduce((total, hours) => total + hours, 0);
    state.setDailyWorkHours(totalHours);
  };

  const handleDailyWorkHoursChange = (hours: number) => {
    state.setDailyWorkHours(hours);
    // Redistribute hours across selected days
    const newDayHours = calculateDayHours(hours, state.selectedDays);
    state.setDayHours(newDayHours);
  };

  const handleAddArea = () => {
    if (!state.alanAdi.trim() || !state.selectedColor) {
      showToast({ type: 'error', title: 'Alan adı ve renk seçimi zorunludur!', message: '', duration: 3000 });
      return;
    }

    const newArea: Omit<Area, 'id'> = {
      name: state.alanAdi,
      color: state.selectedColor,
      description: state.description,
      dailyHours: state.dailyWorkHours,
      activeDays: state.selectedDays,
      dayHours: state.dayHours,
      shifts: []
    };

    operations.addArea(newArea);
    
    // Reset form
    state.setAlanAdi('');
    state.setDescription('');
    state.setSelectedColor('');
    navigation.goBackToForm();
    
    // Clear cache
    clearAllCache();
    clearTableCache('72');
    
    showToast({ type: 'success', title: 'Alan başarıyla eklendi!', message: '', duration: 3000 });
  };

  const handleAddShift = (shift: Shift) => {
    // Find the latest area (current one being worked on)
    const currentArea = state.areas[state.areas.length - 1];
    if (currentArea) {
      operations.addShiftToArea(currentArea.id, shift);
      showToast({ type: 'success', title: 'Vardiya eklendi!', message: '', duration: 3000 });
    }
  };

  // Current step rendering
  const getCurrentStep = () => {
    const currentStep = navigation.getCurrentStep();
    
    if (currentStep === 'shift-addition') {
      return (
        <VardiyaEklemeFormu
          selectedShift={state.selectedShift}
          selectedShiftDays={state.selectedShiftDays}
          onSelectedShiftChange={state.setSelectedShift}
          onSelectedShiftDaysChange={state.setSelectedShiftDays}
          onAddShift={handleAddShift}
          onGoBack={navigation.goBackToSettings}
          isProcessing={state.isProcessing}
        />
      );
    }
    
    if (currentStep === 'shift-settings') {
      return (
        <div className="space-y-6">
          <MesaiAyarlariFormu
            dailyWorkHours={state.dailyWorkHours}
            selectedDays={state.selectedDays}
            dayHours={state.dayHours}
            onDailyWorkHoursChange={handleDailyWorkHoursChange}
            onSelectedDaysChange={state.setSelectedDays}
            onDayHoursChange={handleDayHoursChange}
            isProcessing={state.isProcessing}
          />
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              onClick={navigation.goBackToForm}
              disabled={state.isProcessing}
              className={`flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors ${
                state.isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={navigation.goToShiftAddition}
                disabled={state.isProcessing}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  state.isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-4 h-4" />
                Vardiya Ekle
              </button>
              
              <button
                onClick={handleAddArea}
                disabled={state.isProcessing || state.selectedDays.length === 0}
                className={`flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                  state.isProcessing || state.selectedDays.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Alan Ekle
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Default: form step
    return (
      <div className="space-y-6">
        <AlanBilgileriFormu
          alanAdi={state.alanAdi}
          description={state.description}
          selectedColor={state.selectedColor}
          usedColors={state.usedColors}
          onAlanAdiChange={state.setAlanAdi}
          onDescriptionChange={state.setDescription}
          onColorSelect={state.setSelectedColor}
          isProcessing={state.isProcessing}
        />
        
        {/* Navigation Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={navigation.goToShiftSettings}
            disabled={!navigation.canProceedToSettings()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              navigation.canProceedToSettings()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Mesai Ayarları
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Yeni Alan Tanımlama
          </h2>
          <p className="text-gray-600 mt-1">
            Çalışma alanlarınızı tanımlayın ve mesai saatlerini ayarlayın
          </p>
        </div>
        
        <div className="p-6">
          {getCurrentStep()}
        </div>
        
        {/* Areas Preview */}
        {state.areas.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <AlanOnizleme
              areas={state.areas}
              onRemoveArea={operations.removeArea}
              onSave={operations.saveToDatabase}
              isSaving={state.isSaving}
              isProcessing={state.isProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlanTanimla; 