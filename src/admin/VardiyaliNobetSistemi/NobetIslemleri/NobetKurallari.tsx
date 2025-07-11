import React from 'react';
import NobetNavigation from './NobetNavigation';
import NobetKurallariV2 from './NobetKurallariV2';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NobetKurallari: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
      </div>
      <NobetNavigation />
      <NobetKurallariV2 />
    </div>
  );
};

export default NobetKurallari;