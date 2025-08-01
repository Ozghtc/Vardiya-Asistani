export interface NobetGrubu {
  saat: number;
  gunler: string[];
  hours?: string;
}

export interface Vardiya {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  gunler: string[]; // Yeni format
}

export interface Alan {
  id: number;
  alan_adi: string;
  aciklama: string;
  renk: string;
  gunluk_saatler: string; // Yeni format
  aktif_gunler: string; // Yeni format
  vardiyalar: string; // Yeni format
  kullanici_id: number;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  // Computed fields
  totalHours: number;
  totalVardiya: number;
  activeDays: number;
  nobetler?: NobetGrubu[];
  parsedVardiyalar?: Vardiya[];
}

// State Types
export interface TanimliAlanlarState {
  alanlar: Alan[];
  expandedAlan: number | null;
  selectedAlan: Alan | null;
  isDetayModalOpen: boolean;
  deleteDialog: {
    isOpen: boolean;
    alanId?: number;
  };
  loading: boolean;
}

// Hook Return Types
export interface TanimliAlanlarActions {
  setAlanlar: (alanlar: Alan[]) => void;
  setExpandedAlan: (id: number | null) => void;
  setSelectedAlan: (alan: Alan | null) => void;
  setIsDetayModalOpen: (isOpen: boolean) => void;
  setDeleteDialog: (dialog: { isOpen: boolean; alanId?: number }) => void;
  setLoading: (loading: boolean) => void;
}

export interface AlanOperations {
  loadAlanlar: () => Promise<void>;
  handleDelete: (alanId: number) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

export interface AlanModalState {
  openDetayModal: (alan: Alan) => void;
  closeDetayModal: () => void;
  toggleExpand: (alanId: number) => void;
}

// Component Props Types
export interface AlanDetayModalProps {
  alan: Alan | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface GenelRaporProps {
  genelToplam: {
    haftalikSaat: number;
    haftalikVardiya: number;
    aylikSaat: number;
    aylikVardiya: number;
  };
  formatNumber: (num: number) => number;
}

export interface AlanListesiProps {
  alanlar: Alan[];
  loading: boolean;
  expandedAlan: number | null;
  onToggleExpand: (alanId: number) => void;
  onOpenDetayModal: (alan: Alan) => void;
  onHandleDelete: (alanId: number) => void;
  getActiveDays: (alan: Alan) => number;
}

export interface AlanKartiProps {
  alan: Alan;
  isExpanded: boolean;
  loading: boolean;
  onToggleExpand: (alanId: number) => void;
  onOpenDetayModal: (alan: Alan) => void;
  onHandleDelete: (alanId: number) => void;
  getActiveDays: (alan: Alan) => number;
}

export interface ExpandedAlanDetayProps {
  alan: Alan;
}

export interface GunlukVardiyaGruplariProps {
  parsedVardiyalar: Vardiya[];
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  loading: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export interface EmptyStateProps {
  onNavigateToDefinitions: () => void;
}

// Calculation Types
export interface GenelToplam {
  haftalikSaat: number;
  haftalikVardiya: number;
  aylikSaat: number;
  aylikVardiya: number;
}

export interface ParsedAlanData {
  parsedGunlukSaatler: Record<string, number>;
  parsedAktifGunler: string[];
  parsedVardiyalar: Vardiya[];
}

// API Types
export interface CurrentUser {
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  rows?: any[];
  message?: string;
  error?: string;
} 