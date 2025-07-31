// Personel Panel Helper Functions
// Personel paneli için yardımcı fonksiyonlar

import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar,
  FileText
} from 'lucide-react';
import { 
  IstekTalep, 
  NobeProgram,
  DurumType, 
  FilterType,
  TalepFormData,
  DURUM_LABELS,
  DURUM_COLORS
} from '../types/PersonelPanel.types';

/**
 * Durum ikonu al
 */
export const getDurumIcon = (durum: DurumType) => {
  switch (durum) {
    case 'onaylandi':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'reddedildi':
      return <XCircle className="w-5 h-5 text-red-600" />;
    default:
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  }
};

/**
 * Durum text'ini al
 */
export const getDurumText = (durum: DurumType): string => {
  return DURUM_LABELS[durum] || 'Bilinmeyen';
};

/**
 * Durum rengini al
 */
export const getDurumColor = (durum: DurumType): string => {
  return DURUM_COLORS[durum] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Tarih formatla (Türkçe)
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Kısa tarih formatla
 */
export const formatDateShort = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('tr-TR');
  } catch (error) {
    return dateString;
  }
};

/**
 * Saat formatla
 */
export const formatTime = (timeString: string): string => {
  try {
    return new Date(timeString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return timeString;
  }
};

/**
 * Tarih ve saat formatla
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Talep form validasyonu
 */
export const validateTalepForm = (formData: TalepFormData): string | null => {
  if (!formData.talep_turu.trim()) {
    return 'Talep türü seçiniz';
  }
  
  if (!formData.baslangic_tarihi.trim()) {
    return 'Başlangıç tarihi seçiniz';
  }
  
  if (!formData.bitis_tarihi.trim()) {
    return 'Bitiş tarihi seçiniz';
  }
  
  // Tarih kontrolü
  const baslangic = new Date(formData.baslangic_tarihi);
  const bitis = new Date(formData.bitis_tarihi);
  
  if (baslangic >= bitis) {
    return 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
  }
  
  if (baslangic < new Date()) {
    return 'Başlangıç tarihi geçmiş bir tarih olamaz';
  }
  
  if (!formData.aciklama.trim()) {
    return 'Açıklama alanı boş olamaz';
  }
  
  if (formData.aciklama.length < 10) {
    return 'Açıklama en az 10 karakter olmalıdır';
  }
  
  return null;
};

/**
 * Talepleri filtrele
 */
export const filterTalepler = (
  talepler: IstekTalep[], 
  filterType: FilterType,
  searchTerm: string = ''
): IstekTalep[] => {
  let filtered = talepler;
  
  // Durum filtresi
  if (filterType !== 'all') {
    filtered = filtered.filter(talep => talep.durum === filterType);
  }
  
  // Arama filtresi
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(talep => 
      talep.talep_turu.toLowerCase().includes(searchLower) ||
      talep.aciklama.toLowerCase().includes(searchLower) ||
      (talep.yanit_notu && talep.yanit_notu.toLowerCase().includes(searchLower))
    );
  }
  
  return filtered;
};

/**
 * Talepleri sırala (en yeni önce)
 */
export const sortTalepler = (talepler: IstekTalep[]): IstekTalep[] => {
  return [...talepler].sort((a, b) => 
    new Date(b.olusturma_tarihi).getTime() - new Date(a.olusturma_tarihi).getTime()
  );
};

/**
 * Nöbetleri filtrele
 */
export const filterNobetler = (
  nobetler: NobeProgram[],
  filterType: 'all' | 'aktif' | 'tamamlandi' = 'all'
): NobeProgram[] => {
  if (filterType === 'all') return nobetler;
  return nobetler.filter(nobet => nobet.durum === filterType);
};

/**
 * Nöbetleri sırala (tarihe göre)
 */
export const sortNobetler = (nobetler: NobeProgram[]): NobeProgram[] => {
  return [...nobetler].sort((a, b) => 
    new Date(a.tarih).getTime() - new Date(b.tarih).getTime()
  );
};

/**
 * Success mesajı göster (otomatik kaybolur)
 */
export const showSuccessMessage = (
  message: string,
  setSuccessMsg: (msg: string) => void
) => {
  setSuccessMsg(message);
  setTimeout(() => setSuccessMsg(''), 3000);
};

/**
 * Error mesajı göster (otomatik kaybolur)
 */
export const showErrorMessage = (
  message: string,
  setErrorMsg: (msg: string) => void
) => {
  setErrorMsg(message);
  setTimeout(() => setErrorMsg(''), 5000);
};

/**
 * Nöbet durumu badge class'ı al
 */
export const getNobetStatusClass = (durum: string): string => {
  switch (durum) {
    case 'aktif':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'tamamlandi':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'iptal':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Nöbet durumu text'i al
 */
export const getNobetStatusText = (durum: string): string => {
  switch (durum) {
    case 'aktif':
      return 'Aktif';
    case 'tamamlandi':
      return 'Tamamlandı';
    case 'iptal':
      return 'İptal';
    default:
      return 'Bilinmeyen';
  }
};

/**
 * Talep türü ikonu al
 */
export const getTalepTuruIcon = (talepTuru: string) => {
  switch (talepTuru.toLowerCase()) {
    case 'izin talebi':
      return <Calendar className="w-4 h-4" />;
    case 'vardiya değişimi':
    case 'nöbet değişimi':
      return <Clock className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

/**
 * Personel istatistikleri hesapla
 */
export const calculatePersonelStats = (talepler: IstekTalep[], nobetler: NobeProgram[]) => {
  const talepStats = {
    total: talepler.length,
    beklemede: talepler.filter(t => t.durum === 'beklemede').length,
    onaylandi: talepler.filter(t => t.durum === 'onaylandi').length,
    reddedildi: talepler.filter(t => t.durum === 'reddedildi').length
  };
  
  const nobetStats = {
    total: nobetler.length,
    aktif: nobetler.filter(n => n.durum === 'aktif').length,
    tamamlandi: nobetler.filter(n => n.durum === 'tamamlandi').length
  };
  
  return { talepStats, nobetStats };
};

/**
 * Bu ayın nöbetlerini getir
 */
export const getThisMonthNobetler = (nobetler: NobeProgram[]): NobeProgram[] => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  return nobetler.filter(nobet => {
    const nobetDate = new Date(nobet.tarih);
    return nobetDate.getMonth() === thisMonth && nobetDate.getFullYear() === thisYear;
  });
};

/**
 * Bu haftanın taleplerinı getir
 */
export const getThisWeekTalepler = (talepler: IstekTalep[]): IstekTalep[] => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return talepler.filter(talep => {
    const talepDate = new Date(talep.olusturma_tarihi);
    return talepDate >= oneWeekAgo;
  });
}; 