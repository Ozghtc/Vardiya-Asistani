import React from 'react';
import { colorMap } from '../constants/alanConstants';

interface RenkSeciciProps {
  selectedColor: string;
  usedColors: string[];
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

const RenkSecici: React.FC<RenkSeciciProps> = ({
  selectedColor,
  usedColors,
  onColorSelect,
  disabled = false
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
              onClick={() => !isUsed && !disabled ? onColorSelect(color) : null}
              disabled={disabled || (isUsed && !isSelected)}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 relative transition-all duration-200
                ${isSelected 
                  ? 'border-gray-800 shadow-lg scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${(isUsed && !isSelected) || disabled
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'cursor-pointer hover:scale-105'
                }
              `}
              style={{ backgroundColor: color }}
              title={`${name}${isUsed && !isSelected ? ' (Kullanılıyor)' : ''}`}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
                </div>
              )}
              {isUsed && !isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-gray-600 transform rotate-45"></div>
                  <div className="w-4 h-0.5 bg-gray-600 transform -rotate-45 absolute"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RenkSecici; 