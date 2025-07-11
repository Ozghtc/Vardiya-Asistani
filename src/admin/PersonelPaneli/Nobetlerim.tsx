import React from 'react';
import { Calendar } from 'lucide-react';

const Nobetlerim: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Nöbet Programım</h2>
      </div>
      
      <div className="text-center text-gray-500 py-8">
        Yaklaşan nöbetleriniz burada listelenecek
      </div>
    </div>
  );
};

export default Nobetlerim;