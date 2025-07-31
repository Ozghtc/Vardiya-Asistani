// Location Data & Constants
// İl/İlçe verileri ve kurum yönetimi sabitleri

import turkiyeIller from '../il-ilceler/turkiye-il-ilce.json';
import { IlData, LocationOption } from '../types/KurumManagement.types';

// Türkiye İl/İlçe Verileri
export const TURKIYE_ILLER: IlData[] = turkiyeIller;

// İl seçenekleri (react-select için)
export const IL_OPTIONS: LocationOption[] = TURKIYE_ILLER.map(il => ({
  value: il.ad,
  label: il.ad
}));

// İlçe seçenekleri getir (seçilen ile göre)
export const getIlceOptions = (selectedIl: string): LocationOption[] => {
  const il = TURKIYE_ILLER.find(il => il.ad === selectedIl);
  if (!il) return [];
  
  return il.ilceler.map(ilce => ({
    value: ilce,
    label: ilce
  }));
};

// Kurum Türleri
export const KURUM_TURLERI = [
  'HASTANE', 
  'KLİNİK', 
  'SAĞLIK OCAĞI', 
  'TIP MERKEZİ', 
  'POLIKLINIK', 
  'ÖZEL HASTANE'
];

// Departman Şablonları
export const DEPARTMAN_SABLONLARI = [
  'ACİL SERVİS', 
  'YOĞUN BAKIM', 
  'DAHİLİYE', 
  'CERRAHİ', 
  'KADIN DOĞUM', 
  'ÇOCUK HASTALIKLARI', 
  'KARDİYOLOJİ', 
  'NÖROLOJİ', 
  'ÜROLOJİ', 
  'GÖZ', 
  'KULAK BURUN BOĞAZ', 
  'DERMATOLOJİ', 
  'PSİKİYATRİ', 
  'ORTOPEDİ', 
  'RADYOLOJİ'
];

// Birim Şablonları
export const BIRIM_SABLONLARI = [
  'YATAN HASTA', 
  'POLİKLİNİK', 
  'AMELİYATHANE', 
  'YOĞUN BAKIM', 
  'ACİL MÜDAHALE', 
  'GÖZLEM', 
  'MUAYENE', 
  'TETKIK', 
  'LABORATUVAR'
];

// Personel Türleri
export const PERSONEL_TURLERI = [
  'DOKTOR', 
  'HEMŞİRE', 
  'SAĞLIK TEKNİKERİ', 
  'TEMİZLİK PERSONELİ', 
  'GÜVENLİK PERSONELİ', 
  'İDARİ PERSONEL', 
  'LABORANT', 
  'RADYOLOJİ TEKNİKERİ', 
  'FİZYOTERAPİST', 
  'PSİKOLOG', 
  'DİYETİSYEN', 
  'ECZACI'
];

// React-Select için seçenekler
export const KURUM_TURU_OPTIONS: LocationOption[] = KURUM_TURLERI.map(turu => ({
  value: turu,
  label: turu
}));

export const DEPARTMAN_OPTIONS: LocationOption[] = DEPARTMAN_SABLONLARI.map(dept => ({
  value: dept,
  label: dept
}));

export const BIRIM_OPTIONS: LocationOption[] = BIRIM_SABLONLARI.map(birim => ({
  value: birim,
  label: birim
}));

export const PERSONEL_TURU_OPTIONS: LocationOption[] = PERSONEL_TURLERI.map(turu => ({
  value: turu,
  label: turu
}));

// Default Values
export const DEFAULT_KURUM_FORM = {
  kurum_adi: '',
  kurum_turu: '',
  adres: '',
  il: null,
  ilce: null,
  telefon: '',
  email: '',
  aktif_mi: true
};

export const DEFAULT_EDIT_VALUES = {
  kurum_adi: '',
  adres: '',
  telefon: '',
  email: ''
}; 