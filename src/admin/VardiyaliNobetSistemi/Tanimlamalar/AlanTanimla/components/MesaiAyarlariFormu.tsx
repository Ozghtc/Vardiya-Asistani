import React from 'react';
import { Clock } from 'lucide-react';
import { MesaiAyarlariFormuProps } from '../types/AlanTanimla.types';
import AlanOnizleme from './AlanOnizleme';
import GunSecici from './GunSecici';

const MesaiAyarlariFormu: React.FC<MesaiAyarlariFormuProps> = ({
  areas,
  selectedDays,
  dayHours,
  dailyWorkHours,
  isProcessing,
  showShiftAddition,
  onToggleDay,
  onToggleAllDays,
  onUpdateDayHour,
  onUpdateAllDaysHours,
  onSetDailyWorkHours,
  onSubmit,
  onGetAddedHoursForDay,
  onGetRemainingHoursForDay,
  onGetShiftsForDay,
  onGetWeeklyTotalHours
}) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Vardiya ve Mesai Ayarları</h1>
      </div>

      {/* Alan Bilgileri */}
      <AlanOnizleme
        areas={areas}
        showShiftAddition={showShiftAddition}
        selectedDays={selectedDays}
        onGetAddedHoursForDay={onGetAddedHoursForDay}
        onGetRemainingHoursForDay={onGetRemainingHoursForDay}
        onGetShiftsForDay={onGetShiftsForDay}
        onGetWeeklyTotalHours={onGetWeeklyTotalHours}
      />

      {/* Vardiya Ayarları */}
      {!showShiftAddition && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold">Günlük Mesai Belirleme</h2>
          </div>

          <GunSecici
            selectedDays={selectedDays}
            dayHours={dayHours}
            dailyWorkHours={dailyWorkHours}
            isProcessing={isProcessing}
            onToggleDay={onToggleDay}
            onToggleAllDays={onToggleAllDays}
            onUpdateDayHour={onUpdateDayHour}
            onUpdateAllDaysHours={onUpdateAllDaysHours}
            onSetDailyWorkHours={onSetDailyWorkHours}
          />

          <div className="pt-6">
            <button
              onClick={onSubmit}
              disabled={selectedDays.length === 0 || isProcessing}
              className={`w-full py-3 rounded-lg transition-colors ${
                selectedDays.length > 0 && !isProcessing
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'İşleniyor...' : 'Ekle'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesaiAyarlariFormu; 