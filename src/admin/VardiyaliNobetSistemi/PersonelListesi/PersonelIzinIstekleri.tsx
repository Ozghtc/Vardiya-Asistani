import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User2, Plus, Filter, Clock, CalendarDays, X, MapPin, Save } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { tr } from 'date-fns/locale';
import { addDays, differenceInCalendarDays } from 'date-fns';

interface Personnel {
  id: number;
  tcno: string;
  ad: string;
  soyad: string;
  unvan: string;
  email: string;
  telefon: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
}

interface IzinIstek {
  id: number;
  personel_id: number;
  izin_turu: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  durum: 'beklemede' | 'onaylandi' | 'reddedildi';
  aciklama?: string;
}

interface IzinTanimlama {
  id: string;
  izin_turu: string;
  kisaltma: string;
  renk: string;
  mesai_dusumu: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

interface AlanTanimlama {
  id: string;
  alan_adi: string;
  renk: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

interface TalepItem {
  id: string;
  tip: 'nobet' | 'izin';
  tarih: Date;
  bitis_tarih?: Date;
  alan?: string;
  izin_turu?: string;
  mesai_saati?: string;
  aciklama?: string;
}

const PersonelIzinIstekleri: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // State'ler
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [izinIstekleri, setIzinIstekleri] = useState<IzinIstek[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30));
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-07');
  const [showPopup, setShowPopup] = useState(false);
  
  // Popup state'leri
  const [selectedTip, setSelectedTip] = useState<'nobet' | 'izin' | null>(null);
  const [selectedTarih, setSelectedTarih] = useState<Date | null>(null);
  const [selectedBitisTarih, setSelectedBitisTarih] = useState<Date | null>(null);
  const [isTarihAraligi, setIsTarihAraligi] = useState(false);
  const [selectedAlan, setSelectedAlan] = useState<string>('');
  const [selectedIzinTuru, setSelectedIzinTuru] = useState<string>('');
  const [selectedMesaiSaati, setSelectedMesaiSaati] = useState<string>('');
  const [aciklama, setAciklama] = useState<string>('');
  const [talepler, setTalepler] = useState<TalepItem[]>([]);
  
  // API verileri
  const [izinTanimlamalari, setIzinTanimlamalari] = useState<IzinTanimlama[]>([]);
  const [alanTanimlamalari, setAlanTanimlamalari] = useState<AlanTanimlama[]>([]);

  // Ay adını al
  const ayYil = startDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  // İzin tanımlamalarını yükle
  const loadIzinTanimlamalari = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/16',
          method: 'GET'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rows) {
          const filteredIzinler = result.data.rows.filter((izin: IzinTanimlama) => 
            izin.kurum_id === user.kurum_id &&
            izin.departman_id === user.departman_id &&
            izin.birim_id === user.birim_id
          );
          setIzinTanimlamalari(filteredIzinler);
        }
      }
    } catch (error) {
      console.error('İzin tanımlamaları yükleme hatası:', error);
    }
  };

  // Alan tanımlamalarını yükle
  const loadAlanTanimlamalari = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/18',
          method: 'GET'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rows) {
          const filteredAlanlar = result.data.rows.filter((alan: AlanTanimlama) => 
            alan.kurum_id === user.kurum_id &&
            alan.departman_id === user.departman_id &&
            alan.birim_id === user.birim_id
          );
          setAlanTanimlamalari(filteredAlanlar);
        }
      }
    } catch (error) {
      console.error('Alan tanımlamaları yükleme hatası:', error);
    }
  };

  // Personel listesini yükle
  const loadPersonnel = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
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
          const filteredPersonnel = result.data.rows.filter((person: Personnel) => 
            person.kurum_id === user.kurum_id &&
            person.departman_id === user.departman_id &&
            person.birim_id === user.birim_id &&
            person.aktif_mi
          );
          
          setPersonnel(filteredPersonnel);
        }
      }
    } catch (error) {
      console.error('Personel yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // İzin isteklerini yükle (demo data)
  const loadIzinIstekleri = async () => {
    // Demo data - gerçek API'de bu kısım değişecek
    const demoIzinIstekleri: IzinIstek[] = [
      {
        id: 1,
        personel_id: 1,
        izin_turu: 'Yıllık İzin',
        baslangic_tarihi: '2025-07-15',
        bitis_tarihi: '2025-07-20',
        durum: 'onaylandi',
        aciklama: 'Aile ziyareti'
      },
      {
        id: 2,
        personel_id: 2,
        izin_turu: 'Hastalık İzni',
        baslangic_tarihi: '2025-07-10',
        bitis_tarihi: '2025-07-12',
        durum: 'beklemede',
        aciklama: 'Grip'
      }
    ];
    
    setIzinIstekleri(demoIzinIstekleri);
  };

  useEffect(() => {
    loadPersonnel();
    loadIzinIstekleri();
    loadIzinTanimlamalari();
    loadAlanTanimlamalari();
  }, [user]);

  // Tarih değişiklikleri
  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    setStartDate(date);
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

  // Popup işlemleri
  const handleTipSecimi = (tip: 'nobet' | 'izin') => {
    // Eğer aynı tip seçilirse, seçimi kaldır (toggle)
    if (selectedTip === tip) {
      setSelectedTip(null);
      setSelectedTarih(null);
      setSelectedBitisTarih(null);
      setIsTarihAraligi(false);
      setSelectedAlan('');
      setSelectedIzinTuru('');
      setAciklama('');
    } else {
      // Farklı tip seçilirse, yeni tipi seç
      setSelectedTip(tip);
      setSelectedTarih(null);
      setSelectedBitisTarih(null);
      setIsTarihAraligi(false);
      setSelectedAlan('');
      setSelectedIzinTuru('');
      setAciklama('');
    }
  };

  const handleEkle = () => {
    if (!selectedTip || !selectedTarih) return;
    
    if (selectedTip === 'nobet' && !selectedAlan) return;
    if (selectedTip === 'izin' && !selectedIzinTuru) return;

    // Tarih aralığı kontrolü
    if (isTarihAraligi && selectedBitisTarih && selectedTarih > selectedBitisTarih) {
      alert('Bitiş tarihi başlangıç tarihinden önce olamaz!');
      return;
    }

    const yeniTalep: TalepItem = {
      id: Date.now().toString(),
      tip: selectedTip,
      tarih: selectedTarih,
      bitis_tarih: isTarihAraligi && selectedBitisTarih ? selectedBitisTarih : undefined,
      alan: selectedTip === 'nobet' ? selectedAlan : undefined,
      izin_turu: selectedTip === 'izin' ? selectedIzinTuru : undefined,
      mesai_saati: selectedTip === 'nobet' ? selectedMesaiSaati : undefined,
      aciklama: aciklama || undefined
    };

    setTalepler([...talepler, yeniTalep]);
    
    // Form'u temizle
    setSelectedTarih(null);
    setSelectedBitisTarih(null);
    setIsTarihAraligi(false);
    setSelectedAlan('');
    setSelectedIzinTuru('');
    setSelectedMesaiSaati('');
    setAciklama('');
  };

  const handleKaydet = async () => {
    if (talepler.length === 0) return;
    
    try {
      // Burada API'ye talepleri göndereceğiz
      console.log('Kaydedilecek talepler:', talepler);
      
      // Başarılı kaydetme sonrası
      setTalepler([]);
      setShowPopup(false);
      setSelectedTip(null);
      
      // Sayfayı yenile
      loadIzinIstekleri();
    } catch (error) {
      console.error('Talep kaydetme hatası:', error);
    }
  };

  const handleTalepSil = (id: string) => {
    setTalepler(talepler.filter(t => t.id !== id));
  };

  // Takvim günlerini hesapla
  const daysInRange: Date[] = [];
  if (startDate && endDate && endDate >= startDate) {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      daysInRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Gün adlarını al
  const getGunAdi = (date: Date) => {
    const gunAdlari = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
    return gunAdlari[date.getDay()];
  };

  // İzin durumunu kontrol et
  const getIzinDurumu = (personelId: number, date: Date) => {
    const izin = izinIstekleri.find(i => 
      i.personel_id === personelId &&
      new Date(i.baslangic_tarihi) <= date &&
      new Date(i.bitis_tarihi) >= date
    );
    
    if (!izin) return null;
    
    return {
      tur: izin.izin_turu,
      durum: izin.durum,
      aciklama: izin.aciklama
    };
  };

  // Durum rengini al
  const getDurumRengi = (durum: string) => {
    switch (durum) {
      case 'onaylandi': return 'bg-green-100 text-green-800';
      case 'reddedildi': return 'bg-red-100 text-red-800';
      case 'beklemede': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            onClick={() => navigate('/personel-islemleri')}
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
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Personel Talebi</span>
        </button>
      </div>

      {/* Tarih Seçimi */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
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
                locale={tr}
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
                locale={tr}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
                placeholderText="gg/aa/yyyy"
                minDate={startDate}
                maxDate={addDays(startDate, 30)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* İzin Takvimi */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-200">
        <div className="min-h-[400px] relative">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 sticky left-0 bg-gray-50 min-w-[200px] border-b">
                  PERSONEL
                </th>
                {daysInRange.map(dateObj => {
                  const gun = dateObj.getDay();
                  const isWeekend = gun === 0 || gun === 6;
                  const gunAdi = getGunAdi(dateObj);
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
                <tr key={person.id} className="hover:bg-gray-50 align-top">
                  <td className="py-3 px-6 text-sm sticky left-0 bg-white border-r z-10">
                    <div>
                      <div className="font-medium text-gray-900">{person.ad} {person.soyad}</div>
                      <div className="text-gray-500 text-xs">{person.unvan}</div>
                    </div>
                  </td>
                  {daysInRange.map(dateObj => {
                    const izinDurumu = getIzinDurumu(person.id, dateObj);
                    return (
                      <td key={dateObj.toISOString()} className="py-3 px-3 text-center text-sm align-top">
                        {izinDurumu ? (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getDurumRengi(izinDurumu.durum)}`}>
                            {izinDurumu.tur}
                          </div>
                        ) : (
                          <div className="w-8 h-8 mx-auto rounded border-2 border-dashed border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">-</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {personnel.length === 0 && (
            <div className="text-center py-12">
              <User2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Henüz personel kaydı bulunmuyor</p>
              <button
                onClick={() => navigate('/personel-ekle')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>İlk Personeli Ekle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Özet Bilgi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">Toplam {daysInRange.length} gün için izin planı görüntüleniyor.</div>
          <div>Tarih aralığı: {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}</div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPopup(false);
              setSelectedTip(null);
              setTalepler([]);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl min-h-fit my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Personel Talebi</h3>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setSelectedTip(null);
                  setTalepler([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col">
              {/* Üst Bölüm - Form */}
              <div className="p-6 border-b border-gray-200">
                {/* Tip Seçimi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => handleTipSecimi('nobet')}
                    disabled={selectedTip === 'izin'}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                      selectedTip === 'nobet' 
                        ? 'border-blue-300 bg-blue-50' 
                        : selectedTip === 'izin'
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Nöbet İsteği</div>
                      <div className="text-sm text-gray-500">Nöbet değişimi veya nöbet talebi</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTipSecimi('izin')}
                    disabled={selectedTip === 'nobet'}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                      selectedTip === 'izin' 
                        ? 'border-green-300 bg-green-50' 
                        : selectedTip === 'nobet'
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">İzin/Bosluk Talebi</div>
                      <div className="text-sm text-gray-500">İzin veya boşluk talebi</div>
                    </div>
                  </button>
                </div>

                {/* Form Alanları */}
                {selectedTip && (
                  <div className="space-y-4">
                                        {/* Tarih Seçimi */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Tarih <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="tarihAraligi"
                            checked={isTarihAraligi}
                            onChange={(e) => {
                              setIsTarihAraligi(e.target.checked);
                              if (!e.target.checked) {
                                setSelectedBitisTarih(null);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor="tarihAraligi" className="text-sm text-gray-600">
                            Tarih aralığı
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Başlangıç Tarihi
                          </label>
                          <DatePicker
                            selected={selectedTarih}
                            onChange={(date: Date | null) => setSelectedTarih(date)}
                            dateFormat="dd/MM/yyyy"
                            locale={tr}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
                            placeholderText="Başlangıç tarihi"
                            minDate={startDate}
                            maxDate={endDate}
                          />
                        </div>
                        
                        {isTarihAraligi && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Bitiş Tarihi
                            </label>
                            <DatePicker
                              selected={selectedBitisTarih}
                              onChange={(date: Date | null) => setSelectedBitisTarih(date)}
                              dateFormat="dd/MM/yyyy"
                              locale={tr}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
                              placeholderText="Bitiş tarihi"
                              minDate={selectedTarih || startDate}
                              maxDate={endDate}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alan ve Mesai Seçimi (Nöbet için) */}
                    {selectedTip === 'nobet' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alan <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedAlan}
                            onChange={(e) => setSelectedAlan(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
                          >
                            <option value="">Alan seçin</option>
                            {alanTanimlamalari.map((alan) => (
                              <option key={alan.id} value={alan.alan_adi}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: alan.renk }}
                                  ></div>
                                  {alan.alan_adi}
                                </div>
                              </option>
                            ))}
                          </select>
                          {selectedAlan && (
                            <div className="mt-2 text-xs text-gray-500">
                              {alanTanimlamalari.find(alan => alan.alan_adi === selectedAlan)?.renk && (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: alanTanimlamalari.find(alan => alan.alan_adi === selectedAlan)?.renk }}
                                  ></div>
                                  <span>Renk: {alanTanimlamalari.find(alan => alan.alan_adi === selectedAlan)?.renk}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mesai Saatleri
                          </label>
                          <select
                            value={selectedMesaiSaati}
                            onChange={(e) => setSelectedMesaiSaati(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
                          >
                            <option value="">Mesai saati seçin</option>
                            <option value="08:00-16:00">08:00-16:00 (Sabah)</option>
                            <option value="16:00-24:00">16:00-24:00 (Akşam)</option>
                            <option value="00:00-08:00">00:00-08:00 (Gece)</option>
                            <option value="08:00-20:00">08:00-20:00 (Uzun)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* İzin Türü Seçimi (İzin için) */}
                    {selectedTip === 'izin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İzin Türü <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedIzinTuru}
                          onChange={(e) => setSelectedIzinTuru(e.target.value)}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
                        >
                          <option value="">İzin türü seçin</option>
                          {izinTanimlamalari.map((izin) => (
                            <option key={izin.id} value={izin.izin_turu}>
                              {izin.izin_turu} ({izin.kisaltma})
                            </option>
                          ))}
                        </select>
                        {selectedIzinTuru && (
                          <div className="mt-2 text-xs text-gray-500">
                            {izinTanimlamalari.find(izin => izin.izin_turu === selectedIzinTuru) && (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: izinTanimlamalari.find(izin => izin.izin_turu === selectedIzinTuru)?.renk }}
                                ></div>
                                <span>Renk: {izinTanimlamalari.find(izin => izin.izin_turu === selectedIzinTuru)?.renk}</span>
                                {izinTanimlamalari.find(izin => izin.izin_turu === selectedIzinTuru)?.mesai_dusumu && (
                                  <span className="text-orange-600">• Mesai düşümü</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Açıklama */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Açıklama
                      </label>
                      <textarea
                        value={aciklama}
                        onChange={(e) => setAciklama(e.target.value)}
                        rows={3}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 py-2 px-3"
                        placeholder="Açıklama ekleyin (opsiyonel)"
                      />
                    </div>

                    {/* Ekle Butonu */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleEkle}
                        disabled={!selectedTarih || (selectedTip === 'nobet' && !selectedAlan) || (selectedTip === 'izin' && !selectedIzinTuru)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Alt Bölüm - Liste */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Eklenen Talepler</h4>
                
                {talepler.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Henüz talep eklenmedi
                  </div>
                ) : (
                  <div className="space-y-3">
                    {talepler.map((talep) => (
                      <div key={talep.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            talep.tip === 'nobet' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {talep.tip === 'nobet' ? (
                              <Clock className="w-4 h-4 text-blue-600" />
                            ) : (
                              <CalendarDays className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {talep.tip === 'nobet' ? 'Nöbet İsteği' : 'İzin/Bosluk Talebi'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {talep.bitis_tarih 
                                ? `${talep.tarih.toLocaleDateString('tr-TR')} - ${talep.bitis_tarih.toLocaleDateString('tr-TR')}`
                                : talep.tarih.toLocaleDateString('tr-TR')
                              }
                              {talep.alan && ` • ${talep.alan}`}
                              {talep.izin_turu && ` • ${talep.izin_turu}`}
                              {talep.mesai_saati && ` • ${talep.mesai_saati}`}
                            </div>
                            {talep.aciklama && (
                              <div className="text-xs text-gray-400 mt-1">
                                {talep.aciklama}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleTalepSil(talep.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Kaydet Butonu */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Toplam {talepler.length} talep
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowPopup(false);
                        setSelectedTip(null);
                        setTalepler([]);
                      }}
                      className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleKaydet}
                      disabled={talepler.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonelIzinIstekleri; 