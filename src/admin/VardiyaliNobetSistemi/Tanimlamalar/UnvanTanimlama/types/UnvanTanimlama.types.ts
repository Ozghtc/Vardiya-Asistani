export interface Unvan {
  id: number;
  unvan_adi: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
}

export interface MesaiTanimi {
  id: string;
  mesaiAdi: string;
  mesaiSaati: number;
}

export interface KaydedilenMesai {
  id: number;
  mesai_id: string;
  mesai_adi: string;
  gunler: string;
  mesai_saati: number;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface UnvanFormData {
  yeniUnvan: string;
}

export interface MesaiFormData {
  mesaiAdi: string;
  mesaiSaati: number;
}

export interface UnvanOperations {
  handleUnvanEkle: (unvanData: UnvanFormData) => Promise<void>;
  handleUnvanSil: (unvanId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface MesaiOperations {
  handleMesaiEkle: (mesaiData: MesaiFormData) => Promise<void>;
  handleMesaiTuruSil: (mesaiId: number) => Promise<void>;
  mesaiLoading: boolean;
  loadMesaiTurleri: () => Promise<void>;
}

export interface ToastOperations {
  toasts: Toast[];
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  removeToast: (id: number) => void;
} 