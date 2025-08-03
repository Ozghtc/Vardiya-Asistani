import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Shift } from '../types/AlanTanimla.types';
import { vardiyalar } from '../constants/alanConstants';
import GunSecici from './GunSecici';
import { generateId } from '../utils/alanHelpers';
import { calculateShiftHours } from '../utils/alanCalculations';

interface VardiyaEklemeFormuProps {
  selectedShift: string;
  selectedShiftDays: string[];
  onSelectedShiftChange: (shift: string) => void;
  onSelectedShiftDaysChange: (days: string[]) => void;
  onAddShift: (shift: Shift) => void;
  onGoBack: () => void;
  isProcessing?: boolean;
}

const VardiyaEklemeFormu: React.FC<VardiyaEklemeFormuProps> = ({
  selectedShift,
  selectedShiftDays,
  onSelectedShiftChange,
  onSelectedShiftDaysChange,
  onAddShift,
  onGoBack,
  isProcessing = false
}) => {
  const selectedVardiya = vardiyalar.find(v => v.name === selectedShift);
  const shiftHours = selectedVardiya ? calculateShiftHours(selectedVardiya.start, selectedVardiya.end) : 0;
  const totalWeeklyHours = shiftHours * selectedShiftDays.length;

  const handleAddShift = () => {
    if (selectedVardiya && selectedShiftDays.length > 0) {
      const newShift: Shift = {
        id: generateId(),
        name: selectedVardiya.name,
        start: selectedVardiya.start,
        end: selectedVardiya.end,
        days: selectedShiftDays,
        hours: shiftHours
      };
      
      onAddShift(newShift);
      onSelectedShiftDaysChange([]);
    }
  };

  const canAddShift = selectedVardiya && selectedShiftDays.length > 0 && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoBack}
          disabled={isProcessing}
          className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Geri</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          Vardiya Ekle
        </h3>
      </div>

      {/* Vardiya Seçimi */}
      <div>
        <label className="text-gray-700 mb-3 block text-sm sm:text-base font-medium">
          Vardiya Tipi Seçin
        </label>
        <div className="space-y-2">
          {vardiyalar.map((vardiya) => {
            const hours = calculateShiftHours(vardiya.start, vardiya.end);
            return (
              <label
                key={vardiya.name}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-all
                  ${selectedShift === vardiya.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="radio"
                  name="vardiya"
                  value={vardiya.name}
                  checked={selectedShift === vardiya.name}
                  onChange={(e) => onSelectedShiftChange(e.target.value)}
                  disabled={isProcessing}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {vardiya.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {hours} saat - {vardiya.start} / {vardiya.end}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedShift === vardiya.name
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedShift === vardiya.name && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Gün Seçimi */}
      <GunSecici
        selectedDays={selectedShiftDays}
        onDaysChange={onSelectedShiftDaysChange}
        disabled={isProcessing}
        title="Bu Vardiya Hangi Günlerde Çalışacak?"
      />

      {/* Özet */}
      {selectedVardiya && selectedShiftDays.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-2">Vardiya Özeti</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Vardiya: {selectedVardiya.name}</div>
            <div>Günlük Saat: {shiftHours} saat</div>
            <div>Çalışma Günü: {selectedShiftDays.length} gün</div>
            <div className="font-medium text-gray-800 pt-1 border-t">
              Haftalık Toplam: {totalWeeklyHours} saat
            </div>
          </div>
        </div>
      )}

      {/* Ekle Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleAddShift}
          disabled={!canAddShift}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${canAddShift
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Plus className="w-4 h-4" />
          Vardiya Ekle
        </button>
      </div>
    </div>
  );
};

export default VardiyaEklemeFormu; 