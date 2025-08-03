import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Unvan, UnvanFormData } from '../types/UnvanTanimlama.types';

interface UnvanYonetimiProps {
  unvanlar: Unvan[];
  loading: boolean;
  error: string | null;
  onUnvanEkle: (unvanData: UnvanFormData) => Promise<void>;
  onUnvanSil: (unvanId: number) => Promise<void>;
}

const UnvanYonetimi: React.FC<UnvanYonetimiProps> = ({
  unvanlar,
  loading,
  error,
  onUnvanEkle,
  onUnvanSil
}) => {
  const [yeniUnvan, setYeniUnvan] = useState('');

  const handleSubmit = async () => {
    if (!yeniUnvan.trim()) return;
    
    await onUnvanEkle({ yeniUnvan });
    setYeniUnvan('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Personel Ünvan Tanımları
      </h2>

      {/* Yeni Ünvan Ekleme */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={yeniUnvan}
          onChange={(e) => setYeniUnvan(e.target.value)}
          placeholder="YENİ ÜNVAN GİRİN"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          +
        </button>
      </div>

      {/* Ünvan Listesi */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unvanlar.map((unvan) => (
            <div key={unvan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-800">{unvan.unvan_adi}</span>
              <button
                onClick={() => onUnvanSil(unvan.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {unvanlar.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Henüz tanımlanmış ünvan bulunmuyor</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnvanYonetimi; 