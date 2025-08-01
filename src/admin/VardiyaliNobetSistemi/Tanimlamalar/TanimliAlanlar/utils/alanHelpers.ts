import { CurrentUser } from '../types/TanimliAlanlar.types';

// Kullanıcı rolüne göre ana sayfa route'unu belirle
export const getHomeRoute = (userRole?: string): string => {
  if (!userRole) return '/';
  switch (userRole) {
    case 'admin':
      return '/admin';
    case 'yonetici':
      return '/vardiyali-nobet';
    case 'personel':
      return '/personel/panel';
    default:
      return '/';
  }
};

// AuthContext'ten gerçek kullanıcı bilgilerini al
export const getCurrentUser = (user: any): CurrentUser | null => {
  if (user && user.kurum_id && user.departman_id && user.birim_id) {
    return { 
      kurum_id: user.kurum_id, 
      departman_id: user.departman_id, 
      birim_id: user.birim_id 
    };
  }
  return null;
};

// Toggle expand logic
export const createToggleExpand = (
  expandedAlan: number | null,
  setExpandedAlan: (id: number | null) => void
) => {
  return (alanId: number) => {
    setExpandedAlan(expandedAlan === alanId ? null : alanId);
  };
};

// Modal handlers oluştur
export const createModalHandlers = (
  setSelectedAlan: (alan: any) => void,
  setIsDetayModalOpen: (isOpen: boolean) => void
) => {
  const openDetayModal = (alan: any) => {
    setSelectedAlan(alan);
    setIsDetayModalOpen(true);
  };

  const closeDetayModal = () => {
    setIsDetayModalOpen(false);
    setSelectedAlan(null);
  };

  return { openDetayModal, closeDetayModal };
};

// Delete handlers oluştur
export const createDeleteHandlers = (
  setDeleteDialog: (dialog: { isOpen: boolean; alanId?: number }) => void
) => {
  const handleDelete = (alanId: number) => {
    setDeleteDialog({ isOpen: true, alanId });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false });
  };

  return { handleDelete, cancelDelete };
};

// Hata mesajını parse et
export const parseErrorMessage = (error: any): string => {
  if (error?.message?.includes('Failed to fetch')) {
    return 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
  } else if (error?.message?.includes('Row not found')) {
    return 'Bu alan bulunamadı. Sayfayı yenileyin.';
  } else if (error?.message?.includes('Failed to delete row')) {
    return 'Silme işlemi başarısız. Lütfen tekrar deneyin.';
  } else if (error?.message) {
    return error.message;
  }
  return 'Alan silinirken hata oluştu';
};

// API result'dan hata mesajı çıkar
export const extractErrorMessage = (result: any): string => {
  let errorMessage = 'Alan silinirken hata oluştu';
  
  if (result.message) {
    errorMessage = result.message;
  } else if (result.error) {
    errorMessage = result.error;
  } else if (result.data && result.data.message) {
    errorMessage = result.data.message;
  }
  
  return errorMessage;
}; 