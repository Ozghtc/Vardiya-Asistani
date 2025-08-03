import React from 'react';
import { useCapitalization } from '../../../../../hooks/useCapitalization';
import RenkSecici from './RenkSecici';

interface AlanBilgileriFormuProps {
  alanAdi: string;
  description: string;
  selectedColor: string;
  usedColors: string[];
  onAlanAdiChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColorSelect: (color: string) => void;
  isProcessing?: boolean;
}

const AlanBilgileriFormu: React.FC<AlanBilgileriFormuProps> = ({
  alanAdi,
  description,
  selectedColor,
  usedColors,
  onAlanAdiChange,
  onDescriptionChange,
  onColorSelect,
  isProcessing = false
}) => {
  const [name, handleNameChange] = useCapitalization(alanAdi);
  
  // Sync with parent
  React.useEffect(() => {
    if (name !== alanAdi) {
      onAlanAdiChange(name);
    }
  }, [name, alanAdi, onAlanAdiChange]);

  const handleDescriptionTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Alan Adı */}
      <div>
        <label className="text-gray-700 mb-2 block text-sm sm:text-base">
          Alan Adı *
        </label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="ÖRN: KIRMIZI ALAN, GÖZLEM ODASI"
          disabled={isProcessing}
          className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
            isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>

      {/* Renk Seçici */}
      <RenkSecici
        selectedColor={selectedColor}
        usedColors={usedColors}
        onColorSelect={onColorSelect}
        disabled={isProcessing}
      />

      {/* Açıklama */}
      <div>
        <label className="text-gray-700 mb-2 block text-sm sm:text-base">
          Açıklama
        </label>
        <textarea
          value={description}
          onChange={handleDescriptionTextareaChange}
          placeholder="ALAN HAKKINDA DETAYLI BİLGİ..."
          rows={3}
          disabled={isProcessing}
          className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 resize-none ${
            isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default AlanBilgileriFormu; 