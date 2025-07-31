// User Management CRUD Operations Service
// API çağrıları ve iş mantığı

import { addUser, updateUser, deleteUser, createUsersTable, clearAllCache, clearTableCache } from '../../../lib/api';
import { User, UserFormData, Permission } from '../types/UserManagement.types';

// Toast interface (will be imported from actual component)
interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ShowToastFunction {
  (options: ToastOptions): void;
}

export class UserCrudOperations {
  private showToast: ShowToastFunction;
  private usersTableId: number | null;
  private loadUsers: (forceRefresh?: boolean) => Promise<void>;

  constructor(
    showToast: ShowToastFunction,
    usersTableId: number | null,
    loadUsers: (forceRefresh?: boolean) => Promise<void>
  ) {
    this.showToast = showToast;
    this.usersTableId = usersTableId;
    this.loadUsers = loadUsers;
  }

  // Kullanıcı ekleme
  async handleFormSubmit(formData: UserFormData): Promise<boolean> {
    // Form validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      this.showToast({
        type: 'warning',
        title: 'Eksik Bilgi',
        message: 'Lütfen tüm zorunlu alanları doldurunuz.'
      });
      return false;
    }

    // Kurum bilgileri validation (yönetici ve personel için)
    if ((formData.rol === 'yonetici' || formData.rol === 'personel') && 
        (!formData.kurum_id || !formData.departman_id || !formData.birim_id)) {
      this.showToast({
        type: 'warning',
        title: 'Kurum Bilgileri Eksik',
        message: 'Lütfen kurum, departman ve birim bilgilerini seçiniz.'
      });
      return false;
    }

    // Tablo ID kontrolü
    if (!this.usersTableId) {
      this.showToast({
        type: 'error',
        title: 'Tablo Bulunamadı',
        message: 'Kullanıcı tablosu bulunamadı. Lütfen önce tabloyu oluşturunuz.'
      });
      return false;
    }
    
    try {
      const result = await addUser(this.usersTableId, formData);
      if (result.success) {
        this.showToast({
          type: 'success',
          title: 'Kullanıcı Eklendi',
          message: `${formData.name} başarıyla sisteme eklendi.`
        });
        
        // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
        clearAllCache(); // Tüm cache'i temizle
        clearTableCache(String(this.usersTableId)); // kullanicilar_final tablosu
        
        // Kullanıcı listesini ZORLA yeniden yükle
        await this.loadUsers(true); // 🚀 FORCE REFRESH!
        
        return true;
      } else {
        this.showToast({
          type: 'error',
          title: 'Ekleme Başarısız',
          message: result.message || 'Kullanıcı eklenirken bir hata oluştu.'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Kullanıcı ekleme hatası:', error);
      this.showToast({
        type: 'error',
        title: 'Sistem Hatası',
        message: 'Kullanıcı eklenirken beklenmeyen bir hata oluştu.'
      });
      return false;
    }
  }

  // Kullanıcı güncelleme
  async handleUpdateUser(editingUser: User, formData: UserFormData): Promise<boolean> {
    if (!editingUser || !this.usersTableId) return false;

    try {
      const result = await updateUser(this.usersTableId, editingUser.id, formData);
      if (result.success) {
        this.showToast({
          type: 'success',
          title: 'Kullanıcı Güncellendi',
          message: `${editingUser.name} başarıyla güncellendi.`
        });
        
        // 🔄 FRESH API REQUEST - Cache yok, direkt backend'den çek
        await this.loadUsers(true);
        return true;
      } else {
        this.showToast({
          type: 'error',
          title: 'Güncelleme Başarısız',
          message: 'Kullanıcı güncellenirken bir hata oluştu.'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Kullanıcı güncelleme hatası:', error);
      this.showToast({
        type: 'error',
        title: 'Sistem Hatası',
        message: 'Kullanıcı güncellenirken beklenmeyen bir hata oluştu.'
      });
      return false;
    }
  }

  // Kullanıcı silme
  async handleDeleteUser(user: User, confirmText: string): Promise<boolean> {
    if (confirmText !== user.name || !this.usersTableId) return false;

    try {
      const result = await deleteUser(this.usersTableId, user.id);
      if (result.success) {
        this.showToast({
          type: 'success',
          title: 'Kullanıcı Silindi',
          message: `${user.name} başarıyla sistemden kaldırıldı.`
        });
        
        // 🔄 FRESH API REQUEST - Cache yok, direkt backend'den çek
        await this.loadUsers(true);
        return true;
      } else {
        this.showToast({
          type: 'error',
          title: 'Silme Başarısız',
          message: 'Kullanıcı silinirken bir hata oluştu.'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Kullanıcı silme hatası:', error);
      this.showToast({
        type: 'error',
        title: 'Sistem Hatası',
        message: 'Kullanıcı silinirken beklenmeyen bir hata oluştu.'
      });
      return false;
    }
  }

  // Kullanıcı aktif/pasif durumu değiştirme
  async handleToggleActive(user: User): Promise<boolean> {
    if (!this.usersTableId) return false;
    
    try {
      const result = await updateUser(this.usersTableId, user.id, { aktif_mi: !user.aktif_mi });
      if (result.success) {
        // 🔄 FRESH API REQUEST - Cache yok, direkt backend'den çek
        await this.loadUsers(true);
        
        this.showToast({
          type: 'success',
          title: 'Durum Güncellendi',
          message: `${user.name} kullanıcısının durumu güncellendi.`
        });
        return true;
      } else {
        this.showToast({
          type: 'error',
          title: 'Güncelleme Başarısız',
          message: 'Kullanıcı durumu güncellenirken bir hata oluştu.'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Kullanıcı güncelleme hatası:', error);
      this.showToast({
        type: 'error',
        title: 'Sistem Hatası',
        message: 'Kullanıcı durumu güncellenirken beklenmeyen bir hata oluştu.'
      });
      return false;
    }
  }

  // Yetki ekleme
  handleAddPermission(
    selectedUser: User | null, 
    permissions: Permission[], 
    permissionForm: { departman_id: string; birim_id: string; yetki_turu: 'GOREBILIR' | 'DUZENLEYEBILIR' | 'YONETICI' | 'SADECE_KENDI' }
  ): Permission | null {
    if (!selectedUser || !permissionForm.departman_id || !permissionForm.birim_id) return null;

    const newPermission: Permission = {
      id: `perm_${permissions.length + 1}`, // KURAL 18: Date.now() kaldırıldı
      kullanici_id: selectedUser.id,
      departman_id: permissionForm.departman_id,
      birim_id: permissionForm.birim_id,
      yetki_turu: permissionForm.yetki_turu
    };

    return newPermission;
  }

  // Kullanıcı tablosu oluşturma (TEST için)
  async handleCreateUsersTable(): Promise<{ success: boolean; tableId?: number }> {
    try {
      const result = await createUsersTable();
      
      if (result.success) {
        const tableId = result.data?.table?.id;
        if (tableId) {
          return { success: true, tableId };
        } else {
          return { success: false };
        }
      } else {
        console.error('❌ Tablo oluşturma hatası:', result);
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Tablo oluşturma hatası:', error);
      return { success: false };
    }
  }

  // CRUD service'i güncelle (table ID değiştiğinde)  
  updateTableId(newTableId: number | null) {
    this.usersTableId = newTableId;
  }
} 