// User Management Panel - Modular Version
// Ana kullanıcı yönetimi paneli - tüm modüler bileşenleri orchestrate eder

import React from 'react';
import { useToast } from '../../components/ui/ToastContainer';
import { createUsersTable } from '../../lib/api';

// Modular Imports
import { useUserManagement } from './hooks/useUserManagement';
import { UserCrudOperations } from './services/userCrudOperations';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import PermissionManagement from './components/PermissionManagement';
import DeleteConfirmation from './components/DeleteConfirmation';
import { getInitialFormData } from './utils/userHelpers';

const KullaniciYonetimPaneli: React.FC = () => {
  // Toast hook
  const { showToast } = useToast();
  
  // Custom hook for all state management
  const {
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
    resetFormData,
    resetPermissionForm
  } = useUserManagement();

  // CRUD Operations Service
  const crudOps = new UserCrudOperations(showToast, usersTableId, loadUsers);

  // Form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await crudOps.handleFormSubmit(formData);
    if (success) {
      resetFormData();
    }
  };

  // Update user handler
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const success = await crudOps.handleUpdateUser(editingUser, formData);
    if (success) {
      resetFormData();
    }
  };

  // Delete user handler
  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    
    const success = await crudOps.handleDeleteUser(showDeleteModal.user, showDeleteModal.confirmText);
    if (success) {
          setPermissions(prev => prev.filter(p => p.kullanici_id !== showDeleteModal.user.id));
          setShowDeleteModal(null);
          setSelectedUser(null);
    }
  };

  // Toggle active handler
  const handleToggleActive = async (user: any) => {
    await crudOps.handleToggleActive(user);
  };

  // Edit user handler
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormData({
      rol: user.rol,
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      kurum_id: user.kurum_id || '',
      departman_id: user.departman_id || '',
      birim_id: user.birim_id || ''
    });
  };

  // Add permission handler
  const handleAddPermission = () => {
    const newPermission = crudOps.handleAddPermission(selectedUser, permissions, permissionForm);
    if (newPermission) {
    setPermissions(prev => [...prev, newPermission]);
      resetPermissionForm();
    }
  };

  // Delete permission handler
  const handleDeletePermission = (permissionId: string) => {
    setPermissions(prev => prev.filter(p => p.id !== permissionId));
  };

  // TEST: Kullanıcı tablosu oluştur
  const handleCreateUsersTable = async () => {
    setTableCreating(true);
    try {
      const result = await crudOps.handleCreateUsersTable();
      
      if (result.success && result.tableId) {
        setUsersTableId(result.tableId);
        crudOps.updateTableId(result.tableId);
        alert('✅ Kullanıcı tablosu başarıyla oluşturuldu! ID: ' + result.tableId);
      } else {
        alert('❌ Kullanıcı tablosu oluşturulamadı');
      }
    } catch (error) {
      console.error('❌ Tablo oluşturma hatası:', error);
      alert('❌ Kullanıcı tablosu oluşturulamadı');
    } finally {
      setTableCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-full mx-0 mt-4 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Kurumlar yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-0 mt-4 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Toplam: {users.length} kullanıcı
          </div>
          <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            Kurumlar: {kurumlar.length}
          </div>
          
          {usersTableId && (
            <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
              ✅ Kullanıcı Tablosu: {usersTableId}
            </div>
          )}
        </div>
      </div>

      {/* User Form Component */}
      <UserForm
        formData={formData}
        setFormData={setFormData}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        kurumlar={kurumlar}
        usersTableId={usersTableId}
        onSubmit={handleFormSubmit}
        onUpdate={handleUpdateUser}
      />

      {/* User List Component */}
      <UserList
        users={users}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        kurumlar={kurumlar}
        departmanlar={departmanlar}
        birimler={birimler}
        permissions={permissions}
        onEditUser={handleEditUser}
        onToggleActive={handleToggleActive}
        onDeleteUser={(user) => setShowDeleteModal({ user, confirmText: '' })}
        onShowPermissionModal={() => setShowPermissionModal(true)}
      />

      {/* Permission Management Modal */}
      <PermissionManagement
        show={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        selectedUser={selectedUser}
        permissions={permissions}
        setPermissions={setPermissions}
        departmanlar={departmanlar}
        birimler={birimler}
        permissionForm={permissionForm}
        setPermissionForm={setPermissionForm}
        onAddPermission={handleAddPermission}
        onDeletePermission={handleDeletePermission}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        show={!!showDeleteModal}
        deleteModal={showDeleteModal}
        setDeleteModal={setShowDeleteModal}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default KullaniciYonetimPaneli; 