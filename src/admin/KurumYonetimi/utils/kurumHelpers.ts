// Kurum Management Helper Functions
// Kurum yönetimi için yardımcı fonksiyonlar

import { Kurum, KurumFormData, EditKurumValues, FilterType } from '../types/KurumManagement.types';

/**
 * Kurum form validasyonu
 */
export const validateKurumForm = (formData: KurumFormData): string | null => {
  if (!formData.kurum_adi.trim()) {
    return 'Kurum adı gereklidir';
  }
  
  if (!formData.kurum_turu.trim()) {
    return 'Kurum türü seçiniz';
  }
  
  if (formData.email && !isValidEmail(formData.email)) {
    return 'Geçerli bir email adresi giriniz';
  }
  
  if (formData.telefon && !isValidPhone(formData.telefon)) {
    return 'Geçerli bir telefon numarası giriniz';
  }
  
  return null;
};

/**
 * Email validasyonu
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Telefon validasyonu
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9\s\(\)\-\+]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

/**
 * Kurum verilerini formatla (API için)
 */
export const formatKurumDataForAPI = (formData: KurumFormData) => {
  return {
    kurum_adi: formData.kurum_adi.trim(),
    kurum_turu: formData.kurum_turu.trim(),
    adres: formData.adres.trim(),
    il: formData.il?.value || '',
    ilce: formData.ilce?.value || '',
    telefon: formData.telefon?.trim() || '',
    email: formData.email?.trim() || '',
    aktif_mi: formData.aktif_mi
  };
};

/**
 * API'den gelen kurum verisini form formatına çevir
 */
export const formatKurumDataForForm = (kurum: Kurum): KurumFormData => {
  return {
    kurum_adi: kurum.kurum_adi || '',
    kurum_turu: kurum.kurum_turu || '',
    adres: kurum.adres || '',
    il: kurum.il ? { value: kurum.il, label: kurum.il } : null,
    ilce: kurum.ilce ? { value: kurum.ilce, label: kurum.ilce } : null,
    telefon: kurum.telefon || '',
    email: kurum.email || '',
    aktif_mi: kurum.aktif_mi ?? true
  };
};

/**
 * Kurumları filtrele (arama ve durum filtresine göre)
 */
export const filterKurumlar = (
  kurumlar: Kurum[], 
  searchTerm: string, 
  filterType: FilterType
): Kurum[] => {
  return kurumlar.filter(kurum => {
    // Arama filtresi
    const matchesSearch = searchTerm === '' || 
      kurum.kurum_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (kurum.adres && kurum.adres.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kurum.il && kurum.il.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kurum.kurum_turu && kurum.kurum_turu.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Durum filtresi
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'aktif' && kurum.aktif_mi) ||
      (filterType === 'pasif' && !kurum.aktif_mi);
    
    return matchesSearch && matchesFilter;
  });
};

/**
 * Kurum listesini sırala (kurum adına göre)
 */
export const sortKurumlar = (kurumlar: Kurum[]): Kurum[] => {
  return [...kurumlar].sort((a, b) => 
    a.kurum_adi.localeCompare(b.kurum_adi, 'tr-TR')
  );
};

/**
 * Departman string'ini array'e çevir
 */
export const parseDepartmanlar = (departmanStr: string): string[] => {
  if (!departmanStr) return [];
  return departmanStr.split(',').map(d => d.trim()).filter(d => d.length > 0);
};

/**
 * Birim string'ini array'e çevir
 */
export const parseBirimler = (birimStr: string): string[] => {
  if (!birimStr) return [];
  return birimStr.split(',').map(b => b.trim()).filter(b => b.length > 0);
};

/**
 * Array'i string'e çevir (virgülle ayrılmış)
 */
export const arrayToString = (arr: string[]): string => {
  return arr.filter(item => item.trim().length > 0).join(', ');
};

/**
 * String'i büyük harfe çevir (Türkçe karakterler dahil)
 */
export const toUpperCaseTurkish = (str: string): string => {
  return str.toLocaleUpperCase('tr-TR');
};

/**
 * Form'u sıfırla
 */
export const getInitialKurumForm = (): KurumFormData => ({
  kurum_adi: '',
  kurum_turu: '',
  adres: '',
  il: null,
  ilce: null,
  telefon: '',
  email: '',
  aktif_mi: true
});

/**
 * Edit values'ları sıfırla
 */
export const getInitialEditValues = (): EditKurumValues => ({
  kurum_adi: '',
  adres: '',
  telefon: '',
  email: ''
});

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
 * Kurum istatistiklerini hesapla
 */
export const calculateKurumStats = (kurumlar: Kurum[]) => {
  const total = kurumlar.length;
  const aktif = kurumlar.filter(k => k.aktif_mi).length;
  const pasif = total - aktif;
  
  return { total, aktif, pasif };
};

/**
 * Kurum türlerine göre gruplama
 */
export const groupKurumlarByType = (kurumlar: Kurum[]): Record<string, Kurum[]> => {
  return kurumlar.reduce((groups, kurum) => {
    const type = kurum.kurum_turu || 'Belirsiz';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(kurum);
    return groups;
  }, {} as Record<string, Kurum[]>);
};

/**
 * İllere göre kurum sayısı
 */
export const getKurumCountByIl = (kurumlar: Kurum[]): Record<string, number> => {
  return kurumlar.reduce((counts, kurum) => {
    const il = kurum.il || 'Belirsiz';
    counts[il] = (counts[il] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
};

/**
 * Aktif/Pasif durumunu toggle et
 */
export const getToggleActiveText = (aktif_mi: boolean): string => {
  return aktif_mi ? 'Pasif Yap' : 'Aktif Yap';
};

/**
 * Durum badge class'ı al
 */
export const getStatusBadgeClass = (aktif_mi: boolean): string => {
  return aktif_mi 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

/**
 * Durum text'i al
 */
export const getStatusText = (aktif_mi: boolean): string => {
  return aktif_mi ? 'Aktif' : 'Pasif';
}; 