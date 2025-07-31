import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { ManuelVardiyaFormuProps } from '../types/VardiyaTanimlama.types';

interface ManuelVardiyaFormuExtendedProps extends ManuelVardiyaFormuProps {
  name: string;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startHour: string;
  setStartHour: (hour: string) => void;
  endHour: string;
  setEndHour: (hour: string) => void;
}

const ManuelVardiyaFormu: React.FC<ManuelVardiyaFormuExtendedProps> = ({
  onSubmit,
  loading,
  error,
  name,
  handleNameChange,
  startHour,
  setStartHour,
  endHour,
  setEndHour
}) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    onSubmit(e, { name, startHour, endHour });
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">Manuel Vardiya Ekleme</h2>
      
      <div>
        <label className="block text-gray-700 mb-2">Vardiya Adı</label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="GECE, SABAH, AKŞAM 1"
          className="w-full rounded-lg border-gray-300"
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block text-gray-700 mb-2">
          <Clock className="inline-block w-5 h-5 mr-2 text-blue-600" />
          Vardiya Saatleri
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Başlangıç Saati:</label>
            <input
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="w-full rounded-lg border-gray-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bitiş Saati:</label>
            <input
              type="time"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="w-full rounded-lg border-gray-300"
              disabled={loading}
            />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Ekleniyor...' : 'Vardiya Ekle'}
      </button>
    </form>
  );
};

export default ManuelVardiyaFormu; 