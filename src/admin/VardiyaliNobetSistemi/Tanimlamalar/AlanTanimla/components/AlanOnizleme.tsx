import React from 'react';
import { AlanOnizlemeProps } from '../types/AlanTanimla.types';
import { weekDays } from '../constants/alanConstants';

const AlanOnizleme: React.FC<AlanOnizlemeProps> = ({
  areas,
  showShiftAddition,
  selectedDays,
  onGetAddedHoursForDay,
  onGetRemainingHoursForDay,
  onGetShiftsForDay,
  onGetWeeklyTotalHours
}) => {
  if (areas.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">Tanımlı Alanlar</h2>
      <div className="space-y-3">
        {areas.map((area) => (
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
                <p className="text-sm text-gray-600">Haftalık: {onGetWeeklyTotalHours()} saat</p>
                <p className="text-xs text-gray-500">{area.activeDays.length} gün aktif</p>
              </div>
            </div>

            {/* Günlük Mesai Bilgileri - Sadece vardiya ekleme aşamasında görünür */}
            {showShiftAddition && area.dayHours && Object.keys(area.dayHours).length > 0 && (
              <div className="p-3 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Günlük Toplam Mesailer</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                  {weekDays.map((day) => {
                    const dayHour = area.dayHours[day.value] || 0;
                    const isActive = area.activeDays.includes(day.value);
                    const addedHours = onGetAddedHoursForDay(day.value);
                    const remainingHours = onGetRemainingHoursForDay(day.value);
                    const dayShifts = onGetShiftsForDay(day.value);
                    
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
                          
                          {/* Vardiya bilgileri - Tek sıra halinde */}
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
  );
};

export default AlanOnizleme; 