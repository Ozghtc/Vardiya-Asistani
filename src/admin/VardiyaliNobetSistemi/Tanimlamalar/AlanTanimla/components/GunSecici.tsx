import React from 'react';
import { weekDays } from '../constants/alanConstants';

interface GunSeciciProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

const GunSecici: React.FC<GunSeciciProps> = ({
  selectedDays,
  onDaysChange,
  disabled = false,
  className = '',
  title = 'Aktif Günleri Seçin'
}) => {
  const handleDayToggle = (dayValue: string) => {
    if (disabled) return;
    
    if (selectedDays.includes(dayValue)) {
      onDaysChange(selectedDays.filter(day => day !== dayValue));
    } else {
      onDaysChange([...selectedDays, dayValue]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onDaysChange(weekDays.map(day => day.value));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onDaysChange([]);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-gray-700 text-sm sm:text-base font-medium">
          {title}
        </label>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tümü
          </button>
          <span className="text-gray-400">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Temizle
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => handleDayToggle(day.value)}
            disabled={disabled}
            className={`
              px-2 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200
              ${selectedDays.includes(day.value)
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }
              ${disabled 
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:scale-105'
              }
            `}
          >
            {day.label.substring(0, 3)}
          </button>
        ))}
      </div>
      
      {selectedDays.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          Seçili: {selectedDays.length} gün
        </div>
      )}
    </div>
  );
};

export default GunSecici; 