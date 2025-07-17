import React, { useState, useEffect } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

interface PersonelBilgisi {
  id: number;
  ad: string;
  soyad: string;
  unvan: string;
  tcno: string;
  email: string;
  telefon: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

const PersonelIstek: React.FC = () => {
  const { user } = useAuthContext();
  const [personelListesi, setPersonelListesi] = useState<PersonelBilgisi[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-07');
  const [startDate, setStartDate] = useState<string>('2025-07-01');
  const [endDate, setEndDate] = useState<string>('2025-07-31');

  // Aydan tarihleri oluştur
  const generateDatesFromMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    
    // Türkiye tarih formatına çevir (YYYY-MM-DD)
    const formatToInputDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    setStartDate(formatToInputDate(firstDay));
    setEndDate(formatToInputDate(lastDay));
  };

  // Tarih aralığındaki günleri hesapla
  const getDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  };

  // Ay değiştiğinde tarihleri güncelle
  useEffect(() => {
    generateDatesFromMonth(selectedMonth);
  }, [selectedMonth]);

  // Personel listesini çek
  useEffect(() => {
    const fetchPersonelListesi = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/21',
            method: 'GET'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.rows) {
            // Kullanıcının kurum/departman/birim'ine göre filtreleme
            const filteredPersonnel = result.data.rows.filter((person: PersonelBilgisi) => 
              person.kurum_id === user.kurum_id &&
              person.departman_id === user.departman_id &&
              person.birim_id === user.birim_id &&
              person.aktif_mi
            );
            
            setPersonelListesi(filteredPersonnel);
          }
        }
      } catch (error) {
        console.error('Personel listesi yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonelListesi();
  }, [user]);

  // Ay adını Türkçe göster
  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Tarihi Türkiye formatında göster (gün/ay/yıl)
  const formatDateTR = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const dateRange = getDateRange();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
        </div>

        {/* Başlık ve Tarih Seçici */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {getMonthName(selectedMonth)} Dönemi
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Başlangıç</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Bitiş</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hızlı Seçim:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vardiya Tablosu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Personel
                  </th>
                  {dateRange.map((date, index) => (
                    <th key={index} className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-bold text-gray-900">
                          {date.getDate()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {date.toLocaleDateString('tr-TR', { 
                            weekday: 'short' 
                          }).toUpperCase()}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={dateRange.length + 1} className="px-6 py-8 text-center text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : personelListesi.length > 0 ? (
                  personelListesi.map((personel) => (
                    <tr key={personel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {personel.ad.charAt(0)}{personel.soyad.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {personel.ad} {personel.soyad}
                            </div>
                            <div className="text-xs text-gray-500">
                              {personel.unvan}
                            </div>
                          </div>
                        </div>
                      </td>
                      {dateRange.map((date, dayIndex) => (
                        <td key={dayIndex} className="px-3 py-4 text-center">
                          <div 
                            className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                            data-date={date.toISOString().split('T')[0]}
                            data-day={date.getDate()}
                            data-weekday={date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                          >
                            <span className="text-sm font-medium text-gray-600">
                              {/* Burada vardiya kodları veya numaraları olacak */}
                              -
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={dateRange.length + 1} className="px-6 py-8 text-center text-gray-500">
                      Personel bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bilgi Notu */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Toplam {dateRange.length} gün</strong> için vardiya planı görüntüleniyor.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Tarih aralığı: {formatDateTR(startDate)} - {formatDateTR(endDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonelIstek;