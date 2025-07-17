import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronUp, Clock, Calendar as CalendarIcon, User2, Save, Trash2, X, ChevronLeft } from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import { tr } from "date-fns/locale/tr";
import { startOfMonth, endOfMonth, addDays, differenceInCalendarDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../lib/api';
registerLocale("tr", tr);

interface Personnel {
  id: number;
  name: string;
  surname: string;
  title: string;
}

export default function NobetOlustur() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [openedPersonId, setOpenedPersonId] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const now = new Date();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(now));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(now));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPerson, setModalPerson] = useState<{ name: string; surname: string } | null>(null);
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [modalSelectedAlan, setModalSelectedAlan] = useState<string>('');
  const [modalSelectedMesai, setModalSelectedMesai] = useState<any>(null);
  const [modalAlanlar, setModalAlanlar] = useState<any[]>([]);
  const [modalNobetler, setModalNobetler] = useState<any[]>([]);
  const [cellAssignments, setCellAssignments] = useState<{ [key: string]: { alan?: string; mesai?: any; istekOzet?: string } }>({});
  const [modalDateObj, setModalDateObj] = useState<Date | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [showPersonelIstek, setShowPersonelIstek] = useState(false);
  const [personelIstekTurleri, setPersonelIstekTurleri] = useState<any[]>([]);
  const [selectedIstekTuru, setSelectedIstekTuru] = useState('');
  const [eklenenIstekOzet, setEklenenIstekOzet] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    setDateRange({
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    });

    // KURAL 16: Production ortamında localStorage yasak - demo data sistemi
    const demoPersonel = [
      { id: 1, name: 'Dr. Ahmet Yılmaz', birim: 'Acil Servis' },
      { id: 2, name: 'Hemşire Ayşe Kaya', birim: 'Dahiliye' },
      { id: 3, name: 'Dr. Mehmet Öz', birim: 'Cerrahi' }
    ];
    setPersonnel(demoPersonel);

    const days = lastDay.getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
  }, [currentMonth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        openedPersonId &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        setOpenedPersonId(null);
      }
    }
    if (openedPersonId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openedPersonId]);

  const ayYil = startDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    setStartDate(date);
    // Başlangıç tarihi değiştiğinde bitiş tarihini de güncelle
    const maxEnd = addDays(date, 30);
    if (!endDate || endDate < date || endDate > maxEnd) {
      setEndDate(maxEnd);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    if (differenceInCalendarDays(date, startDate) > 30 || date < startDate) return;
    setEndDate(date);
  };

  const daysInRange: Date[] = [];
  if (startDate && endDate && endDate >= startDate) {
    // Başlangıç tarihinden bitiş tarihine kadar tüm günleri ekle
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      daysInRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  function getFormattedDate(day: number) {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(day);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const gun = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy} ${gun}`;
  }

  const loadShifts = async () => {
    try {
      const response = await apiRequest('/api/v1/data/table/17');
      if (response.success) {
        const shiftData = response.data.rows.map((row: any) => ({
          id: row.id,
          name: row.vardiya_adi,
          startHour: row.baslangic_saati,
          endHour: row.bitis_saati,
          calismaSaati: row.calisma_saati || 8
        }));
        setShifts(shiftData);
      }
    } catch (error) {
      console.error('Vardiya yükleme hatası:', error);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      const savedAreas = localStorage.getItem('tanimliAlanlar');
      if (savedAreas) {
        try {
          const alanlar = JSON.parse(savedAreas);
          setModalAlanlar(alanlar);
          setModalSelectedAlan(alanlar[0]?.id?.toString() || '');
          setModalNobetler(alanlar[0]?.nobetler || []);
        } catch {
          setModalAlanlar([]);
          setModalSelectedAlan('');
          setModalNobetler([]);
        }
      } else {
        setModalAlanlar([]);
        setModalSelectedAlan('');
        setModalNobetler([]);
      }
      loadShifts();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (modalSelectedAlan && modalAlanlar.length > 0) {
      const secili = modalAlanlar.find(a => a.id.toString() === modalSelectedAlan);
      setModalNobetler(secili?.nobetler || []);
    }
  }, [modalSelectedAlan, modalAlanlar]);

  function getCellKey(person: {name: string, surname: string}, dateObj: Date) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${person.name}_${person.surname}_${yyyy}_${mm}_${dd}`;
  }

  const seciliAlan = modalAlanlar.find(a => a.id.toString() === modalSelectedAlan);
  const alanRenk = seciliAlan?.color || seciliAlan?.renk || '#e5e7eb';

  useEffect(() => {
    if (modalOpen) {
      // KURAL 16: Production ortamında localStorage yasak - demo data sistemi
      const demoRequests = [
        { id: 1, personelId: 1, tarih: '2024-01-15', durum: 'izin' },
        { id: 2, personelId: 2, tarih: '2024-01-16', durum: 'istekli' }
      ];
      setPersonelIstekTurleri(demoRequests);
    }
  }, [modalOpen]);

  const kaydetAktif = eklenenIstekOzet || (!showPersonelIstek && modalSelectedMesai);

  useEffect(() => {
    if (modalOpen && modalPerson && modalDateObj) {
      const key = getCellKey(modalPerson, modalDateObj);
      const assignment = cellAssignments[key];
      if (assignment && assignment.istekOzet) {
        setShowPersonelIstek(true);
        setEklenenIstekOzet(assignment.istekOzet);
      } else {
        setShowPersonelIstek(false);
        setEklenenIstekOzet(null);
      }
    }
  }, [modalOpen, modalPerson, modalDateObj]);

    // KURAL 16: Production ortamında localStorage yasak - state management disabled
    useEffect(() => {
      // Demo: Başlangıç assignment'ları
      setCellAssignments({});
    }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-16 min-w-[600px] min-h-[300px] flex flex-col items-center relative">
            {/* Sağ üstte küçük ikonlu butonlar */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-200"
                title="Sil"
                onClick={() => {
                  if (modalPerson && modalDay && modalDateObj) {
                    const key = getCellKey(modalPerson, modalDateObj);
                    setCellAssignments(prev => {
                      const copy = { ...prev };
                      delete copy[key];
                      return copy;
                    });
                  }
                  setModalOpen(false);
                }}
              >
                <Trash2 size={18} />
              </button>
              <button
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 border border-blue-600 disabled:bg-blue-200 disabled:border-blue-200"
                title="Kaydet"
                onClick={() => {
                  if (modalPerson && modalDay && modalDateObj) {
                    const key = getCellKey(modalPerson, modalDateObj);
                    if (showPersonelIstek && eklenenIstekOzet) {
                      setCellAssignments(prev => ({
                        ...prev,
                        [key]: {
                          istekOzet: eklenenIstekOzet
                        }
                      }));
                    } else if (!showPersonelIstek && modalSelectedAlan && modalSelectedMesai) {
                      setCellAssignments(prev => ({
                        ...prev,
                        [key]: {
                          alan: modalAlanlar.find(a => a.id.toString() === modalSelectedAlan)?.name || '',
                          mesai: modalSelectedMesai
                        }
                      }));
                    }
                  }
                  setModalOpen(false);
                }}
                disabled={!kaydetAktif}
              >
                <Save size={18} />
              </button>
              <button
                className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 border border-gray-300"
                title="Kapat"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            {/* Sol üst köşe: isim ve tarih */}
            <div className="absolute left-8 top-8 text-left">
              <div className="text-lg font-semibold text-gray-900">{modalPerson ? `${modalPerson.name} ${modalPerson.surname}` : ''}</div>
              <div className="text-base text-gray-500">{modalDay ? getFormattedDate(modalDay) : ''}</div>
            </div>
            {/* Ortada alan seçimi ve mesailer */}
            <div className="flex flex-col items-center justify-center h-full">
              {/* Personel İstek Checkbox */}
              <div className="mb-4 w-full flex flex-col items-center justify-center">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="personel-istek-checkbox"
                    className="mr-2 w-4 h-4"
                    checked={showPersonelIstek}
                    onChange={e => {
                      setShowPersonelIstek(e.target.checked);
                      setEklenenIstekOzet(null); // checkbox kapatılırsa özet de silinsin
                    }}
                  />
                  <label htmlFor="personel-istek-checkbox" className="text-base text-gray-700 select-none cursor-pointer">
                    Personel isteği ekle
                  </label>
                </div>
                {showPersonelIstek ? (
                  <>
                    <div className="flex items-center mt-3 gap-2">
                      <select
                        className="px-4 py-2 rounded border border-gray-300 text-base w-64"
                        value={selectedIstekTuru}
                        onChange={e => setSelectedIstekTuru(e.target.value)}
                        disabled={!!eklenenIstekOzet}
                      >
                        <option value="">İstek türü seçin</option>
                        {personelIstekTurleri.map((istek: any) => (
                          <option key={istek.id} value={istek.name}>{istek.name}</option>
                        ))}
                      </select>
                      <button
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        disabled={!selectedIstekTuru || !!eklenenIstekOzet}
                        onClick={() => {
                          if (!selectedIstekTuru) return;
                          const kelimeler = selectedIstekTuru.split(' ');
                          let ozet = '';
                          if (kelimeler.length === 1) {
                            ozet = kelimeler[0].slice(0,3).toUpperCase() + '.';
                          } else {
                            ozet = kelimeler[0].slice(0,3).toUpperCase() + '. ' + kelimeler[1].slice(0,2).toUpperCase() + '.';
                          }
                          setEklenenIstekOzet(ozet);
                        }}
                      >
                        Ekle
                      </button>
                    </div>
                    {eklenenIstekOzet && (
                      <div className="relative mt-6 w-64 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center">
                        <button
                          className="absolute -top-2 -left-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100 hover:text-red-600 transition-colors"
                          onClick={() => setEklenenIstekOzet(null)}
                          title="Sil"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <span className="text-base font-semibold text-gray-700 mx-auto">{eklenenIstekOzet}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <label className="mb-2 text-base font-medium text-gray-700">Alan Seçin</label>
                    <select
                      className="mb-6 px-4 py-2 rounded border border-gray-300 text-lg flex items-center"
                      value={modalSelectedAlan}
                      onChange={e => {
                        setModalSelectedAlan(e.target.value);
                        setModalSelectedMesai(null); // Alan değişince mesai seçimini sıfırla
                      }}
                    >
                      {modalAlanlar.map(alan => (
                        <option key={alan.id} value={alan.id}>
                          {alan.name}
                        </option>
                      ))}
                    </select>
                    {/* Seçili alanın adı ve rengi */}
                    {modalSelectedAlan && (
                      <div className="flex items-center gap-2 mb-4">
                        {(() => {
                          const secili = modalAlanlar.find(a => a.id.toString() === modalSelectedAlan);
                          if (!secili) return null;
                          return <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ background: secili.color || secili.renk || '#ccc' }}></span>;
                        })()}
                        <span className="text-lg font-semibold">{modalAlanlar.find(a => a.id.toString() === modalSelectedAlan)?.name}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 justify-center">
                      {modalNobetler && modalNobetler.length > 0 ? (
                        modalNobetler.map((nobet: any, i: number) => {
                          // Saat aralığı ve isim
                          let saatAraligi = '';
                          if (nobet.hours) {
                            const [start, end] = nobet.hours.split(' - ');
                            saatAraligi = `${start.slice(0,2)}-${end.slice(0,2)}`;
                          } else if (nobet.baslangic && nobet.bitis) {
                            saatAraligi = `${nobet.baslangic.slice(0,2)}-${nobet.bitis.slice(0,2)}`;
                          } else if (shifts.length > 0) {
                            const found = shifts.find((s: any) => s.name === nobet.name && s.startHour && s.endHour);
                            if (found) {
                              if (found.startHour.slice(0,2) === found.endHour.slice(0,2)) {
                                saatAraligi = `${found.startHour.slice(0,2)}-${found.endHour.slice(0,2)}`;
                              } else {
                                saatAraligi = `${found.startHour.slice(0,2)}-${found.endHour.slice(0,2)}`;
                              }
                            }
                          }
                          // Kontrastlı yazı rengi fonksiyonu
                          function getContrastYIQ(hexcolor = '#1976d2') {
                            hexcolor = hexcolor.replace('#', '');
                            if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(x => x + x).join('');
                            const r = parseInt(hexcolor.substr(0,2),16);
                            const g = parseInt(hexcolor.substr(2,2),16);
                            const b = parseInt(hexcolor.substr(4,2),16);
                            const yiq = ((r*299)+(g*587)+(b*114))/1000;
                            return (yiq >= 128) ? '#222' : '#fff';
                          }
                          const isSelected = modalSelectedMesai === nobet;
                          return (
                            <button
                              key={i}
                              className={`px-6 py-3 rounded-lg font-semibold text-lg border transition \
                                ${isSelected ? 'border-4 shadow-2xl' : 'border'}
                              `}
                              onClick={() => setModalSelectedMesai(nobet)}
                              type="button"
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                background: alanRenk,
                                color: getContrastYIQ(alanRenk),
                                borderColor: isSelected ? '#111' : alanRenk,
                                boxShadow: isSelected ? '0 0 0 6px rgba(0,0,0,0.18)' : undefined
                              }}
                            >
                              {nobet.saat} Saatlik Mesai
                              <span className="text-xs font-normal mt-1" style={{color: getContrastYIQ(alanRenk)}}>
                                {nobet.name}{saatAraligi ? ` (${saatAraligi})` : ''}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-gray-400">Bu alana ait mesai tanımlı değil.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <span>{ayYil} Dönemi</span>
        </h2>
        
        <div className="flex items-center gap-4 ml-auto">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Başlangıç</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
              locale="tr"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
              placeholderText="gg/aa/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bitiş</label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              locale="tr"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
              placeholderText="gg/aa/yyyy"
              minDate={startDate}
              maxDate={addDays(startDate, 30)}
            />
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="min-h-[600px] relative">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 sticky left-0 bg-gray-50 min-w-[200px] border-b">
                  Personel
                </th>
                <th className="py-4 px-3 text-center text-sm font-semibold text-gray-600 border-b min-w-[40px]"> </th>
                {daysInRange.map(dateObj => {
                  const gun = dateObj.getDay(); // 0: Pazar, 6: Cumartesi
                  const isWeekend = gun === 0 || gun === 6;
                  const gunAdlari = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
                  const gunAdi = gunAdlari[gun];
                  return (
                    <th
                      key={dateObj.toISOString()}
                      className={`py-4 px-3 text-center text-sm font-semibold border-b min-w-[40px] ${isWeekend ? 'font-bold text-blue-700 bg-blue-50' : 'text-gray-600 bg-gray-50'}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{gunAdi}</span>
                        <span>{dateObj.getDate()}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {personnel.map(person => (
                <tr key={person.id} className="hover:bg-gray-50 align-top relative">
                  <td className="py-3 px-6 text-sm sticky left-0 bg-white border-r z-10">
                    <div>
                      <div className="font-medium text-gray-900">{person.name} {person.surname}</div>
                      <div className="text-gray-500 text-xs">{person.title}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm align-top w-12 text-right pr-6 relative">
                    <button
                      className={`w-9 h-9 rounded border flex items-center justify-center transition ${openedPersonId === person.id ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                      onClick={() => setOpenedPersonId(openedPersonId === person.id ? null : person.id)}
                      aria-label="Detayları Göster/Gizle"
                    >
                      {openedPersonId === person.id ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {openedPersonId === person.id && (
                      <div
                        ref={popupRef}
                        className="absolute top-full left-1/2 mt-2 z-[9999] w-[90vw] max-w-2xl min-w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 animate-fade-in overflow-x-auto"
                        style={{ transform: 'translateX(-50%)' }}
                      >
                        {/* Popup Header */}
                        <div className="border-b border-gray-100 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                              <User2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{person.name} {person.surname}</h3>
                              <p className="text-sm text-gray-500">{person.title}</p>
                            </div>
                          </div>
                        </div>

                        {/* Popup Content */}
                        <div className="grid grid-cols-2 gap-6 p-6">
                          {/* Nöbet Bilgisi */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                              <CalendarIcon className="w-5 h-5 text-blue-600" />
                              <span>Nöbet Bilgisi</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Aylık Min. Saat:</span>
                                <span className="font-medium text-gray-900">40 Saat</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Aylık Max. Saat:</span>
                                <span className="font-medium text-gray-900">80 Saat</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Aktif Nöbet Günleri:</span>
                                <span className="font-medium text-gray-900">Pzt, Çar, Cum</span>
                              </div>
                            </div>
                          </div>

                          {/* İstek Bilgisi */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                              <Clock className="w-5 h-5 text-green-600" />
                              <span>İstek Bilgisi</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                              <div className="text-sm text-gray-600">
                                <div className="font-medium mb-2">Mayıs 2025</div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span>1-5 Mayıs: Yıllık İzin</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span>15 Mayıs: Nöbet İsteği</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Popup Footer */}
                        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                          <button
                            onClick={() => setOpenedPersonId(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Kapat
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  {daysInRange.map(dateObj => {
                    const key = getCellKey(person, dateObj);
                    const assignment = cellAssignments[key];
                    const alanColor = assignment ? (modalAlanlar.find(a => a.name === assignment.alan)?.color || modalAlanlar.find(a => a.name === assignment.alan)?.renk || '#1976d2') : undefined;
                    // Basit bir okunabilirlik kontrolü (koyu renkler için beyaz, açık renkler için siyah yazı)
                    function getContrastYIQ(hexcolor = '#1976d2') {
                      hexcolor = hexcolor.replace('#', '');
                      if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(x => x + x).join('');
                      const r = parseInt(hexcolor.substr(0,2),16);
                      const g = parseInt(hexcolor.substr(2,2),16);
                      const b = parseInt(hexcolor.substr(4,2),16);
                      const yiq = ((r*299)+(g*587)+(b*114))/1000;
                      return (yiq >= 128) ? '#222' : '#fff';
                    }
                    return (
                      <td key={dateObj.toISOString()} className="py-3 px-3 text-center text-sm align-top">
                        <div
                          className="w-14 h-10 mx-auto rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors relative overflow-hidden"
                          onDoubleClick={() => {
                            setModalPerson({ name: person.name, surname: person.surname });
                            setModalDay(dateObj.getDate());
                            setModalOpen(true);
                            setModalDateObj(dateObj);
                          }}
                          style={assignment ? { background: alanColor, borderColor: alanColor, borderStyle: 'solid' } : {}}
                        >
                          {assignment && assignment.istekOzet ? (
                            <span
                              className="text-xs font-bold select-none px-4 py-2 rounded-lg"
                              style={{ background: '#444', color: '#fff', display: 'inline-block' }}
                              title="Personel İstek"
                            >
                              {assignment.istekOzet}
                            </span>
                          ) : assignment && assignment.mesai ? (
                            <>
                              {/* Saat aralığı üstte küçük */}
                              {assignment.mesai.hours && (
                                <span className="text-[10px] text-gray-200 font-medium leading-none mb-0.5 select-none" style={{lineHeight:'1'}}>
                                  {assignment.mesai.hours.split(' - ').map((s: string) => s.slice(0,2)).join('-')}
                                </span>
                              )}
                              <span
                                className="text-xs font-bold select-none"
                                style={{ color: getContrastYIQ(alanColor) }}
                                title={`${assignment.alan} - ${assignment.mesai.saat}h`}
                              >
                                {assignment.mesai.saat}h
                              </span>
                            </>
                          ) : null}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}