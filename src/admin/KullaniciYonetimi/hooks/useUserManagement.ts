// User Management Custom Hook
// State yönetimi ve veri yükleme işlemleri

import { useState, useEffect } from 'react';
import { useTemporaryState } from '../../../hooks/useApiState';
import { getKurumlar, getUsers, clearAllCache, clearTableCache } from '../../../lib/api';
import {
  User,
  Kurum,
  Departman,
  Birim,
  Permission,
  UserFormData,
  PermissionFormData,
  FilterRole,
  DeleteModalState
} from '../types/UserManagement.types';
import { getInitialFormData, getInitialPermissionForm } from '../utils/userHelpers';

export const useUserManagement = () => {
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [kurumlar, setKurumlar] = useState<Kurum[]>([]);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [birimler, setBirimler] = useState<Birim[]>([]);
  const [permissions, setPermissions] = useTemporaryState<Permission[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableCreating, setTableCreating] = useState(false);
  const [usersTableId, setUsersTableId] = useState<number | null>(33);

  // Form States
  const [formData, setFormData] = useState<UserFormData>(getInitialFormData());
  const [permissionForm, setPermissionForm] = useState<PermissionFormData>(getInitialPermissionForm());

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<DeleteModalState | null>(null);

  // Load kurumlar from API
  const loadKurumlar = async () => {
    setLoading(true);
    try {
      const apiKurumlar = await getKurumlar(true); // Fresh data
      
      if (!apiKurumlar || apiKurumlar.length === 0) {
        console.warn('⚠️ API\'den kurum verisi gelmedi!');
        return;
      }
      
      setKurumlar(apiKurumlar);
      
      // Parse departmanlar and birimler from kurumlar
      const allDepartmanlar: Departman[] = [];
      const allBirimler: Birim[] = [];
      
      apiKurumlar.forEach((kurum: Kurum) => {
        if (kurum.departmanlar) {
          kurum.departmanlar.split(', ').filter((d: string) => d.trim()).forEach((dept: string, index: number) => {
            allDepartmanlar.push({
              id: `${kurum.kurum_id}_D${index + 1}`, // @HIYERARSIK_ID_SISTEMI.md uyumlu: 01_D1, 01_D2
              departman_adi: dept,
              kurum_id: kurum.kurum_id
            });
          });
        }
        
        if (kurum.birimler) {
          kurum.birimler.split(', ').filter((b: string) => b.trim()).forEach((birim: string, index: number) => {
            allBirimler.push({
              id: `${kurum.kurum_id}_B${index + 1}`, // @HIYERARSIK_ID_SISTEMI.md uyumlu: 01_B1, 01_B2
              birim_adi: birim,
              kurum_id: kurum.kurum_id,
              departman_id: '' // Birimler kuruma bağlı
            });
          });
        }
      });
      
      setDepartmanlar(allDepartmanlar);
      setBirimler(allBirimler);
    } catch (error) {
      console.error('❌ Kurumlar yüklenirken hata:', error);
      setError('Kurumlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load users from API - HER ZAMAN FRESH DATA
  const loadUsers = async (forceRefresh: boolean = true) => {
    if (!usersTableId) return;
    
    try {
      // 🧹 EXTRA CACHE TEMİZLEME - DOUBLE SURE!
      if (forceRefresh) {
        clearAllCache(); // Tüm cache'i temizle
        clearTableCache(String(usersTableId)); // Kullanıcı tablosu cache'ini temizle
      }
      
      // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
      const apiUsers = await getUsers(usersTableId, forceRefresh);
      setUsers(apiUsers);
      // KURAL 18: Debug log kaldırıldı - kullanıcı bilgisi sızıntısı riski
    } catch (error) {
      console.error('❌ Kullanıcılar yüklenirken hata:', error);
      setError('Kullanıcılar yüklenirken hata oluştu');
    }
  };

  // Reset form data
  const resetFormData = () => {
    setFormData(getInitialFormData());
    setEditingUser(null);
  };

  // Reset permission form
  const resetPermissionForm = () => {
    setPermissionForm(getInitialPermissionForm());
  };

  // Initial data loading
  useEffect(() => {
    loadKurumlar();
  }, []);

  // Kullanıcıları yükle - Sayfa açılınca ve tablo ID değişince
  useEffect(() => {
    if (usersTableId) {
      loadUsers(true); // Her zaman fresh data
    }
  }, [usersTableId]);

  // Sayfa ilk açıldığında kullanıcıları yükle
  useEffect(() => {
    if (usersTableId) {
      loadUsers(true);
    }
  }, []); // Component mount olduğunda bir kez çalış

  return {
    // Data
    users,
    setUsers,
    kurumlar,
    departmanlar,
    birimler,
    permissions,
    setPermissions,

    // Loading States
    loading,
    error,
    setError,
    tableCreating,
    setTableCreating,
    usersTableId,
    setUsersTableId,

    // Form States
    formData,
    setFormData,
    permissionForm,
    setPermissionForm,

    // UI States
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    selectedUser,
    setSelectedUser,
    editingUser,
    setEditingUser,
    showPermissionModal,
    setShowPermissionModal,
    showDeleteModal,
    setShowDeleteModal,

    // Methods
    loadUsers,
    loadKurumlar,
    resetFormData,
    resetPermissionForm
  };
}; 