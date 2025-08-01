import { useState, useEffect } from 'react';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { apiRequest } from '../../../../../lib/api';
import { 
  Alan, 
  TanimliAlanlarState, 
  TanimliAlanlarActions, 
  CurrentUser 
} from '../types/TanimliAlanlar.types';
import { TABLE_ID } from '../constants/alanConstants';
import { getCurrentUser } from '../utils/alanHelpers';
import { normalizeApiResponse, mapApiResponseToAlan } from '../utils/alanDataParser';

export const useTanimliAlanlar = (): TanimliAlanlarState & TanimliAlanlarActions & {
  loadAlanlar: () => Promise<void>;
} => {
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [expandedAlan, setExpandedAlan] = useState<number | null>(null);
  const [selectedAlan, setSelectedAlan] = useState<Alan | null>(null);
  const [isDetayModalOpen, setIsDetayModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; alanId?: number}>({
    isOpen: false
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuthContext();

  const loadAlanlar = async () => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser(user);
      if (!currentUser) {
        // Kullanıcı bilgileri yüklenemedi
        return;
      }

      let alanData: Alan[] = [];
      
      // 1. HZM API'den veri oku (TanimliAlanlar tablosu - ID: 18)
      try {
        // Netlify proxy üzerinden API çağrısı
        const response = await apiRequest(`/api/v1/data/table/${TABLE_ID}`, {
          method: 'GET'
        });
        
        // API response yapısını normalize et
        const rows = normalizeApiResponse(response);
        
        if (rows && rows.length > 0) {
          const apiData = rows
            .filter((row: any) => {
              return true; // Tüm alanları göster, filtrelemeyi geçici olarak kaldır
            })
            .map((row: any) => mapApiResponseToAlan(row));
          
          alanData = [...alanData, ...apiData];
        }
      } catch (error) {
        // API hatası - sessizce devam et
      }
      
      setAlanlar(alanData);
    } catch (error) {
      // Alanlar yükleme hatası - sessizce devam et
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlanlar();
  }, []);

  return {
    // State values
    alanlar,
    expandedAlan,
    selectedAlan,
    isDetayModalOpen,
    deleteDialog,
    loading,
    
    // Actions
    setAlanlar,
    setExpandedAlan,
    setSelectedAlan,
    setIsDetayModalOpen,
    setDeleteDialog,
    setLoading,
    
    // Load function
    loadAlanlar
  };
}; 