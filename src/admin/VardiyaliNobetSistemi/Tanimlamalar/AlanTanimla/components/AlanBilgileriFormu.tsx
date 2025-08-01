import React from 'react';
import { AlanBilgileriFormuProps } from '../types/AlanTanimla.types';
import RenkSecici from './RenkSecici';

const AlanBilgileriFormu: React.FC<AlanBilgileriFormuProps> = ({
  name,
  description,
  selectedColor,
  usedColors,
  isProcessing,
  onNameChange,
  onDescriptionChange,
  onColorSelect,
  onSubmit
}) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Alan Tanımla</h1>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Alan Adı</label>
              <input
                type="text"
                value={name}
                onChange={onNameChange}
                placeholder="ÖRN: KIRMIZI ALAN, GÖZLEM ODASI"
                disabled={isProcessing}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                  isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <RenkSecici
              selectedColor={selectedColor}
              usedColors={usedColors}
              isProcessing={isProcessing}
              onColorSelect={onColorSelect}
            />

            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Açıklama</label>
              <textarea
                value={description}
                onChange={onDescriptionChange}
                placeholder="ALAN HAKKINDA KISA BİR AÇIKLAMA"
                rows={4}
                disabled={isProcessing}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                  isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="pt-4">
              <button
                onClick={onSubmit}
                disabled={!name.trim() || !selectedColor || isProcessing}
                className={`w-full py-3 rounded-lg transition-colors ${
                  name.trim() && selectedColor && !isProcessing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'İşleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlanBilgileriFormu; 