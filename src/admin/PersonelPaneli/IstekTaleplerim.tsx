import React from 'react';
import { FileText, Plus } from 'lucide-react';

const IstekTaleplerim: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">İstek ve İzin Taleplerim</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Yeni Talep
        </button>
      </div>
      
      <div className="text-center text-gray-500 py-8">
        İzin ve nöbet talepleriniz burada listelenecek
      </div>
    </div>
  );
};

export default IstekTaleplerim;