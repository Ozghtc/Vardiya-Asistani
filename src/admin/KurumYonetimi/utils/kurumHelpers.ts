// Kurum Management Helper Functions
import { Kurum, FilterType, KurumFormData, EditKurumValues } from '../types/KurumManagement.types';

// Form validation
export const validateKurumForm = (formData: any): string | null => {
  if (!formData.kurum_adi?.trim()) {
    return 'Kurum adı gereklidir';
  }
  
  if (formData.email && !isValidEmail(formData.email)) {
    return 'Geçerli bir e-posta adresi giriniz';
  }
  
  if (formData.telefon && !isValidPhone(formData.telefon)) {
    return 'Geçerli bir telefon numarası giriniz';
  }
  
  return null;
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Format data for API
export const formatKurumDataForAPI = (formData: any) => {
  return {
    kurum_adi: formData.kurum_adi?.trim(),
    kurum_turu: formData.kurum_turu?.trim(),
    adres: formData.adres?.trim(),
    il: formData.il?.value,
    ilce: formData.ilce?.value,
    telefon: formData.telefon?.trim(),
    email: formData.email?.trim(),
    aktif_mi: formData.aktif_mi,
    departmanlar: Array.isArray(formData.departmanlar) 
      ? formData.departmanlar.join(',') 
      : formData.departmanlar,
    birimler: Array.isArray(formData.birimler) 
      ? formData.birimler.join(',') 
      : formData.birimler
  };
};

// Format data for form
export const formatKurumDataForForm = (kurum: any): any => {
  return {
    kurum_adi: kurum.kurum_adi || '',
    kurum_turu: kurum.kurum_turu || '',
    adres: kurum.adres || '',
    il: kurum.il ? { value: kurum.il, label: kurum.il } : null,
    ilce: kurum.ilce ? { value: kurum.ilce, label: kurum.ilce } : null,
    telefon: kurum.telefon || '',
    email: kurum.email || '',
    aktif_mi: kurum.aktif_mi !== false
  };
};

// Filter kurumlar
export const filterKurumlar = (kurumlar: any[], searchTerm: string, filterType: any): any[] => {
  return kurumlar.filter(kurum => {
    const matchesSearch = !searchTerm || 
      kurum.kurum_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kurum.adres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kurum.kurum_turu?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'aktif' && kurum.aktif_mi !== false) ||
      (filterType === 'pasif' && kurum.aktif_mi === false);
    
    return matchesSearch && matchesFilter;
  });
};

// Sort kurumlar
export const sortKurumlar = (kurumlar: any[]): any[] => {
  return [...kurumlar].sort((a, b) => {
    return a.kurum_adi?.localeCompare(b.kurum_adi || '', 'tr-TR') || 0;
  });
};

// Parse departmanlar string
export const parseDepartmanlar = (departmanStr: string): string[] => {
  if (!departmanStr) return [];
  return departmanStr.split(',').map(d => d.trim()).filter(d => d);
};

// Parse birimler string
export const parseBirimler = (birimStr: string): string[] => {
  if (!birimStr) return [];
  return birimStr.split(',').map(b => b.trim()).filter(b => b);
};

// Array to string
export const arrayToString = (arr: string[]): string => {
  return arr.filter(item => item.trim()).join(', ');
};

// Turkish uppercase
export const toUpperCaseTurkish = (str: string): string => {
  return str.toLocaleUpperCase('tr-TR');
};

// Get initial form data
export const getInitialKurumForm = (): any => {
  return {
    kurum_adi: '',
    kurum_turu: '',
    adres: '',
    il: null,
    ilce: null,
    aktif_mi: true
  };
};

// Get initial edit values
export const getInitialEditValues = (): any => {
  return {
    kurum_adi: '',
    adres: '',
    telefon: '',
    email: ''
  };
};

// Message helpers
export const showSuccessMessage = (message: string, setSuccessMsg: (msg: string) => void) => {
  setSuccessMsg(message);
  setTimeout(() => setSuccessMsg(''), 3000);
};

export const showErrorMessage = (message: string, setErrorMsg: (msg: string) => void) => {
  setErrorMsg(message);
  setTimeout(() => setErrorMsg(''), 5000);
};

// Stats calculation
export const calculateKurumStats = (kurumlar: any[]) => {
  const total = kurumlar.length;
  const aktif = kurumlar.filter(k => k.aktif_mi !== false).length;
  const pasif = total - aktif;
  
  return { total, aktif, pasif };
};

// Group kurumlar by type
export const groupKurumlarByType = (kurumlar: any[]): Record<string, any[]> => {
  return kurumlar.reduce((groups, kurum) => {
    const type = kurum.kurum_turu || 'Diğer';
    if (!groups[type]) groups[type] = [];
    groups[type].push(kurum);
    return groups;
  }, {} as Record<string, any[]>);
};

// Get kurum count by il
export const getKurumCountByIl = (kurumlar: any[]): Record<string, number> => {
  return kurumlar.reduce((counts, kurum) => {
    const il = kurum.il || 'Belirtilmemiş';
    counts[il] = (counts[il] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
};

// UI helpers
export const getToggleActiveText = (aktif_mi: boolean): string => {
  return aktif_mi ? 'Pasif Yap' : 'Aktif Yap';
};

export const getStatusBadgeClass = (aktif_mi: boolean): string => {
  return aktif_mi 
    ? 'bg-green-100 text-green-600' 
    : 'bg-red-100 text-red-600';
};

export const getStatusText = (aktif_mi: boolean): string => {
  return aktif_mi ? 'Aktif' : 'Pasif';
}; 