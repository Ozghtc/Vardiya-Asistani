// VardiyaTanimlama Modülü - TypeScript Types
// Tüm interface ve type tanımları

export interface Shift {
  id: number;
  vardiya_adi: string;
  baslangic_saati: string;
  bitis_saati: string;
  calisma_saati: number;
  aktif_mi: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

export interface VardiyaFormData {
  name: string;
  startHour: string;
  endHour: string;
}

export interface CurrentUser {
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

export interface VardiyaOperationsState {
  shifts: Shift[];
  loading: boolean;
  error: string;
  showSuccess: boolean;
}

export interface VardiyaOperationsActions {
  loadShifts: () => Promise<void>;
  handleSubmit: (e: React.FormEvent, formData: VardiyaFormData) => Promise<void>;
  handleDelete: (id: number | string) => Promise<void>;
  handleQuickAdd: (shiftName: string, startHour: string, endHour: string) => Promise<void>;
  setError: (error: string) => void;
  setShowSuccess: (show: boolean) => void;
}

export interface HizliVardiyaEklemeProps {
  shifts: Shift[];
  onQuickAdd: (shiftName: string, startHour: string, endHour: string) => Promise<void>;
  loading: boolean;
}

export interface ManuelVardiyaFormuProps {
  onSubmit: (e: React.FormEvent, formData: VardiyaFormData) => Promise<void>;
  loading: boolean;
  error: string;
}

export interface TanimliVardiyaListesiProps {
  shifts: Shift[];
  onDelete: (id: number | string) => Promise<void>;
}

export type QuickShiftType = 'GÜNDÜZ' | 'AKŞAM' | 'GECE' | '24 SAAT';

export interface QuickShiftConfig {
  name: QuickShiftType;
  startHour: string;
  endHour: string;
} 