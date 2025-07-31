import React from 'react';
import QuickShiftButton from '../../../../../components/shifts/QuickShiftButton';
import { HizliVardiyaEklemeProps, QuickShiftConfig } from '../types/VardiyaTanimlama.types';

const HizliVardiyaEkleme: React.FC<HizliVardiyaEklemeProps> = ({ 
  shifts, 
  onQuickAdd, 
  loading 
}) => {
  const quickShifts: QuickShiftConfig[] = [
    {
      name: "GÜNDÜZ",
      startHour: "08:00",
      endHour: "16:00"
    },
    {
      name: "AKŞAM", 
      startHour: "16:00",
      endHour: "24:00"
    },
    {
      name: "GECE",
      startHour: "00:00", 
      endHour: "08:00"
    },
    {
      name: "24 SAAT",
      startHour: "08:00",
      endHour: "08:00"
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Hızlı Vardiya Ekleme</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickShifts.map((shift) => (
          <QuickShiftButton
            key={shift.name}
            name={shift.name}
            startHour={shift.startHour}
            endHour={shift.endHour}
            isDisabled={
              loading || 
              shifts.some(s => s.vardiya_adi.toUpperCase() === shift.name)
            }
            onAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
};

export default HizliVardiyaEkleme; 