import React from 'react';
import { Check } from 'lucide-react';
import { GunSeciciProps } from '../types/AlanTanimla.types';
import { weekDays } from '../constants/alanConstants';

const GunSecici: React.FC<GunSeciciProps> = ({
  selectedDays,
  dayHours,
  dailyWorkHours,
  isProcessing,
  onToggleDay,
  onToggleAllDays,
  onUpdateDayHour,
  onUpdateAllDaysHours,
  onSetDailyWorkHours
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Günlük Toplam Mesai Saati
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={dailyWorkHours}
              onChange={(e) => onSetDailyWorkHours(Number(e.target.value))}
              disabled={isProcessing}
              className={`w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <button
              onClick={onUpdateAllDaysHours}
              disabled={isProcessing}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'İşleniyor...' : 'Tüm Günlere Uygula'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Günler</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAllDays}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                selectedDays.length === weekDays.length
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                selectedDays.length === weekDays.length
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-400'
              }`}>
                {selectedDays.length === weekDays.length && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              Tümünü Seç
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {weekDays.map((day) => {
            const isSelected = selectedDays.includes(day.value);
            const dayHour = dayHours[day.value] || 0;
            
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
                    onClick={() => onToggleDay(day.value)}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 w-full text-left ${
                      isSelected ? 'text-blue-800' : 'text-gray-600'
                    } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
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
                      onChange={(e) => onUpdateDayHour(day.value, Number(e.target.value))}
                      disabled={isProcessing}
                      className={`w-full px-3 py-2 text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                        isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
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
  );
};

export default GunSecici; 