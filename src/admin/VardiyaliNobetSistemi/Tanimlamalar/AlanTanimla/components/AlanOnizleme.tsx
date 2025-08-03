import React from 'react';
import { Check, Clock, Save, X } from 'lucide-react';
import { Area } from '../types/AlanTanimla.types';
import { colorMap } from '../constants/alanConstants';
import { formatDayNames } from '../utils/alanHelpers';

interface AlanOnizlemeProps {
  areas: Area[];
  onRemoveArea: (areaId: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isProcessing: boolean;
}

const AlanOnizleme: React.FC<AlanOnizlemeProps> = ({
  areas,
  onRemoveArea,
  onSave,
  isSaving,
  isProcessing
}) => {
  if (areas.length === 0) {
    return null;
  }

  const totalHours = areas.reduce((total, area) => total + area.dailyHours, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          Tanımlanan Alanlar ({areas.length})
        </h3>
        <div className="text-sm text-gray-600">
          Toplam: {totalHours} saat/hafta
        </div>
      </div>

      <div className="space-y-3">
        {areas.map((area, index) => (
          <div
            key={area.id}
            className="p-4 bg-white border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            style={{ borderLeftColor: area.color }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <h4 className="font-semibold text-gray-800">
                    {index + 1}. {area.name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    ({colorMap[area.color as keyof typeof colorMap]})
                  </span>
                </div>
                
                {area.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {area.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{area.dailyHours} saat/hafta</span>
                  </div>
                  <div>
                    <span>Aktif Günler: {formatDayNames(area.activeDays)}</span>
                  </div>
                  <div>
                    <span>Vardiya Sayısı: {area.shifts.length}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onRemoveArea(area.id)}
                disabled={isProcessing}
                className={`ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Alanı kaldır"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onSave}
          disabled={isSaving || isProcessing || areas.length === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${isSaving || isProcessing || areas.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
            }
          `}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Kaydediliyor...' : `${areas.length} Alanı Kaydet`}
        </button>
      </div>
    </div>
  );
};

export default AlanOnizleme; 