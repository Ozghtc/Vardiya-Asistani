import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import ShiftItem from '../../../components/shifts/ShiftItem';

interface Shift {
  id: number;
  vardiya_adi: string;
  baslangic_saati: string;
  bitis_saati: string;
  calisma_saati: number;
  aktif_mi: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

interface TanimliVardiyalarProps {
  shifts: Shift[];
  onDelete: (id: number | string) => void;
}

const TanimliVardiyalar: React.FC<TanimliVardiyalarProps> = ({ shifts, onDelete }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Tanımlı Vardiyalar</h2>
      {shifts.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Henüz vardiya tanımlanmadı</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <ShiftItem 
              key={shift.id} 
              shift={shift} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TanimliVardiyalar; 