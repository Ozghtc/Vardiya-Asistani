// User Management Types
// Modüler yapı için ayrıştırılan type tanımları

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  rol: 'admin' | 'yonetici' | 'personel';
  aktif_mi: boolean;
  created_at: string;
}

export interface User extends BaseUser {
  kullanici_id?: string; // Hiyerarşik kullanıcı ID'si
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
}

export interface Kurum {
  id: string;
  kurum_id: string; // Hiyerarşik kurum ID'si (01, 02, 03...)
  kurum_adi: string;
  kurum_turu: string;
  adres: string;
  il: string;
  ilce: string;
  aktif_mi: boolean;
  departmanlar?: string; // Virgülle ayrılmış string
  birimler?: string; // Virgülle ayrılmış string
  created_at: string;
}

export interface Departman {
  id: string;
  departman_id?: string; // Hiyerarşik departman ID'si (01_D1, 01_D2...)
  departman_adi: string;
  kurum_id: string;
}

export interface Birim {
  id: string;
  birim_id?: string; // Hiyerarşik birim ID'si (01_B1, 01_B2...)
  birim_adi: string;
  kurum_id: string;
  departman_id: string;
}

export interface Permission {
  id: string;
  kullanici_id: string;
  departman_id: string;
  birim_id: string;
  yetki_turu: 'GOREBILIR' | 'DUZENLEYEBILIR' | 'YONETICI' | 'SADECE_KENDI';
}

// Form Data Types
export interface UserFormData {
  rol: 'admin' | 'yonetici' | 'personel';
  name: string;
  email: string;
  password: string;
  phone: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

export interface PermissionFormData {
  departman_id: string;
  birim_id: string;
  yetki_turu: 'GOREBILIR' | 'DUZENLEYEBILIR' | 'YONETICI' | 'SADECE_KENDI';
}

// UI State Types
export type FilterRole = 'all' | 'admin' | 'yonetici' | 'personel';

export interface DeleteModalState {
  user: User;
  confirmText: string;
}

// Props Types
export interface UserFormProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  editingUser: User | null;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  kurumlar: Kurum[];
  usersTableId: number | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onUpdate: (e: React.FormEvent) => Promise<void>;
}

export interface UserListProps {
  users: User[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterRole: FilterRole;
  setFilterRole: React.Dispatch<React.SetStateAction<FilterRole>>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  kurumlar: Kurum[];
  departmanlar: Departman[];
  birimler: Birim[];
  permissions: Permission[];
  onEditUser: (user: User) => void;
  onToggleActive: (user: User) => Promise<void>;
  onDeleteUser: (user: User) => void;
  onShowPermissionModal: () => void;
}

export interface PermissionManagementProps {
  show: boolean;
  onClose: () => void;
  selectedUser: User | null;
  permissions: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
  departmanlar: Departman[];
  birimler: Birim[];
  permissionForm: PermissionFormData;
  setPermissionForm: React.Dispatch<React.SetStateAction<PermissionFormData>>;
  onAddPermission: () => void;
  onDeletePermission: (permissionId: string) => void;
}

export interface DeleteConfirmationProps {
  show: boolean;
  deleteModal: DeleteModalState | null;
  setDeleteModal: React.Dispatch<React.SetStateAction<DeleteModalState | null>>;
  onConfirmDelete: () => Promise<void>;
} 