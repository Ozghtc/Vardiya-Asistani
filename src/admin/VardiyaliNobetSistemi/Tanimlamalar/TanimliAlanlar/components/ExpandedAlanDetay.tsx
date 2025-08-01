import React from 'react';
import { ExpandedAlanDetayProps } from '../types/TanimliAlanlar.types';
import GunlukVardiyaGruplari from './GunlukVardiyaGruplari';

const ExpandedAlanDetay: React.FC<ExpandedAlanDetayProps> = ({ alan }) => {
  return (
    <div className="px-4 pb-4 border-t border-gray-100">
      <div className="mt-4 space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Alan Bilgileri</h4>
          <p className="text-sm text-gray-600">{alan.aciklama || 'Açıklama eklenmemiş'}</p>
          <p className="text-sm text-gray-600">Aktif Günler: {alan.activeDays} gün</p>
        </div>
        
        {alan.parsedVardiyalar && alan.parsedVardiyalar.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Günlük Vardiya Grupları</h4>
            <GunlukVardiyaGruplari parsedVardiyalar={alan.parsedVardiyalar} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandedAlanDetay; 