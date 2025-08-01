import React from 'react';
import { Clock, Save } from 'lucide-react';
import { VardiyaEklemeFormuProps } from '../types/AlanTanimla.types';
import { weekDays, vardiyalar } from '../constants/alanConstants';

const VardiyaEklemeFormu: React.FC<VardiyaEklemeFormuProps> = ({
  areas,
  selectedDays,
  selectedShift,
  selectedShiftDays,
  isProcessing,
  isSaving,
  allDaysCompleted,
  onSetSelectedShift,
  onToggleShiftDay,
  onAddShift,
  onSaveToDatabase,
  onGetRemainingHoursForDay,
  onGetUnaddedDays
}) => {
  const unaddedDays = onGetUnaddedDays();

  return (
    <>
      {/* Vardiya Ekleme Bölümü */}
      {!allDaysCompleted && (
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
                  value={selectedShift}
                  onChange={(e) => onSetSelectedShift(e.target.value)}
                  disabled={isProcessing}
                  className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                    isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
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
                Vardiya Eklenecek Günler ({selectedDays.filter(day => onGetRemainingHoursForDay(day) > 0).length} gün kaldı)
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => {
                  const isActive = selectedDays.includes(day.value);
                  const isUnadded = unaddedDays.includes(day.value);
                  const isSelected = selectedShiftDays.includes(day.value);
                  const remainingHours = onGetRemainingHoursForDay(day.value);
                  
                  return (
                    <button
                      key={day.value}
                      onClick={() => isActive && remainingHours > 0 && onToggleShiftDay(day.value)}
                      disabled={!isActive || remainingHours === 0 || isProcessing}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        !isActive
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : remainingHours === 0
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${isProcessing ? 'opacity-50' : ''}`}
                      title={
                        !isActive 
                          ? 'Bu gün aktif değil'
                          : remainingHours === 0 
                          ? 'Bu günün mesai saati doldu'
                          : isProcessing
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
                onClick={onAddShift}
                disabled={selectedShiftDays.length === 0 || allDaysCompleted || isProcessing}
                className={`w-full py-3 rounded-lg transition-colors ${
                  selectedShiftDays.length > 0 && !allDaysCompleted && !isProcessing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'İşleniyor...' : allDaysCompleted ? 'Tüm Günler Tamamlandı' : 'Vardiya Ekle'}
              </button>
              
              {/* Kaydet Butonu - Vardiya ekleme bölümünde de göster */}
              {areas.length > 0 && (
                <button
                  onClick={onSaveToDatabase}
                  disabled={isSaving || isProcessing}
                  className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isSaving || isProcessing
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Kaydediliyor...' : isProcessing ? 'İşleniyor...' : 'Kaydet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kaydet Butonu - Tüm günler tamamlandığında göster */}
      {allDaysCompleted && (
        <div className="mt-6">
          <button
            onClick={onSaveToDatabase}
            disabled={isSaving || isProcessing}
            className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isSaving || isProcessing
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : isProcessing ? 'İşleniyor...' : 'Kaydet'}
          </button>
        </div>
      )}
    </>
  );
};

export default VardiyaEklemeFormu; 