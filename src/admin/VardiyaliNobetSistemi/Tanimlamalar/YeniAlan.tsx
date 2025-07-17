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

const YeniAlan: React.FC = () => {
  const [name, handleNameChange] = useCapitalization('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [showShiftSettings, setShowShiftSettings] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [dailyWorkHours, setDailyWorkHours] = useState(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(weekDays.map(day => day.value));

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
      activeDays: [...selectedDays]
    };

    setAreas([...areas, newArea]);
    setShowShiftSettings(true);
    
    // Form reset
    handleNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setDescription('');
    setSelectedColor('');
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const updateAllDaysHours = () => {
    // Tüm aktif günlerin saatlerini güncelle
    setAreas(prevAreas => 
      prevAreas.map(area => ({
        ...area,
        dailyHours: dailyWorkHours
      }))
    );
  };

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
                className="flex items-center justify-between p-3 border rounded-lg"
                style={{ borderLeftColor: area.color, borderLeftWidth: '4px' }}
              >
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
                  <p className="text-sm text-gray-600">Günlük: {area.dailyHours} saat</p>
                  <p className="text-xs text-gray-500">{area.activeDays.length} gün aktif</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vardiya Ayarları */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktif Günler
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      selectedDays.includes(day.value)
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
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