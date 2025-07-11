import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import QuickShiftButton from '../../../components/shifts/QuickShiftButton';
import { SuccessNotification } from '../../../components/ui/Notification';
import TanimliVardiyalar from './TanimliVardiyalar';

interface Shift {
  id: number;
  name: string;
  startHour: string;
  endHour: string;
  calismaSaati: number;
}

const VardiyaTanimlama: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, handleNameChange] = useCapitalization('');
  const [startHour, setStartHour] = useState<string>('');
  const [endHour, setEndHour] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load shifts from localStorage
    const savedShifts = JSON.parse(localStorage.getItem('shifts') || '[]');
    setShifts(savedShifts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vardiya adı gereklidir');
      return;
    }
    if (shifts.some(shift => shift.name === name)) {
      setError('Bu vardiya adı zaten kullanılmış');
      return;
    }
    if (!startHour || !endHour) {
      setError('Başlangıç ve bitiş saati gereklidir');
      return;
    }
    const start = new Date(`2024-01-01 ${startHour}`);
    let end = new Date(`2024-01-01 ${endHour}`);
    if (end <= start) end = new Date(`2024-01-02 ${endHour}`);
    const toplamSaat = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const newShift = {
      id: Date.now(),
      name,
      startHour,
      endHour,
      calismaSaati: Math.round(toplamSaat)
    };

    const updatedShifts = [...shifts, newShift];
    setShifts(updatedShifts);
    localStorage.setItem('shifts', JSON.stringify(updatedShifts));
    
    setError('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setStartHour('');
    setEndHour('');
  };

  const handleDelete = async (id: number | string) => {
    const updatedShifts = shifts.filter(shift => shift.id !== id);
    setShifts(updatedShifts);
    localStorage.setItem('shifts', JSON.stringify(updatedShifts));
  };

  const handleQuickAdd = async (name: string, startHour: string, endHour: string) => {
    if (shifts.some(shift => shift.name === name)) {
      setError(`${name} vardiyası zaten tanımlı`);
      setTimeout(() => setError(''), 2000);
      return;
    }
    const start = new Date(`2024-01-01 ${startHour}`);
    let end = new Date(`2024-01-01 ${endHour}`);
    if (end <= start) end = new Date(`2024-01-02 ${endHour}`);
    const toplamSaat = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const newShift = {
      id: Date.now(),
      name,
      startHour,
      endHour,
      calismaSaati: Math.round(toplamSaat)
    };

    const updatedShifts = [...shifts, newShift];
    setShifts(updatedShifts);
    localStorage.setItem('shifts', JSON.stringify(updatedShifts));
    
    setError('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Hızlı Vardiya Ekleme */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Hızlı Vardiya Ekleme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickShiftButton
              name="GÜNDÜZ"
              startHour="08:00"
              endHour="16:00"
              isDisabled={shifts.some(s => s.name.toUpperCase() === "GÜNDÜZ")}
              onAdd={handleQuickAdd}
            />
            <QuickShiftButton
              name="AKŞAM"
              startHour="16:00"
              endHour="24:00"
              isDisabled={shifts.some(s => s.name.toUpperCase() === "AKŞAM")}
              onAdd={handleQuickAdd}
            />
            <QuickShiftButton
              name="GECE"
              startHour="00:00"
              endHour="08:00"
              isDisabled={shifts.some(s => s.name.toUpperCase() === "GECE")}
              onAdd={handleQuickAdd}
            />
            <QuickShiftButton
              name="24 SAAT"
              startHour="08:00"
              endHour="08:00"
              isDisabled={shifts.some(s => s.name.toUpperCase() === "24 SAAT")}
              onAdd={handleQuickAdd}
            />
          </div>
        </div>

        {/* Manuel Vardiya Ekleme */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold">Manuel Vardiya Ekleme</h2>
          <div>
            <label className="block text-gray-700 mb-2">Vardiya Adı</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="GECE, SABAH, AKŞAM 1"
              className="w-full rounded-lg border-gray-300"
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
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bitiş Saati:</label>
                <input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full rounded-lg border-gray-300"
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
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Vardiya Ekle
          </button>
        </form>
        {showSuccess && <SuccessNotification message="Vardiya başarıyla eklendi" />}
        {/* Tanımlı Vardiyalar bileşeni */}
        <TanimliVardiyalar shifts={shifts} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default VardiyaTanimlama;