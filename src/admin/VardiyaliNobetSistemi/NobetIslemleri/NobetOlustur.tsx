import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User2, Plus, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

interface Personnel {
  id: number;
  name: string;
  surname: string;
  title: string;
  unvan: string;
}

interface Assignment {
  id: string;
  personelId: number;
  date: string;
  type: 'izin' | 'nobet';
  alan?: string;
  mesai?: string;
  renk?: string;
  aciklama?: string;
}

const NobetOlustur: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // State'ler
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate] = useState(new Date(2025, 6, 17)); // 17/07/2025
  const [endDate] = useState(new Date(2025, 7, 16)); // 16/08/2025

  // Demo personel verileri
  useEffect(() => {
    const demoPersonnel: Personnel[] = [
      {
        id: 1,
        name: 'AHMET',
        surname: 'YILMAZ',
        title: 'Acil Servis',
        unvan: 'HEMŞİRE'
      },
      {
        id: 2,
        name: 'HATICE',
        surname: 'ALTINTAS',
        title: 'Acil Servis',
        unvan: 'Hemşire'
      },
      {
        id: 3,
        name: 'MERT',
        surname: 'ALTINTAS',
        title: 'Acil Servis',
        unvan: 'Hemşire'
      }
    ];
    
    setPersonnel(demoPersonnel);
    setLoading(false);
  }, []);

  // Demo atama verileri
  useEffect(() => {
    const demoAssignments: Assignment[] = [
      // AHMET YILMAZ - Yıllık İzin (17-24 Temmuz)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `ahmet-${i}`,
        personelId: 1,
        date: new Date(2025, 6, 17 + i).toISOString().split('T')[0],
        type: 'izin' as const,
        alan: 'Yıllık İzin',
        renk: '#10B981'
      })),
      // HATICE ALTINTAS - YEŞİL Nöbet (23 Temmuz)
      {
        id: 'hatice-1',
        personelId: 2,
        date: '2025-07-23',
        type: 'nobet' as const,
        alan: 'YEŞİL',
        mesai: '16:00 - 24:00',
        renk: '#10B981'
      },
      // MERT ALTINTAS - KIRMIZI Nöbet (17 Temmuz)
      {
        id: 'mert-1',
        personelId: 3,
        date: '2025-07-17',
        type: 'nobet' as const,
        alan: 'KIRMIZI',
        mesai: '16:00 - 24:00',
        renk: '#EF4444'
      }
    ];
    
    setAssignments(demoAssignments);
  }, []);

  // Tarih aralığındaki günleri oluştur
  const getDaysInRange = () => {
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const daysInRange = getDaysInRange();

  // Personel için belirli bir gündeki atamaları bul
  const getAssignmentForDay = (personelId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return assignments.find(a => a.personelId === personelId && a.date === dateStr);
  };

  // Gün isimlerini kısalt
  const getDayName = (date: Date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const shortNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const dayIndex = date.getDay();
    return shortNames[dayIndex];
  };

  // Toplam gün sayısı
  const totalDays = daysInRange.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">İzin İstekleri</h1>
            <p className="text-gray-600">Özel istekler ve izin talepleri</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Personel Talebi</span>
        </button>
      </div>

      {/* Dönem Bilgisi */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Temmuz 2025 Dönemi</h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-600">Başlangıç</div>
              <div className="text-lg font-semibold">17/07/2025</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Bitiş</div>
              <div className="text-lg font-semibold">16/08/2025</div>
            </div>
          </div>
        </div>

        {/* Personel Tablosu */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 sticky left-0 bg-gray-50 min-w-[200px] border-b">
                  PERSONEL
                </th>
                {daysInRange.map((date, index) => {
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th
                      key={index}
                      className={`py-4 px-3 text-center text-sm font-semibold border-b min-w-[120px] ${
                        isWeekend ? 'font-bold text-blue-700 bg-blue-50' : 'text-gray-600 bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{getDayName(date)}</span>
                        <span>{date.getDate()}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {personnel.map(person => (
                <tr key={person.id} className="hover:bg-gray-50 align-top">
                  <td className="py-4 px-6 text-sm sticky left-0 bg-white border-r">
                    <div>
                      <div className="font-medium text-gray-900">{person.name} {person.surname}</div>
                      <div className="text-gray-500 text-xs">Ünvan {person.unvan}</div>
                    </div>
                  </td>
                  {daysInRange.map((date, dayIndex) => {
                    const assignment = getAssignmentForDay(person.id, date);
                    return (
                      <td key={dayIndex} className="py-4 px-3 text-center text-sm align-top">
                        <div className="flex items-center justify-center">
                          {assignment ? (
                            <div
                              className="px-3 py-2 rounded-lg text-white font-medium min-w-[100px] flex flex-col items-center justify-center"
                              style={{ backgroundColor: assignment.renk }}
                            >
                              <div className="text-xs font-bold">
                                {assignment.alan}
                              </div>
                              {assignment.mesai && (
                                <div className="text-xs mt-1">
                                  {assignment.mesai}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-16 h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                              -
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alt Bilgi */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Toplam {totalDays} gün</strong> için izin planı görüntüleniyor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NobetOlustur;