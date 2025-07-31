// Kurum Management Types
// Tüm kurum yönetimi için gerekli type tanımları

export interface Kurum {
  id: string;
  kurum_id?: string; // Hiyerarşik kurum ID'si
  kurum_adi: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  telefon?: string;
  email?: string;
  aktif_mi?: boolean;
  test_sutun?: string; // DEPARTMAN listesi (virgülle ayrılmış)
  test_yeni_sutun?: string; // BIRIM listesi (virgülle ayrılmış)
  departmanlar?: string; // Virgülle ayrılmış string
  birimler?: string; // Virgülle ayrılmış string
  created_at: string;
}

export interface DepartmanBirim {
  id: string;
  kurum_id: string;
  departman_adi: string;
  birimler: string; // Virgülle ayrılmış string
  personel_turleri: string; // Virgülle ayrılmış string
}

// Form Data Types
export interface KurumFormData {
  kurum_adi: string;
  kurum_turu: string;
  adres: string;
  il: { value: string; label: string } | null;
  ilce: { value: string; label: string } | null;
  telefon?: string;
  email?: string;
  aktif_mi: boolean;
}

export interface EditKurumValues {
  kurum_adi: string;
  adres: string;
  telefon: string;
  email: string;
}

// Location Types
export interface IlData {
  ad: string;
  ilceler: string[];
}

export interface LocationOption {
  value: string;
  label: string;
}

// UI State Types
export type FilterType = 'all' | 'aktif' | 'pasif';

export interface DeleteModalState {
  kurum: Kurum;
  confirmText: string;
}

// Props Types
export interface KurumListProps {
  kurumlar: Kurum[];
  loading: boolean;
  onEdit: (kurum: Kurum) => void;
  onDelete: (kurum: Kurum) => void;
  onToggleActive: (kurum: Kurum) => Promise<void>;
  onRefresh: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  editKurumId: string | null;
  setEditKurumId: (id: string | null) => void;
  editValues: EditKurumValues;
  setEditValues: (values: EditKurumValues) => void;
  operationLoading: string | null;
  onSaveEdit: (kurumId: string) => Promise<void>;
  onCancelEdit: () => void;
}

export interface DepartmanManagementProps {
  selectedKurum: Kurum | null;
  departmanBirimler: DepartmanBirim[];
  onUpdate: () => Promise<void>;
  editingDepartman: { kurumId: string; departmanIndex: number } | null;
  setEditingDepartman: (editing: { kurumId: string; departmanIndex: number } | null) => void;
  newDepartmanInputs: { [kurumId: string]: string };
  setNewDepartmanInputs: (inputs: { [kurumId: string]: string }) => void;
  newBirimInputs: { [key: string]: string };
  setNewBirimInputs: (inputs: { [key: string]: string }) => void;
  newPersonelInputs: { [key: string]: string };
  setNewPersonelInputs: (inputs: { [key: string]: string }) => void;
}

export interface DeleteConfirmationProps {
  show: boolean;
  deleteModal: DeleteModalState | null;
  setDeleteModal: (modal: DeleteModalState | null) => void;
  onConfirmDelete: () => Promise<void>;
}

// Kurum Management Hook Return Type
export interface KurumManagementHook {
  // Data States
  kurumlar: Kurum[];
  setKurumlar: React.Dispatch<React.SetStateAction<Kurum[]>>;
  departmanBirimler: DepartmanBirim[];
  setDepartmanBirimler: React.Dispatch<React.SetStateAction<DepartmanBirim[]>>;
  
  // Form States
  kurumForm: KurumFormData;
  setKurumForm: React.Dispatch<React.SetStateAction<KurumFormData>>;
  formDepartmanlar: string[];
  setFormDepartmanlar: React.Dispatch<React.SetStateAction<string[]>>;
  formBirimler: string[];
  setFormBirimler: React.Dispatch<React.SetStateAction<string[]>>;
  
  // UI States
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterType: FilterType;
  setFilterType: React.Dispatch<React.SetStateAction<FilterType>>;
  selectedKurum: Kurum | null;
  setSelectedKurum: React.Dispatch<React.SetStateAction<Kurum | null>>;
  editingKurum: Kurum | null;
  setEditingKurum: React.Dispatch<React.SetStateAction<Kurum | null>>;
  showDeleteModal: DeleteModalState | null;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<DeleteModalState | null>>;
  
  // Edit States (from Kurumlar.tsx)
  editKurumId: string | null;
  setEditKurumId: React.Dispatch<React.SetStateAction<string | null>>;
  editValues: EditKurumValues;
  setEditValues: React.Dispatch<React.SetStateAction<EditKurumValues>>;
  operationLoading: string | null;
  setOperationLoading: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Inline Editing States
  editingDepartman: { kurumId: string; departmanIndex: number } | null;
  setEditingDepartman: React.Dispatch<React.SetStateAction<{ kurumId: string; departmanIndex: number } | null>>;
  newDepartmanInputs: { [kurumId: string]: string };
  setNewDepartmanInputs: React.Dispatch<React.SetStateAction<{ [kurumId: string]: string }>>;
  newBirimInputs: { [key: string]: string };
  setNewBirimInputs: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  newPersonelInputs: { [key: string]: string };
  setNewPersonelInputs: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  
  // Messages
  successMsg: string;
  setSuccessMsg: React.Dispatch<React.SetStateAction<string>>;
  errorMsg: string;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  
  // Methods
  loadKurumlar: (forceRefresh?: boolean) => Promise<void>;
  resetForm: () => void;
}

// Service Types
export interface KurumCrudResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
} 