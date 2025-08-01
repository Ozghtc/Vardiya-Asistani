import React from 'react';
import { MapPin, Settings } from 'lucide-react';
import { EmptyStateProps } from '../types/TanimliAlanlar.types';

const EmptyState: React.FC<EmptyStateProps> = ({ onNavigateToDefinitions }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Alan Tanımlanmamış</h3>
      <p className="text-gray-600 mb-6">Vardiya sistemi için önce alanları tanımlamanız gerekiyor.</p>
      <button
        onClick={onNavigateToDefinitions}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span>Alan Tanımlamaya Git</span>
      </button>
    </div>
  );
};

export default EmptyState; 