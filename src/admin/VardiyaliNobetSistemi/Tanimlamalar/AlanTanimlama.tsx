import React, { useState, useEffect } from 'react';
import { Plus, MapPin, ArrowLeft, Check, Clock, Trash2, Save, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { SuccessNotification } from '../../../components/ui/Notification';
import TanimliAlanlar from './TanimliAlanlar';

const colorMap = {
  '#DC2626': 'Kırmızı',
  '#059669': 'Yeşil', 
  '#2563EB': 'Mavi',
  '#7C3AED': 'Mor',
  '#EA580C': 'Turuncu',
  '#CA8A04': 'Sarı',
  '#DB2777': 'Pembe',
  '#0891B2': 'Turkuaz',
  '#4B5563': 'Gri',
  '#312E81': 'Lacivert',
  '#991B1B': 'Bordo',
  '#166534': 'Koyu Yeşil',
  '#1E40AF': 'Kraliyet Mavisi',
  '#92400E': 'Kahverengi',
  '#4338CA': 'İndigo',
  '#6B21A8': 'Mor',
  '#0F766E': 'Çam Yeşili',
  '#3730A3': 'Gece Mavisi',
  '#9F1239': 'Vişne',
  '#1F2937': 'Antrasit',
  '#831843': 'Magenta',
  '#115E59': 'Okyanus',
  '#86198F': 'Fuşya',
  '#374151': 'Kömür'
} as const;

interface DayShift {
  name: string;
  hours: string;
  duration: number;
  Vardiya: number;
}

interface DayState {
  totalHours: number;
  remainingHours: number;
  shifts: DayShift[];
  isSaved: boolean;
  isActive: boolean;
}

interface Area {
  id: number;
  name: string;
  description: string;
  color: string;
  dailyWorkHours: number;
  shifts: Record<string, DayState>;
  nobetler: { saat: number; name: string; hours: string; gunler: string[] }[];
}

const vardiyalar = [
  { name: 'GÜNDÜZ', hours: '08:00 - 16:00', duration: 8 },
  { name: 'AKŞAM', hours: '16:00 - 24:00', duration: 8 },
  { name: 'GECE', hours: '00:00 - 08:00', duration: 8 },
  { name: '24 SAAT', hours: '08:00 - 08:00', duration: 24 },
  { name: 'SABAH', hours: '08:00 - 13:00', duration: 5 },
  { name: 'ÖĞLE', hours: '13:00 - 18:00', duration: 5 },
  { name: 'GEÇ', hours: '16:00 - 08:00', duration: 16 },
  { name: 'GÜNDÜZ UZUN', hours: '08:00 - 00:00', duration: 16 }
];

const weekDays = [
  { value: 'Pazartesi', name: 'Pazartesi', short: 'Pzt' },
  { value: 'Salı', name: 'Salı', short: 'Sal' },
  { value: 'Çarşamba', name: 'Çarşamba', short: 'Çar' },
  { value: 'Perşembe', name: 'Perşembe', short: 'Per' },
  { value: 'Cuma', name: 'Cuma', short: 'Cum' },
  { value: 'Cumartesi', name: 'Cumartesi', short: 'Cmt' },
  { value: 'Pazar', name: 'Pazar', short: 'Paz' }
];

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const Toast = React.memo(({ message, show, onClose }: ToastProps) => {
  if (!show) return null;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start shadow-lg rounded">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-red-500 hover:text-red-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
});

Toast.displayName = 'Toast';

const AlanTanimlama: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [name, handleNameChange] = useCapitalization('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [dailyWorkHours, setDailyWorkHours] = useState(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(weekDays.map(day => day.value));
  const [selectedShift, setSelectedShift] = useState(vardiyalar[0].name);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Textarea için ayrı handler
  const handleDescriptionTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value.toUpperCase());
  };
  
  const [dayStates, setDayStates] = useState<Record<string, DayState>>(
    weekDays.reduce((acc, day) => ({
      ...acc,
      [day.value]: {
        totalHours: dailyWorkHours,
        remainingHours: dailyWorkHours,
        shifts: [],
        isSaved: false,
        isActive: true
      }
    }), {})
  );

  useEffect(() => {
    const savedAreas = localStorage.getItem('tanimliAlanlar');
    if (savedAreas) {
      const areas = JSON.parse(savedAreas);
      setAreas(areas);
      const colors = areas.map((area: Area) => area.color);
      setUsedColors(colors);
    }
  }, []);

  useEffect(() => {
    setDayStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(day => {
        if (!updated[day].isSaved && updated[day].isActive) {
          updated[day].totalHours = dailyWorkHours;
          updated[day].remainingHours = dailyWorkHours - 
            updated[day].shifts.reduce((sum, shift) => sum + shift.duration, 0);
        }
      });
      return updated;
    });
  }, [dailyWorkHours]);

  useEffect(() => {
    const hasName = (name || '').trim().length > 0;
    const hasColor = selectedColor.length > 0;
    const hasActiveDay = Object.values(dayStates).some(state => state.isActive);
    const allActiveDaysValid = Object.entries(dayStates).every(([_, state]) => 
      !state.isActive || (state.isActive && state.shifts.length > 0 && state.remainingHours === 0 && state.isSaved)
    );

    setIsFormValid(hasName && hasColor && hasActiveDay && allActiveDaysValid);
  }, [name, selectedColor, dayStates]);

  const toggleDayActive = (day: string) => {
    setDayStates(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isActive: !prev[day].isActive,
        shifts: [],
        remainingHours: dailyWorkHours,
        isSaved: false
      }
    }));
  };

  const toggleDay = (day: string) => {
    if (!dayStates[day].isActive || dayStates[day].isSaved) return;
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddShift = () => {
    if (selectedDays.length === 0) {
      setErrorMessage('Lütfen en az bir gün seçin!');
      setShowError(true);
      return;
    }

    const shift = vardiyalar.find(v => v.name === selectedShift);
    if (!shift) return;

    let hasError = false;
    const updatedDayStates = { ...dayStates };

    selectedDays.forEach(day => {
      if (!updatedDayStates[day].isActive) return;

      const newRemainingHours = updatedDayStates[day].remainingHours - shift.duration;
      
      if (newRemainingHours < 0) {
        setErrorMessage(`${day} günü için mesai saati aşımı! Kalan: ${updatedDayStates[day].remainingHours} saat`);
        setShowError(true);
        hasError = true;
        return;
      }

      if (!hasError) {
        updatedDayStates[day] = {
          ...updatedDayStates[day],
          remainingHours: newRemainingHours,
          shifts: [...updatedDayStates[day].shifts, { ...shift, Vardiya: 1 }]
        };
      }
    });

    if (!hasError) {
      setDayStates(updatedDayStates);
      setSelectedDays(weekDays.map(day => day.value));
    }
  };

  const removeShift = (day: string, index: number) => {
    if (!dayStates[day].isActive || dayStates[day].isSaved) return;
    
    setDayStates(prev => {
      const updated = { ...prev };
      const removedShift = updated[day].shifts[index];
      updated[day] = {
        ...updated[day],
        remainingHours: updated[day].remainingHours + removedShift.duration,
        shifts: updated[day].shifts.filter((_, i) => i !== index)
      };
      return updated;
    });
  };

  const handleSaveDay = (day: string) => {
    const state = dayStates[day];
    
    if (!state.isActive) {
      setErrorMessage('Bu gün aktif değil!');
      setShowError(true);
      return;
    }

    if (state.remainingHours !== 0) {
      setErrorMessage('Günlük mesai saati tamamlanmadan kayıt yapılamaz!');
      setShowError(true);
      return;
    }

    setDayStates(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isSaved: true
      }
    }));
  };

  const handleSaveArea = () => {
    // Güvenli string kontrolleri
    const safeName = name || '';
    const safeDescription = description || '';
    
    if (!safeName.trim()) {
      setErrorMessage('Alan adı zorunludur!');
      setShowError(true);
      return;
    }

    if (!selectedColor) {
      setErrorMessage('Lütfen bir renk seçin!');
      setShowError(true);
      return;
    }

    if (!Object.values(dayStates).some(state => state.isActive)) {
      setErrorMessage('En az bir aktif gün seçmelisiniz!');
      setShowError(true);
      return;
    }

    if (!isFormValid) {
      setErrorMessage('Lütfen tüm gerekli alanları doldurun ve aktif günlerin vardiyalarını kaydedin!');
      setShowError(true);
      return;
    }

    const nobetler: { saat: number; name: string; hours: string; gunler: string[] }[] = [];
    Object.entries(dayStates).forEach(([day, state]) => {
      if (state.isActive && state.shifts && state.shifts.length > 0) {
        state.shifts.forEach((shift) => {
          let found = nobetler.find(n => n.saat === shift.duration && n.name === shift.name && n.hours === shift.hours);
          if (found) {
            found.gunler.push(day);
          } else {
            nobetler.push({ saat: shift.duration, name: shift.name, hours: shift.hours, gunler: [day] });
          }
        });
      }
    });

    const newArea: Area = {
      id: Date.now(),
      name: safeName.trim(),
      color: selectedColor,
      description: safeDescription.trim(),
      dailyWorkHours,
      shifts: dayStates,
      nobetler
    };

    const updatedAreas = [...areas, newArea];
    setAreas(updatedAreas);
    localStorage.setItem('tanimliAlanlar', JSON.stringify(updatedAreas));
    
    handleNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setDescription('');
    setSelectedColor('');
    setDailyWorkHours(40);
    setDayStates(weekDays.reduce((acc, day) => ({
      ...acc,
      [day.value]: {
        totalHours: 40,
        remainingHours: 40,
        shifts: [],
        isSaved: false,
        isActive: true
      }
    }), {}));
    
    setSelectedDays(weekDays.map(day => day.value));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleRemoveArea = (id: number) => {
    const updatedAreas = areas.filter(area => area.id !== id);
    setAreas(updatedAreas);
    localStorage.setItem('tanimliAlanlar', JSON.stringify(updatedAreas));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <Toast 
        message={errorMessage}
        show={showError}
        onClose={() => setShowError(false)}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Alan Tanımla</h1>
        <Link
          to="/programlar/vardiyali-nobet/alan-yonetimi"
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Geri Dön</span>
        </Link>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Alan Adı</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="ÖRN: KIRMIZI ALAN, GÖZLEM ODASI"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                Temsili Renk
                {selectedColor && (
                  <span className="font-bold" style={{ color: selectedColor }}>
                    ({colorMap[selectedColor as keyof typeof colorMap]})
                  </span>
                )}
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-3">
                {Object.entries(colorMap).map(([color, name]) => {
                  const isUsed = usedColors.includes(color);
                  const isSelected = selectedColor === color;
                  
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => !isUsed && setSelectedColor(color)}
                      className={`relative group ${isUsed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      title={isUsed ? `${name} (Kullanımda)` : name}
                      disabled={isUsed}
                    >
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-all ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 scale-110' 
                            : isUsed
                            ? 'opacity-50'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                        {isUsed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Açıklama</label>
              <textarea
                value={description}
                onChange={handleDescriptionTextareaChange}
                placeholder="ALAN HAKKINDA KISA BİR AÇIKLAMA"
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold">Vardiya ve Mesai Ayarları</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Günlük Toplam Mesai Saati
                </label>
                <input
                  type="number"
                  value={dailyWorkHours}
                  onChange={(e) => setDailyWorkHours(Number(e.target.value))}
                  className="w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktif Günler
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDayActive(day.value)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      dayStates[day.value].isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vardiya Eklenecek Günler
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    disabled={!dayStates[day.value].isActive || dayStates[day.value].isSaved}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      !dayStates[day.value].isActive
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : dayStates[day.value].isSaved
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedDays.includes(day.value)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-white border hover:bg-blue-50'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                {vardiyalar.map((shift) => {
                  const start = new Date(`2024-01-01 ${shift.hours.split(' - ')[0]}`);
                  let end = new Date(`2024-01-01 ${shift.hours.split(' - ')[1]}`);
                  if (end <= start) {
                    end = new Date(`2024-01-02 ${shift.hours.split(' - ')[1]}`);
                  }
                  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  
                  return (
                    <option key={shift.name} value={shift.name}>
                      {shift.name} ({shift.hours}) = {hours} Saat
                    </option>
                  );
                })}
              </select>
              <button
                onClick={handleAddShift}
                disabled={selectedDays.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weekDays.map((day) => {
                const dayState = dayStates[day.value];
                
                return (
                  <div 
                    key={day.value}
                    className={`p-4 rounded-lg ${
                      !dayState.isActive
                        ? 'bg-gray-50 opacity-50'
                        : dayState.isSaved 
                        ? 'bg-gray-50' 
                        : 'bg-white border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{day.name}</h3>
                      {dayState.isActive && !dayState.isSaved && dayState.shifts.length > 0 && (
                        <button
                          onClick={() => handleSaveDay(day.value)}
                          disabled={dayState.remainingHours !== 0}
                          className={`p-1 ${
                            dayState.remainingHours === 0
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={
                            dayState.remainingHours === 0
                              ? 'Günü Kaydet'
                              : 'Mesai tamamlanmadan kayıt yapılamaz'
                          }
                        >
                          <Save className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    {dayState.isActive ? (
                      <>
                        <div className={`text-sm ${
                          dayState.remainingHours === 0 
                            ? 'text-green-600' 
                            : 'text-gray-500'
                        } mb-2`}>
                          Kalan: {dayState.remainingHours} saat
                        </div>

                        <div className="space-y-2">
                          {dayState.shifts.length === 0 ? (
                            <div className="text-gray-400">Henüz vardiya eklenmedi</div>
                          ) : (
                            dayState.shifts.map((shift, index) => (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-2 bg-blue-50 text-blue-600 rounded"
                              >
                                <span>
                                  {shift.name} ({shift.hours}) ({shift.Vardiya} Vardiya)
                                </span>
                                {!dayState.isSaved && (
                                  <button
                                    onClick={() => removeShift(day.value, index)}
                                    className="p-1 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400">Bu gün kapalı</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveArea}
          disabled={!isFormValid}
          className={`w-full mt-6 py-3 rounded-lg transition-colors ${
            isFormValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Alanı Kaydet
        </button>

        {!isFormValid && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <p className="ml-3 text-sm text-yellow-700">
                Lütfen tüm gerekli alanları doldurun ve aktif günlerin vardiyalarını kaydedin.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tanımlı Alanlar */}
      <div className="mt-8">
        <TanimliAlanlar />
      </div>

      {showSuccess && <SuccessNotification message="Alan başarıyla eklendi" />}
    </div>
  );
};

export default AlanTanimlama;