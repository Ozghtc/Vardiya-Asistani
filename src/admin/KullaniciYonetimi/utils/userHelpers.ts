// User Management Helper Functions
// UI ve veri işleme yardımcıları

import { User, Permission, FilterRole } from '../types/UserManagement.types';

/**
 * Rol rengini döndürür (CSS class'ları)
 */
export const getRoleColor = (rol: string): string => {
  switch (rol) {
    case 'admin': return 'bg-red-100 text-red-800 border-red-200';
    case 'yonetici': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'personel': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Rol ikonu döndürür (emoji)
 */
export const getRoleIcon = (rol: string): string => {
  switch (rol) {
    case 'admin': return '🔴';
    case 'yonetici': return '🔵';
    case 'personel': return '🟢';
    default: return '⚪';
  }
};

/**
 * Kullanıcıları filtreler (arama ve rol filtresine göre)
 */
export const filterUsers = (
  users: User[], 
  searchTerm: string, 
  filterRole: FilterRole
): User[] => {
  return users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });
};

/**
 * Belirli kullanıcının yetkilerini döndürür
 */
export const getUserPermissions = (userId: string, permissions: Permission[]): Permission[] => {
  return permissions.filter(p => p.kullanici_id === userId);
};

/**
 * Yetki türü rengi döndürür
 */
export const getPermissionColor = (yetkiTuru: string): string => {
  switch (yetkiTuru) {
    case 'YONETICI': return 'bg-red-100 text-red-600';
    case 'DUZENLEYEBILIR': return 'bg-orange-100 text-orange-600';
    case 'SADECE_KENDI': return 'bg-purple-100 text-purple-600';
    default: return 'bg-blue-100 text-blue-600'; // GOREBILIR
  }
};

/**
 * Yetki türü ikonu döndürür
 */
export const getPermissionIcon = (yetkiTuru: string): string => {
  switch (yetkiTuru) {
    case 'YONETICI': return '🔐';
    case 'DUZENLEYEBILIR': return '✏️';
    case 'SADECE_KENDI': return '🔒';
    default: return '👁️'; // GOREBILIR
  }
};

/**
 * Yetki türü açıklama döndürür
 */
export const getPermissionLabel = (yetkiTuru: string): string => {
  switch (yetkiTuru) {
    case 'YONETICI': return 'Yönetici';
    case 'DUZENLEYEBILIR': return 'Düzenleyebilir';
    case 'SADECE_KENDI': return 'Sadece Kendi';
    default: return 'Görüntüleyebilir'; // GOREBILIR
  }
};

/**
 * Form verilerini sıfırlar
 */
export const getInitialFormData = () => ({
  rol: 'admin' as 'admin' | 'yonetici' | 'personel',
  name: '',
  email: '',
  password: '',
  phone: '',
  kurum_id: '',
  departman_id: '',
  birim_id: ''
});

/**
 * Permission form verilerini sıfırlar
 */
export const getInitialPermissionForm = () => ({
  departman_id: '',
  birim_id: '',
  yetki_turu: 'GOREBILIR' as 'GOREBILIR' | 'DUZENLEYEBILIR' | 'YONETICI' | 'SADECE_KENDI'
});

/**
 * Kullanıcı adını formatlar (büyük harf)
 */
export const formatUserName = (name: string): string => {
  return name.toLocaleUpperCase('tr-TR');
};

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Telefon formatı kontrol eder
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9\s\(\)\-\+]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
}; 