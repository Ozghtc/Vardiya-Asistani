import React from 'react';
import { BarChart } from 'lucide-react';
import { GenelRaporProps } from '../types/TanimliAlanlar.types';

const GenelRapor: React.FC<GenelRaporProps> = ({ genelToplam, formatNumber }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Genel Rapor</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(genelToplam.haftalikSaat)}</div>
          <div className="text-sm text-gray-600">Haftalık: {formatNumber(genelToplam.haftalikSaat)} Saat • {formatNumber(genelToplam.haftalikVardiya)} Vardiya</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{formatNumber(genelToplam.aylikSaat)}</div>
          <div className="text-sm text-gray-600">30 Günlük: {formatNumber(genelToplam.aylikSaat)} Saat • {formatNumber(genelToplam.aylikVardiya)} Vardiya</div>
        </div>
      </div>
    </div>
  );
};

export default GenelRapor; 