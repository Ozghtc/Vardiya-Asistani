// Bölüm 2: Auth Types
// 50 satır - KURAL 9 uyumlu

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
  phone: string;
  title: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  rol: 'admin' | 'yonetici' | 'personel';
  aktif_mi: boolean;
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
  name?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnrichedUser extends User {
  kurum_adi: string;
  departman_adi: string;
  birim_adi: string;
  lastActivity: string;
  loginTime: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    row?: any;
  };
  error?: string;
  message?: string;
}

export interface ModalState {
  showLogin: boolean;
  showRegister: boolean;
  showPassword: boolean;
} 