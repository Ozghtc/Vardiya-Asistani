import React from 'react';
import { GunlukVardiyaGruplariProps } from '../types/TanimliAlanlar.types';
import { weekDays } from '../constants/alanConstants';
import { createGunlukVardiyaGruplari } from '../utils/alanDataParser';
import { getGunVardiyalari } from '../utils/alanCalculations';

const GunlukVardiyaGruplari: React.FC<GunlukVardiyaGruplariProps> = ({ parsedVardiyalar }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {weekDays.map((gunAdi) => {
        // Bu güne ait vardiyaları al
        const gunVardiyalari = getGunVardiyalari(parsedVardiyalar, gunAdi);
        
        if (gunVardiyalari.length === 0) {
          return (
            <div key={gunAdi} className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
              <div className="font-medium text-sm text-gray-900">{gunAdi}</div>
              <div className="text-xs text-gray-500 mt-1">Vardiya yok</div>
            </div>
          );
        }
        
        // Bu gün için vardiyaları tip ve saatlerine göre grupla
        const gunVardiyaGruplari = createGunlukVardiyaGruplari(gunVardiyalari);
        
        return (
          <div key={gunAdi} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="font-medium text-sm text-gray-900 mb-2">{gunAdi}</div>
            <div className="space-y-1">
              {gunVardiyaGruplari.map((grup, index) => (
                <div key={index} className="text-xs bg-white rounded p-1 border">
                  <div className="font-medium">{grup.count} adet {grup.name}</div>
                  <div className="text-gray-600">{grup.hours} • {grup.duration} saat</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GunlukVardiyaGruplari; 