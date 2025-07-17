import React, { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';

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

interface Area {
  id: string;
  name: string;
  color: string;
  description: string;
  dailyHours: number;
  activeDays: string[];
  dayHours: DayHours;
  shifts: Shift[];
}

interface DayHours {
  [key: string]: number;
}

interface Shift {
  id: string;
  name: string;
  hours: string;
  duration: number;
  days: string[];
}

const weekDays = [
  { value: 'Pazartesi', name: 'Pazartesi', short: 'Pzt' },
  { value: 'Salı', name: 'Salı', short: 'Sal' },
  { value: 'Çarşamba', name: 'Çarşamba', short: 'Çar' },
  { value: 'Perşembe', name: 'Perşembe', short: 'Per' },
  { value: 'Cuma', name: 'Cuma', short: 'Cum' },
  { value: 'Cumartesi', name: 'Cumartesi', short: 'Cmt' },
  { value: 'Pazar', name: 'Pazar', short: 'Paz' }
];

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

const YeniAlan: React.FC = () => {
  const [name, handleNameChange] = useCapitalization('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [showShiftSettings, setShowShiftSettings] = useState(false);
  const [showShiftAddition, setShowShiftAddition] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [dailyWorkHours, setDailyWorkHours] = useState(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(weekDays.map(day => day.value));
  const [dayHours, setDayHours] = useState<DayHours>(
    weekDays.reduce((acc, day) => ({ ...acc, [day.value]: 40 }), {})
  );
  const [selectedShift, setSelectedShift] = useState(vardiyalar[0].name);
  const [selectedShiftDays, setSelectedShiftDays] = useState<string[]>([]);

  // Textarea için ayrı handler
  const handleDescriptionTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value.toUpperCase());
  };

  const handleAddArea = () => {
    if (!name.trim() || !selectedColor) {
      alert('Lütfen alan adı ve renk seçin!');
      return;
    }

    const newArea: Area = {
      id: Date.now().toString(),
      name: name.trim(),
      color: selectedColor,
      description: description.trim(),
      dailyHours: dailyWorkHours,
      activeDays: [...selectedDays],
      dayHours: { ...dayHours },
      shifts: []
    };

    setAreas([...areas, newArea]);
    setShowShiftSettings(true);
    
    // Form reset
    handleNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setDescription('');
    setSelectedColor('');
  };

  const handleAddShiftSettings = () => {
    if (selectedDays.length === 0) {
      alert('Lütfen en az bir gün seçin!');
      return;
    }

    // Son eklenen alanı güncelle
    setAreas(prevAreas => {
      const updatedAreas = [...prevAreas];
      if (updatedAreas.length > 0) {
        const lastArea = updatedAreas[updatedAreas.length - 1];
        lastArea.activeDays = [...selectedDays];
        lastArea.dayHours = { ...dayHours };
        lastArea.dailyHours = dailyWorkHours;
        lastArea.shifts = [];
      }
      return updatedAreas;
    });

    setShowShiftAddition(true);
    setSelectedShiftDays([...selectedDays]);
  };

  const handleAddShift = () => {
    if (selectedShiftDays.length === 0) {
      alert('Lütfen en az bir gün seçin!');
      return;
    }

    const shift = vardiyalar.find(v => v.name === selectedShift);
    if (!shift) return;

    const newShift: Shift = {
      id: Date.now().toString(),
      name: shift.name,
      hours: shift.hours,
      duration: shift.duration,
      days: [...selectedShiftDays]
    };

    // Son eklenen alana vardiyayı ekle
    setAreas(prevAreas => {
      const updatedAreas = [...prevAreas];
      if (updatedAreas.length > 0) {
        const lastArea = updatedAreas[updatedAreas.length - 1];
        lastArea.shifts = [...lastArea.shifts, newShift];
      }
      return updatedAreas;
    });

    // Kalan mesai saati olan tüm günleri otomatik seç
    const remainingDays = selectedDays.filter(day => getRemainingHoursForDay(day) > 0);
    setSelectedShiftDays(remainingDays);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleAllDays = () => {
    if (selectedDays.length === weekDays.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(weekDays.map(day => day.value));
    }
  };

  const updateAllDaysHours = () => {
    const newDayHours = { ...dayHours };
    weekDays.forEach(day => {
      newDayHours[day.value] = dailyWorkHours;
    });
    setDayHours(newDayHours);
  };

  const updateDayHour = (day: string, hours: number) => {
    setDayHours(prev => ({
      ...prev,
      [day]: hours
    }));
  };

  const toggleShiftDay = (day: string) => {
    setSelectedShiftDays((prev: string[]) => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Eklenmemiş günleri hesapla
  const getUnaddedDays = () => {
    if (areas.length === 0) return selectedDays;
    
    const lastArea = areas[areas.length - 1];
    if (!lastArea.shifts || lastArea.shifts.length === 0) {
      return selectedDays;
    }
    
    // Tüm vardiyalarda hangi günlerin eklendiğini topla
    const addedDays = new Set<string>();
    lastArea.shifts.forEach(shift => {
      shift.days.forEach(day => addedDays.add(day));
    });
    
    // Eklenmemiş günleri döndür
    return selectedDays.filter(day => !addedDays.has(day));
  };

  // Gün için eklenen mesai saatini hesapla
  const getAddedHoursForDay = (day: string) => {
    if (areas.length === 0) return 0;
    
    const lastArea = areas[areas.length - 1];
    if (!lastArea.shifts) return 0;
    
    return lastArea.shifts
      .filter(shift => shift.days.includes(day))
      .reduce((total, shift) => total + shift.duration, 0);
  };

  // Gün için kalan mesai saatini hesapla
  const getRemainingHoursForDay = (day: string) => {
    const totalHours = dayHours[day] || 0;
    const addedHours = getAddedHoursForDay(day);
    return Math.max(0, totalHours - addedHours);
  };

  // Gün için vardiya bilgilerini al
  const getShiftsForDay = (day: string) => {
    if (areas.length === 0) return [];
    
    const lastArea = areas[areas.length - 1];
    if (!lastArea.shifts) return [];
    
    return lastArea.shifts.filter(shift => shift.days.includes(day));
  };

  // Haftalık toplam mesai saatini hesapla
  const getWeeklyTotalHours = () => {
    return Object.values(dayHours).reduce((total, hours) => total + hours, 0);
  };

  const unaddedDays = getUnaddedDays();

  // Tüm günlerin kalan mesaisi 0 mı kontrol et
  const allDaysCompleted = selectedDays.every(day => getRemainingHoursForDay(day) === 0);

  if (showShiftSettings) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Vardiya ve Mesai Ayarları</h1>
        </div>

        {/* Alan Bilgileri */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Tanımlı Alanlar</h2>
          <div className="space-y-3">
            {areas.map((area) => (
              <div 
                key={area.id}
                className="border rounded-lg overflow-hidden"
                style={{ borderLeftColor: area.color, borderLeftWidth: '4px' }}
              >
                {/* Alan Bilgileri */}
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: area.color }}
                    ></div>
                    <div>
                      <h3 className="font-semibold">{area.name}</h3>
                      <p className="text-sm text-gray-600">{area.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Haftalık: {getWeeklyTotalHours()} saat</p>
                    <p className="text-xs text-gray-500">{area.activeDays.length} gün aktif</p>
                  </div>
                </div>

                {/* Günlük Mesai Bilgileri - Sadece vardiya ekleme aşamasında görünür */}
                {showShiftAddition && area.dayHours && Object.keys(area.dayHours).length > 0 && (
                  <div className="p-3 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Günlük Toplam Mesailer</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {weekDays.map((day) => {
                        const dayHour = area.dayHours[day.value] || 0;
                        const isActive = area.activeDays.includes(day.value);
                        const addedHours = getAddedHoursForDay(day.value);
                        const remainingHours = getRemainingHoursForDay(day.value);
                        const dayShifts = getShiftsForDay(day.value);
                        
                        return (
                          <div 
                            key={day.value}
                            className={`p-4 rounded-lg border-2 min-h-[180px] ${
                              isActive 
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="text-center space-y-2">
                              <div className="font-semibold text-lg">{day.name}</div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">T</div>
                                  <div className="text-blue-600 font-semibold">{dayHour}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Ek Mes</div>
                                  <div className="text-green-600 font-semibold">{addedHours}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Kalan Mes</div>
                                  <div className="text-red-600 font-semibold">{remainingHours}</div>
                                </div>
                              </div>
                              
                              {/* Vardiya bilgileri */}
                              {dayShifts.length > 0 && (
                                <div className="mt-3 space-y-1">
                                  {dayShifts.map((shift, index) => (
                                    <div key={index} className="text-xs bg-white p-2 rounded border">
                                      <div className="font-medium text-gray-700">
                                        {index + 1} Vardiya: {shift.name} ({shift.hours})
                                      </div>
                                      <div className="text-gray-600">{shift.duration} saat</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Vardiya Ayarları */}
        {!showShiftAddition && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold">Günlük Mesai Belirleme</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Günlük Toplam Mesai Saati
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={dailyWorkHours}
                      onChange={(e) => setDailyWorkHours(Number(e.target.value))}
                      className="w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                    <button
                      onClick={updateAllDaysHours}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Tüm Günlere Uygula
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Günler</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAllDays}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                        selectedDays.length === weekDays.length
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        selectedDays.length === weekDays.length
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-400'
                      }`}>
                        {selectedDays.length === weekDays.length && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      Tümünü Seç
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {weekDays.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    const dayHour = dayHours[day.value] || 0;
                    
                    return (
                      <div 
                        key={day.value}
                        className={`p-4 rounded-lg border-2 transition-all min-h-[120px] ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => toggleDay(day.value)}
                            className={`flex items-center gap-2 w-full text-left ${
                              isSelected ? 'text-blue-800' : 'text-gray-600'
                            }`}
                          >
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-400'
                            }`}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="font-semibold">{day.name}</span>
                          </button>
                        </div>
                        
                        {isSelected && (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-600">
                              Günlük Toplam Mesai
                            </label>
                            <input
                              type="number"
                              value={dayHour}
                              onChange={(e) => updateDayHour(day.value, Number(e.target.value))}
                              className="w-full px-3 py-2 text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                              placeholder="40"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleAddShiftSettings}
                disabled={selectedDays.length === 0}
                className={`w-full py-3 rounded-lg transition-colors ${
                  selectedDays.length > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Ekle
              </button>
            </div>
          </div>
        )}

        {/* Vardiya Ekleme Bölümü */}
        {showShiftAddition && !allDaysCompleted && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mt-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h2 className="text-base sm:text-lg font-semibold">Vardiya Eklenecek Günler</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vardiya Türü
                  </label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    {vardiyalar.map((shift) => (
                      <option key={shift.name} value={shift.name}>
                        {shift.name} ({shift.hours}) = {shift.duration} Saat
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vardiya Eklenecek Günler ({selectedDays.filter(day => getRemainingHoursForDay(day) > 0).length} gün kaldı)
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => {
                    const isActive = selectedDays.includes(day.value);
                    const isUnadded = unaddedDays.includes(day.value);
                    const isSelected = selectedShiftDays.includes(day.value);
                    const remainingHours = getRemainingHoursForDay(day.value);
                    
                    return (
                      <button
                        key={day.value}
                        onClick={() => isActive && remainingHours > 0 && toggleShiftDay(day.value)}
                        disabled={!isActive || remainingHours === 0}
                        className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                          !isActive
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : remainingHours === 0
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={
                          !isActive 
                            ? 'Bu gün aktif değil'
                            : remainingHours === 0 
                            ? 'Bu günün mesai saati doldu'
                            : 'Bu güne vardiya ekle'
                        }
                      >
                        {day.name}
                        {remainingHours === 0 && isActive && (
                          <span className="ml-1 text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleAddShift}
                  disabled={selectedShiftDays.length === 0 || allDaysCompleted}
                  className={`w-full py-3 rounded-lg transition-colors ${
                    selectedShiftDays.length > 0 && !allDaysCompleted
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {allDaysCompleted ? 'Tüm Günler Tamamlandı' : 'Vardiya Ekle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tüm günlere vardiya eklendiğinde gösterilecek mesaj */}
        {showShiftAddition && allDaysCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mt-6">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="text-green-800 font-semibold">Tüm günlere vardiya eklendi!</h3>
            </div>
            <p className="text-green-700 mt-2">Bu alan için tüm günlere vardiya tanımlaması tamamlandı.</p>
          </div>
        )}
      </div>
    );
  }

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

            <div className="pt-4">
              <button
                onClick={handleAddArea}
                disabled={!name.trim() || !selectedColor}
                className={`w-full py-3 rounded-lg transition-colors ${
                  name.trim() && selectedColor
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YeniAlan; 