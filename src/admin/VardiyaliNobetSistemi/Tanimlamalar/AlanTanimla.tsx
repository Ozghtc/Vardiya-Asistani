import React from 'react';
import { Check, X, Clock, Save } from 'lucide-react';

// Modular imports
import { useAlanTanimlaState } from './AlanTanimla/hooks/useAlanTanimlaState';
import { useAlanOperations } from './AlanTanimla/hooks/useAlanOperations';
import { 
  toggleDay, 
  toggleAllDays, 
  toggleShiftDay, 
  updateAllDaysHours, 
  updateDayHour 
} from './AlanTanimla/utils/alanHelpers';
import { 
  getAddedHoursForDay,
  getRemainingHoursForDay,
  getShiftsForDay,
  getUnaddedDays,
  getWeeklyTotalHours,
  allDaysCompleted
} from './AlanTanimla/utils/alanCalculations';
import { colorMap, weekDays, vardiyalar } from './AlanTanimla/constants/alanConstants';

const YeniAlan: React.FC = () => {
  // State management
  const state = useAlanTanimlaState();
  
  // Operations
  const operations = useAlanOperations({
    // State values
    name: state.name,
    description: state.description,
    selectedColor: state.selectedColor,
    areas: state.areas,
    selectedDays: state.selectedDays,
    dayHours: state.dayHours,
    dailyWorkHours: state.dailyWorkHours,
    selectedShift: state.selectedShift,
    selectedShiftDays: state.selectedShiftDays,
    isProcessing: state.isProcessing,
    
    // State setters  
    setAreas: state.setAreas,
    setShowShiftSettings: state.setShowShiftSettings,
    setShowShiftAddition: state.setShowShiftAddition,
    setSelectedShiftDays: state.setSelectedShiftDays,
    setIsSaving: state.setIsSaving,
    setIsProcessing: state.setIsProcessing,
    setHasShownCompletionToast: state.setHasShownCompletionToast,
    handleNameChange: state.handleNameChange,
    setDescription: state.setDescription,
    setSelectedColor: state.setSelectedColor,
    setSelectedDays: state.setSelectedDays,
    setDailyWorkHours: state.setDailyWorkHours,
    setDayHours: state.setDayHours,
    setSelectedShift: state.setSelectedShift
  });

  // Helper functions
  const handleToggleDay = (day: string) => {
    const newDays = toggleDay(day, state.selectedDays);
    state.setSelectedDays(newDays);
  };

  const handleToggleAllDays = () => {
    const newDays = toggleAllDays(state.selectedDays);
    state.setSelectedDays(newDays);
  };

  const handleToggleShiftDay = (day: string) => {
    const newDays = toggleShiftDay(day, state.selectedShiftDays);
    state.setSelectedShiftDays(newDays);
  };

  const handleUpdateDayHour = (day: string, hours: number) => {
    const newDayHours = updateDayHour(day, hours, state.dayHours);
    state.setDayHours(newDayHours);
  };

  const handleUpdateAllDaysHours = () => {
    const newDayHours = updateAllDaysHours(state.dailyWorkHours, state.dayHours);
    state.setDayHours(newDayHours);
  };

  // Calculation functions
  const getUnaddedDaysForCurrentArea = () => getUnaddedDays(state.areas, state.selectedDays);
  const getAddedHoursForDayWrapper = (day: string) => getAddedHoursForDay(day, state.areas);
  const getRemainingHoursForDayWrapper = (day: string) => getRemainingHoursForDay(day, state.dayHours, state.areas);
  const getShiftsForDayWrapper = (day: string) => getShiftsForDay(day, state.areas);
  const getWeeklyTotalHoursWrapper = () => getWeeklyTotalHours(state.dayHours);

  // All days completed check
  const allCompleted = allDaysCompleted(state.selectedDays, state.dayHours, state.areas);

  // Toast effect
  React.useEffect(() => {
    if (state.showShiftAddition && allCompleted && !state.hasShownCompletionToast) {
      // Toast notification will be handled by the operations hook
      state.setHasShownCompletionToast(true);
    }
  }, [state.showShiftAddition, allCompleted, state.hasShownCompletionToast, state.setHasShownCompletionToast]);

  // Remaining days for shift addition
  const remainingDays = state.selectedDays.filter(day => getRemainingHoursForDayWrapper(day) > 0);

  // Update selected shift days when remaining days change
  React.useEffect(() => {
    if (state.showShiftAddition && remainingDays.length > 0) {
      state.setSelectedShiftDays(remainingDays);
    }
  }, [state.showShiftAddition, remainingDays.length, state.setSelectedShiftDays]);

  // Step rendering - Shift Settings
  if (state.showShiftSettings) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Vardiya ve Mesai Ayarları</h1>
        </div>

        {/* Alan Bilgileri */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Tanımlı Alanlar</h2>
          <div className="space-y-3">
            {state.areas.map((area) => (
              <div 
                key={area.id}
                className="border rounded-lg overflow-hidden"
                style={{ borderLeftColor: area.color, borderLeftWidth: '4px' }}
              >
                {/* Alan Bilgileri */}
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: area.color }}
                    ></div>
                    <div>
                      <h3 className="font-semibold">{area.name}</h3>
                      <p className="text-sm text-gray-600">{area.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Haftalık: {getWeeklyTotalHoursWrapper()} saat</p>
                    <p className="text-xs text-gray-500">{area.activeDays.length} gün aktif</p>
                  </div>
                </div>

                {/* Günlük Mesai Bilgileri */}
                {state.showShiftAddition && area.dayHours && Object.keys(area.dayHours).length > 0 && (
                  <div className="p-3 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Günlük Toplam Mesailer</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                      {weekDays.map((day) => {
                        const dayHour = area.dayHours[day.value] || 0;
                        const isActive = area.activeDays.includes(day.value);
                        const addedHours = getAddedHoursForDayWrapper(day.value);
                        const remainingHours = getRemainingHoursForDayWrapper(day.value);
                        const dayShifts = getShiftsForDayWrapper(day.value);
                        
                        return (
                          <div 
                            key={day.value}
                            className={`p-4 rounded-lg border-2 min-h-[180px] ${
                              isActive 
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="text-center space-y-2">
                              <div className="font-semibold text-lg">{day.name}</div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">T</div>
                                  <div className="text-blue-600 font-semibold">{dayHour}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Ek Mes</div>
                                  <div className="text-green-600 font-semibold">{addedHours}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Kalan Mes</div>
                                  <div className="text-red-600 font-semibold">{remainingHours}</div>
                                </div>
                              </div>
                              
                              {/* Vardiya bilgileri */}
                              {dayShifts.length > 0 && (
                                <div className="mt-3">
                                  <div className="space-y-1">
                                    {dayShifts.map((shift, index) => (
                                      <div key={index} className="text-xs bg-white p-2 rounded border">
                                        <div className="font-medium text-gray-700">
                                          {index + 1} Vardiya: {shift.name} ({shift.hours})
                                        </div>
                                        <div className="text-gray-600">{shift.duration} saat</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mesai Ayarları */}
        {!state.showShiftAddition && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold">Günlük Mesai Belirleme</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Günlük Toplam Mesai Saati
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={state.dailyWorkHours}
                      onChange={(e) => state.setDailyWorkHours(Number(e.target.value))}
                      disabled={state.isProcessing}
                      className={`w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                        state.isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                    <button
                      onClick={handleUpdateAllDaysHours}
                      disabled={state.isProcessing}
                      className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                        state.isProcessing
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {state.isProcessing ? 'İşleniyor...' : 'Tüm Günlere Uygula'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Günler</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleAllDays}
                      disabled={state.isProcessing}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                        state.selectedDays.length === weekDays.length
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${state.isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        state.selectedDays.length === weekDays.length
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-400'
                      }`}>
                        {state.selectedDays.length === weekDays.length && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      Tümünü Seç
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {weekDays.map((day) => {
                    const isSelected = state.selectedDays.includes(day.value);
                    const dayHour = state.dayHours[day.value] || 0;
                    
                    return (
                      <div 
                        key={day.value}
                        className={`p-4 rounded-lg border-2 transition-all min-h-[120px] ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => handleToggleDay(day.value)}
                            disabled={state.isProcessing}
                            className={`flex items-center gap-2 w-full text-left ${
                              isSelected ? 'text-blue-800' : 'text-gray-600'
                            } ${state.isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-400'
                            }`}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="font-semibold">{day.name}</span>
                          </button>
                        </div>
                        
                        {isSelected && (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-600">
                              Günlük Toplam Mesai
                            </label>
                            <input
                              type="number"
                              value={dayHour}
                              onChange={(e) => handleUpdateDayHour(day.value, Number(e.target.value))}
                              disabled={state.isProcessing}
                              className={`w-full px-3 py-2 text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                                state.isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                              placeholder="40"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={operations.handleAddShiftSettings}
                disabled={state.selectedDays.length === 0 || state.isProcessing}
                className={`w-full py-3 rounded-lg transition-colors ${
                  state.selectedDays.length > 0 && !state.isProcessing
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {state.isProcessing ? 'İşleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        )}

        {/* Vardiya Ekleme Bölümü */}
        {state.showShiftAddition && !allCompleted && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mt-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h2 className="text-base sm:text-lg font-semibold">Vardiya Eklenecek Günler</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vardiya Türü
                  </label>
                  <select
                    value={state.selectedShift}
                    onChange={(e) => state.setSelectedShift(e.target.value)}
                    disabled={state.isProcessing}
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                      state.isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    {vardiyalar.map((shift) => (
                      <option key={shift.name} value={shift.name}>
                        {shift.name} ({shift.hours}) = {shift.duration} Saat
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vardiya Eklenecek Günler ({remainingDays.length} gün kaldı)
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => {
                    const isActive = state.selectedDays.includes(day.value);
                    const isSelected = state.selectedShiftDays.includes(day.value);
                    const remainingHours = getRemainingHoursForDayWrapper(day.value);
                    
                    return (
                      <button
                        key={day.value}
                        onClick={() => isActive && remainingHours > 0 && handleToggleShiftDay(day.value)}
                        disabled={!isActive || remainingHours === 0 || state.isProcessing}
                        className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                          !isActive
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : remainingHours === 0
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } ${state.isProcessing ? 'opacity-50' : ''}`}
                        title={
                          !isActive 
                            ? 'Bu gün aktif değil'
                            : remainingHours === 0 
                            ? 'Bu günün mesai saati doldu'
                            : state.isProcessing
                            ? 'İşlem devam ediyor'
                            : 'Bu güne vardiya ekle'
                        }
                      >
                        {day.name}
                        {remainingHours === 0 && isActive && (
                          <span className="ml-1 text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={operations.handleAddShift}
                  disabled={state.selectedShiftDays.length === 0 || allCompleted || state.isProcessing}
                  className={`w-full py-3 rounded-lg transition-colors ${
                    state.selectedShiftDays.length > 0 && !allCompleted && !state.isProcessing
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {state.isProcessing ? 'İşleniyor...' : allCompleted ? 'Tüm Günler Tamamlandı' : 'Vardiya Ekle'}
                </button>
                
                {/* Kaydet Butonu */}
                {state.areas.length > 0 && (
                  <button
                    onClick={operations.handleSaveToDatabase}
                    disabled={state.isSaving || state.isProcessing}
                    className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      state.isSaving || state.isProcessing
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {state.isSaving ? 'Kaydediliyor...' : state.isProcessing ? 'İşleniyor...' : 'Kaydet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kaydet Butonu - Tüm günler tamamlandığında */}
        {state.showShiftAddition && allCompleted && (
          <div className="mt-6">
            <button
              onClick={operations.handleSaveToDatabase}
              disabled={state.isSaving || state.isProcessing}
              className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                state.isSaving || state.isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              {state.isSaving ? 'Kaydediliyor...' : state.isProcessing ? 'İşleniyor...' : 'Kaydet'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default: Form step
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Alan Tanımla</h1>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Alan Adı</label>
              <input
                type="text"
                value={state.name}
                onChange={state.handleNameChange}
                placeholder="ÖRN: KIRMIZI ALAN, GÖZLEM ODASI"
                disabled={state.isProcessing}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                  state.isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <label className="text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                Temsili Renk
                {state.selectedColor && (
                  <span className="font-bold" style={{ color: state.selectedColor }}>
                    ({colorMap[state.selectedColor as keyof typeof colorMap]})
                  </span>
                )}
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-3">
                {Object.entries(colorMap).map(([color, name]) => {
                  const isUsed = state.usedColors.includes(color);
                  const isSelected = state.selectedColor === color;
                  
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => !isUsed && !state.isProcessing && state.setSelectedColor(color)}
                      className={`relative group ${isUsed || state.isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      title={isUsed ? `${name} (Kullanımda)` : state.isProcessing ? 'İşlem devam ediyor' : name}
                      disabled={isUsed || state.isProcessing}
                    >
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-all ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 scale-110' 
                            : isUsed || state.isProcessing
                            ? 'opacity-50'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                        {isUsed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Açıklama</label>
              <textarea
                value={state.description}
                onChange={state.handleDescriptionTextareaChange}
                placeholder="ALAN HAKKINDA KISA BİR AÇIKLAMA"
                rows={4}
                disabled={state.isProcessing}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                  state.isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="pt-4">
              <button
                onClick={operations.handleAddArea}
                disabled={!state.name.trim() || !state.selectedColor || state.isProcessing}
                className={`w-full py-3 rounded-lg transition-colors ${
                  state.name.trim() && state.selectedColor && !state.isProcessing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {state.isProcessing ? 'İşleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YeniAlan; 