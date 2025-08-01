import React from 'react';
import { Check, X } from 'lucide-react';
import { RenkSeciciProps } from '../types/AlanTanimla.types';
import { colorMap } from '../constants/alanConstants';

const RenkSecici: React.FC<RenkSeciciProps> = ({
  selectedColor,
  usedColors,
  isProcessing,
  onColorSelect
}) => {
  return (
    <div>
      <label className="text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
        Temsili Renk
        {selectedColor && (
          <span className="font-bold" style={{ color: selectedColor }}>
            ({colorMap[selectedColor as keyof typeof colorMap]})
          </span>
        )}
      </label>
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-3">
        {Object.entries(colorMap).map(([color, name]) => {
          const isUsed = usedColors.includes(color);
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={color}
              type="button"
              onClick={() => !isUsed && !isProcessing && onColorSelect(color)}
              className={`relative group ${isUsed || isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              title={isUsed ? `${name} (Kullanımda)` : isProcessing ? 'İşlem devam ediyor' : name}
              disabled={isUsed || isProcessing}
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-all ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 scale-110' 
                    : isUsed || isProcessing
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
  );
};

export default RenkSecici; 