import React from 'react';
import { DayHours } from '../types/AlanTanimla.types';
import { weekDays } from '../constants/alanConstants';
import GunSecici from './GunSecici';

interface MesaiAyarlariFormuProps {
  dailyWorkHours: number;
  selectedDays: string[];
  dayHours: DayHours;
  onDailyWorkHoursChange: (hours: number) => void;
  onSelectedDaysChange: (days: string[]) => void;
  onDayHoursChange: (dayHours: DayHours) => void;
  isProcessing?: boolean;
}

const MesaiAyarlariFormu: React.FC<MesaiAyarlariFormuProps> = ({
  dailyWorkHours,
  selectedDays,
  dayHours,
  onDailyWorkHoursChange,
  onSelectedDaysChange,
  onDayHoursChange,
  isProcessing = false
}) => {
  const handleDayHourChange = (day: string, hours: number) => {
    const newDayHours = { ...dayHours, [day]: hours };
    onDayHoursChange(newDayHours);
  };

  const handleDaysChange = (days: string[]) => {
    onSelectedDaysChange(days);
    
    // Yeni seçilen günler için saatleri güncelle
    const newDayHours = { ...dayHours };
    const hoursPerDay = days.length > 0 ? dailyWorkHours / days.length : 0;
    
    weekDays.forEach(day => {
      newDayHours[day.value] = days.includes(day.value) ? hoursPerDay : 0;
    });
    
    onDayHoursChange(newDayHours);
  };

  const totalHours = Object.values(dayHours).reduce((total, hours) => total + hours, 0);

  return (
    <div className="space-y-6">
      {/* Haftalık Toplam Saat */}
      <div>
        <label className="text-gray-700 mb-2 block text-sm sm:text-base font-medium">
          Haftalık Toplam Mesai Saati
        </label>
        <input
          type="number"
          value={dailyWorkHours}
          onChange={(e) => onDailyWorkHoursChange(Math.max(0, parseInt(e.target.value) || 0))}
          min="0"
          max="168"
          disabled={isProcessing}
          className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
            isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Maksimum 168 saat (7 gün × 24 saat)
        </p>
      </div>

      {/* Gün Seçici */}
      <GunSecici
        selectedDays={selectedDays}
        onDaysChange={handleDaysChange}
        disabled={isProcessing}
        title="Aktif Çalışma Günleri"
      />

      {/* Günlük Detaylar */}
      {selectedDays.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-gray-700 font-medium text-sm sm:text-base">
            Günlük Saat Dağılımı
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weekDays
              .filter(day => selectedDays.includes(day.value))
              .map(day => (
                <div key={day.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {day.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={dayHours[day.value] || 0}
                      onChange={(e) => handleDayHourChange(day.value, Math.max(0, parseFloat(e.target.value) || 0))}
                      min="0"
                      max="24"
                      step="0.5"
                      disabled={isProcessing}
                      className={`w-16 text-center rounded border-gray-300 text-sm ${
                        isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="text-xs text-gray-500">saat</span>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Toplam Özet */}
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-medium text-blue-800">Toplam Haftalık Saat:</span>
            <span className="font-bold text-blue-900">{totalHours.toFixed(1)} saat</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesaiAyarlariFormu; 