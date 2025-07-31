// Kurum Management Custom Hook
// Tüm state management ve data loading işlemleri

import { useState, useEffect } from 'react';
import { useTemporaryState } from '../../../hooks/useApiState';
import { useCapitalization } from '../../../hooks/useCapitalization';
import { getKurumlar } from '../../../lib/api';
import {
  Kurum,
  DepartmanBirim,
  KurumFormData,
  EditKurumValues,
  FilterType,
  DeleteModalState,
  KurumManagementHook
} from '../types/KurumManagement.types';
import { getInitialKurumForm, getInitialEditValues, showErrorMessage } from '../utils/kurumHelpers';

export const useKurumManagement = (): KurumManagementHook => {
  // ═══════════════════════════════════════════
  // DATA STATES
  // ═══════════════════════════════════════════
  const [kurumlar, setKurumlar] = useState<Kurum[]>([]);
  const [departmanBirimler, setDepartmanBirimler] = useTemporaryState<DepartmanBirim[]>([]);

  // ═══════════════════════════════════════════
  // FORM STATES
  // ═══════════════════════════════════════════
  const [kurumForm, setKurumForm] = useState<KurumFormData>(getInitialKurumForm());
  const [formDepartmanlar, setFormDepartmanlar] = useState<string[]>([]);
  const [formBirimler, setFormBirimler] = useState<string[]>([]);

  // ═══════════════════════════════════════════
  // UI STATES
  // ═══════════════════════════════════════════
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedKurum, setSelectedKurum] = useState<Kurum | null>(null);
  const [editingKurum, setEditingKurum] = useState<Kurum | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<DeleteModalState | null>(null);

  // ═══════════════════════════════════════════
  // EDIT STATES (from Kurumlar.tsx)
  // ═══════════════════════════════════════════
  const [editKurumId, setEditKurumId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditKurumValues>(getInitialEditValues());
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // ═══════════════════════════════════════════
  // INLINE EDITING STATES
  // ═══════════════════════════════════════════
  const [editingDepartman, setEditingDepartman] = useState<{kurumId: string, departmanIndex: number} | null>(null);
  const [newDepartmanInputs, setNewDepartmanInputs] = useState<{[kurumId: string]: string}>({});
  const [newBirimInputs, setNewBirimInputs] = useState<{[key: string]: string}>({});
  const [newPersonelInputs, setNewPersonelInputs] = useState<{[key: string]: string}>({});

  // ═══════════════════════════════════════════
  // MESSAGES
  // ═══════════════════════════════════════════
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ═══════════════════════════════════════════
  // CAPITALIZATION HOOKS
  // ═══════════════════════════════════════════
  const [kurumAdi, handleKurumAdiChange] = useCapitalization(kurumForm.kurum_adi);
  const [kurumTuru, handleKurumTuruChange] = useCapitalization(kurumForm.kurum_turu);
  const [adres, handleAdresChange] = useCapitalization(kurumForm.adres);

  // ═══════════════════════════════════════════
  // DATA LOADING FUNCTIONS
  // ═══════════════════════════════════════════
  const loadKurumlar = async (forceRefresh: boolean = false) => {
    setLoading(true);
    
    try {
      // 🔄 CACHE'İ ZORLA YENİLE
      const apiKurumlar = await getKurumlar(forceRefresh);
      setKurumlar(apiKurumlar);
    } catch (error: any) {
      console.error('❌ loadKurumlar hatası:', error);
      showErrorMessage('Kurumlar yüklenirken hata oluştu: ' + error.message, setErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  // FORM RESET FUNCTIONS
  // ═══════════════════════════════════════════
  const resetForm = () => {
    setKurumForm(getInitialKurumForm());
    setFormDepartmanlar([]);
    setFormBirimler([]);
    setEditingKurum(null);
    
    // Reset capitalization hooks
    handleKurumAdiChange({ target: { value: '' } } as any);
    handleKurumTuruChange({ target: { value: '' } } as any);
    handleAdresChange({ target: { value: '' } } as any);
  };

  // ═══════════════════════════════════════════
  // INITIAL DATA LOADING
  // ═══════════════════════════════════════════
  useEffect(() => {
    loadKurumlar(true); // 🚀 İLK YÜKLEMEDE ZORLA FRESH DATA ÇEK
  }, []);

  // ═══════════════════════════════════════════
  // FORM DATA SYNC
  // ═══════════════════════════════════════════
  useEffect(() => {
    setKurumForm(prev => ({
      ...prev,
      kurum_adi: kurumAdi,
      kurum_turu: kurumTuru,
      adres: adres
    }));
  }, [kurumAdi, kurumTuru, adres]);

  // ═══════════════════════════════════════════
  // SUCCESS MESSAGE AUTO CLEAR
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // ═══════════════════════════════════════════
  // ERROR MESSAGE AUTO CLEAR
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // ═══════════════════════════════════════════
  // RETURN HOOK INTERFACE
  // ═══════════════════════════════════════════
  return {
    // Data States
    kurumlar,
    setKurumlar,
    departmanBirimler,
    setDepartmanBirimler,
    
    // Form States
    kurumForm,
    setKurumForm,
    formDepartmanlar,
    setFormDepartmanlar,
    formBirimler,
    setFormBirimler,
    
    // UI States
    loading,
    setLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedKurum,
    setSelectedKurum,
    editingKurum,
    setEditingKurum,
    showDeleteModal,
    setShowDeleteModal,
    
    // Edit States (from Kurumlar.tsx)
    editKurumId,
    setEditKurumId,
    editValues,
    setEditValues,
    operationLoading,
    setOperationLoading,
    
    // Inline Editing States
    editingDepartman,
    setEditingDepartman,
    newDepartmanInputs,
    setNewDepartmanInputs,
    newBirimInputs,
    setNewBirimInputs,
    newPersonelInputs,
    setNewPersonelInputs,
    
    // Messages
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,
    
    // Methods
    loadKurumlar,
    resetForm
  };
}; 