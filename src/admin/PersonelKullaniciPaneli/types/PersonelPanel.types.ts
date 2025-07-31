// Personel Kullanıcı Paneli Types
// Tüm personel paneli için gerekli type tanımları

export interface IstekTalep {
  id: string;
  kullanici_id?: string;
  talep_turu: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  aciklama: string;
  durum: 'beklemede' | 'onaylandi' | 'reddedildi';
  olusturma_tarihi: string;
  yanit_tarihi?: string;
  yanit_notu?: string;
}

export interface PersonelUser {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  tc_kimlik: string;
  telefon?: string;
  departman?: string;
  birim?: string;
  unvan?: string;
  role: string;
}

export interface NobeProgram {
  id: string;
  personel_id: string;
  tarih: string;
  vardiya_baslangic: string;
  vardiya_bitis: string;
  departman: string;
  birim: string;
  durum: 'aktif' | 'tamamlandi' | 'iptal';
  notlar?: string;
}

export interface TabConfig {
  id: string;
  title: string;
  icon: JSX.Element;
  bgColor: string;
  hoverColor: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: {
    rows: T[];
    count?: number;
  };
  message?: string;
  error?: string;
}

export interface ApiConfig {
  apiKey: string | undefined;
  userEmail: string | undefined;
  projectPassword: string | undefined;
  baseURL: string;
}

// Form Types
export interface TalepFormData {
  talep_turu: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  aciklama: string;
}

// UI State Types
export type TabType = 'nobetlerim' | 'istekler' | 'profil';
export type DurumType = 'beklemede' | 'onaylandi' | 'reddedildi';
export type FilterType = 'all' | 'beklemede' | 'onaylandi' | 'reddedildi';

// Props Types
export interface NobetlerimTabProps {
  user: PersonelUser | null;
  loading: boolean;
  nobetler: NobeProgram[];
  onRefresh: () => Promise<void>;
}

export interface IstekTaleplerimTabProps {
  user: PersonelUser | null;
  talepler: IstekTalep[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  onCreateTalep: (formData: TalepFormData) => Promise<void>;
  onDeleteTalep: (talepId: string) => Promise<void>;
}

export interface TalepCardProps {
  talep: IstekTalep;
  onDelete?: (talepId: string) => void;
  showActions?: boolean;
}

// Hook Return Types
export interface PersonelPanelHook {
  // User
  user: PersonelUser | null;
  
  // Tab Management
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Talepler
  talepler: IstekTalep[];
  setTalepler: React.Dispatch<React.SetStateAction<IstekTalep[]>>;
  
  // Nobetler
  nobetler: NobeProgram[];
  setNobetler: React.Dispatch<React.SetStateAction<NobeProgram[]>>;
  
  // UI States
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  successMsg: string;
  setSuccessMsg: React.Dispatch<React.SetStateAction<string>>;
  
  // Methods
  loadTalepler: () => Promise<void>;
  loadNobetler: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// Service Types
export interface PersonelApiResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Constants
export const TALEP_TURLERI = [
  'İzin Talebi',
  'Vardiya Değişimi',
  'Nöbet Değişimi',
  'Ek Mesai Talebi',
  'Diğer'
] as const;

export const DURUM_LABELS: Record<DurumType, string> = {
  'beklemede': 'Beklemede',
  'onaylandi': 'Onaylandı',
  'reddedildi': 'Reddedildi'
};

export const DURUM_COLORS: Record<DurumType, string> = {
  'beklemede': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'onaylandi': 'bg-green-100 text-green-800 border-green-200',
  'reddedildi': 'bg-red-100 text-red-800 border-red-200'
};

export const NOBETO_DURUMLARI = [
  'aktif',
  'tamamlandi', 
  'iptal'
] as const; 