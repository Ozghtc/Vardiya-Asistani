// Kurum Management Types
export interface Kurum {
  id: string;
  kurum_id?: string;
  kurum_adi: string;
  kurum_turu?: string;
  adres?: string;
  telefon?: string;
  email?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
  departmanlar?: string;
  birimler?: string;
  test_sutun?: string;
  test_yeni_sutun?: string;
  created_at?: string;
}

export interface DepartmanBirim {
  id: string;
  kurum_id: string;
  departman_adi: string;
  birimler: string;
  personel_turleri: string;
}

export interface KurumFormData {
  kurum_adi: string;
  kurum_turu: string;
  adres: string;
  il: { value: string; label: string } | null;
  ilce: { value: string; label: string } | null;
  aktif_mi: boolean;
}

export interface EditKurumValues {
  kurum_adi: string;
  adres: string;
  telefon: string;
  email: string;
}

export interface IlData {
  ad: string;
  ilceler: string[];
}

export interface LocationOption {
  value: string;
  label: string;
}

export type FilterType = 'all' | 'aktif' | 'pasif';

export interface DeleteModalState {
  kurum: Kurum;
  confirmText: string;
}

export interface KurumCrudResult {
  success: boolean;
  message?: string;
  data?: any;
} 