// Kurum Yönetim Paneli - Ana Component
// Form ve tüm modüllerin orchestration'ı

import React from 'react';
import Select from 'react-select';
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Types
import { Kurum, KurumFormData } from './types/KurumManagement.types';

// Hooks
import { useKurumManagement } from './hooks/useKurumManagement';

// Services
import { KurumCrudOperations } from './services/kurumCrudOperations';

// Utils
import { 
  validateKurumForm, 
  formatKurumDataForAPI, 
  formatKurumDataForForm,
  showSuccessMessage, 
  showErrorMessage 
} from './utils/kurumHelpers';

// Data
import { 
  IL_OPTIONS, 
  getIlceOptions, 
  KURUM_TURU_OPTIONS,
  DEPARTMAN_OPTIONS,
  BIRIM_OPTIONS
} from './data/locationData';

// Components
import KurumList from './components/KurumList';
import DepartmanManagement from './components/DepartmanManagement';
import DeleteConfirmation from './components/DeleteConfirmation';

const KurumYonetimPaneli: React.FC = () => {
  // ═══════════════════════════════════════════
  // HOOKS & STATE
  // ═══════════════════════════════════════════
  const hookData = useKurumManagement();
  
  const {
    // Data
    kurumlar,
    setKurumlar,
    departmanBirimler,
    setDepartmanBirimler,
    
    // Form
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
    
    // Edit States
    editKurumId,
    setEditKurumId,
    editValues,
    setEditValues,
    operationLoading,
    setOperationLoading,
    
    // Inline Editing
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
  } = hookData;

  // ═══════════════════════════════════════════
  // CRUD OPERATIONS SERVICE
  // ═══════════════════════════════════════════
  const crudOps = new KurumCrudOperations(
    setKurumlar,
    setDepartmanBirimler,
    setSuccessMsg,
    setErrorMsg,
    setLoading,
    setOperationLoading,
    loadKurumlar
  );

  // ═══════════════════════════════════════════
  // FORM HANDLERS
  // ═══════════════════════════════════════════
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingKurum) {
      // Update existing kurum
      const updateData = formatKurumDataForAPI(kurumForm);
      const result = await crudOps.updateKurum(editingKurum.id, updateData);
      
      if (result.success) {
        resetForm();
      }
    } else {
      // Add new kurum
      const result = await crudOps.addKurum(kurumForm);
      
      if (result.success) {
        resetForm();
      }
    }
  };

  const handleEditKurum = (kurum: Kurum) => {
    setEditingKurum(kurum);
    setKurumForm(formatKurumDataForForm(kurum));
    setSelectedKurum(kurum);
  };

  const handleDeleteKurum = (kurum: Kurum) => {
    setShowDeleteModal({
      kurum,
      confirmText: ''
    });
  };

  const handleToggleActive = async (kurum: Kurum) => {
    await crudOps.toggleActive(kurum);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteModal) return;
    await crudOps.deleteKurum(showDeleteModal.kurum);
  };

  const handleSaveInlineEdit = async (kurumId: string) => {
    await crudOps.saveInlineEdit(kurumId, editValues);
  };

  const handleCancelEdit = () => {
    setEditKurumId(null);
    setEditValues({ kurum_adi: '', adres: '', telefon: '', email: '' });
  };

  const handleRefresh = async () => {
    await crudOps.refreshData();
  };

  // ═══════════════════════════════════════════
  // FORM INPUT HANDLERS
  // ═══════════════════════════════════════════
  const handleIlChange = (selectedOption: any) => {
    setKurumForm(prev => ({
      ...prev,
      il: selectedOption,
      ilce: null // İl değişince ilçeyi sıfırla
    }));
  };

  const handleIlceChange = (selectedOption: any) => {
    setKurumForm(prev => ({
      ...prev,
      ilce: selectedOption
    }));
  };

  const handleKurumTuruChange = (selectedOption: any) => {
    setKurumForm(prev => ({
      ...prev,
      kurum_turu: selectedOption?.value || ''
    }));
  };

  // ═══════════════════════════════════════════
  // DEPARTMAN/BIRIM HANDLERS
  // ═══════════════════════════════════════════
  const addDepartman = (departmanAdi: string) => {
    if (departmanAdi.trim() && !formDepartmanlar.includes(departmanAdi.trim())) {
      setFormDepartmanlar(prev => [...prev, departmanAdi.trim()]);
    }
  };

  const removeDepartman = (index: number) => {
    setFormDepartmanlar(prev => prev.filter((_, i) => i !== index));
  };

  const addBirim = (birimAdi: string) => {
    if (birimAdi.trim() && !formBirimler.includes(birimAdi.trim())) {
      setFormBirimler(prev => [...prev, birimAdi.trim()]);
    }
  };

  const removeBirim = (index: number) => {
    setFormBirimler(prev => prev.filter((_, i) => i !== index));
  };

  // İlçe seçenekleri
  const ilceOptions = kurumForm.il ? getIlceOptions(kurumForm.il.value) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Kurum Yönetim Sistemi
          </h1>
          <p className="text-gray-600 mt-2">
            Kurumları yönetin, departman ve birimlerini organize edin
          </p>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{errorMsg}</span>
          </div>
        )}

        <div className="grid xl:grid-cols-3 gap-6">
          {/* KURUM FORM - SOL PANEL */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                {editingKurum ? 'Kurum Düzenle' : 'Yeni Kurum Ekle'}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Kurum Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Kurum Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={kurumForm.kurum_adi}
                    onChange={(e) => setKurumForm(prev => ({...prev, kurum_adi: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Kurum adını giriniz"
                  />
                </div>

                {/* Kurum Türü */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Kurum Türü *
                  </label>
                  <Select
                    options={KURUM_TURU_OPTIONS}
                    value={KURUM_TURU_OPTIONS.find(option => option.value === kurumForm.kurum_turu)}
                    onChange={handleKurumTuruChange}
                    placeholder="Kurum türü seçiniz"
                    className="text-sm"
                  />
                </div>

                {/* İl */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    İl
                  </label>
                  <Select
                    options={IL_OPTIONS}
                    value={kurumForm.il}
                    onChange={handleIlChange}
                    placeholder="İl seçiniz"
                    className="text-sm"
                  />
                </div>

                {/* İlçe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <Select
                    options={ilceOptions}
                    value={kurumForm.ilce}
                    onChange={handleIlceChange}
                    placeholder="İlçe seçiniz"
                    className="text-sm"
                    isDisabled={!kurumForm.il}
                  />
                </div>

                {/* Adres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={kurumForm.adres}
                    onChange={(e) => setKurumForm(prev => ({...prev, adres: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Kurum adresi"
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={kurumForm.telefon || ''}
                    onChange={(e) => setKurumForm(prev => ({...prev, telefon: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Telefon numarası"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={kurumForm.email || ''}
                    onChange={(e) => setKurumForm(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E-posta adresi"
                  />
                </div>

                {/* Aktif/Pasif */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={kurumForm.aktif_mi}
                      onChange={(e) => setKurumForm(prev => ({...prev, aktif_mi: e.target.checked}))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif kurum</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingKurum ? 'Güncelle' : 'Kaydet'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Temizle
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SAĞ PANEL - KURUM LİSTESİ VE DEPARTMAN YÖNETİMİ */}
          <div className="xl:col-span-2 space-y-6">
            {/* Kurum Listesi */}
            <KurumList
              kurumlar={kurumlar}
              loading={loading}
              onEdit={handleEditKurum}
              onDelete={handleDeleteKurum}
              onToggleActive={handleToggleActive}
              onRefresh={handleRefresh}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              editKurumId={editKurumId}
              setEditKurumId={setEditKurumId}
              editValues={editValues}
              setEditValues={setEditValues}
              operationLoading={operationLoading}
              onSaveEdit={handleSaveInlineEdit}
              onCancelEdit={handleCancelEdit}
            />

            {/* Departman Yönetimi */}
            <DepartmanManagement
              selectedKurum={selectedKurum}
              departmanBirimler={departmanBirimler}
              onUpdate={loadKurumlar}
              editingDepartman={editingDepartman}
              setEditingDepartman={setEditingDepartman}
              newDepartmanInputs={newDepartmanInputs}
              setNewDepartmanInputs={setNewDepartmanInputs}
              newBirimInputs={newBirimInputs}
              setNewBirimInputs={setNewBirimInputs}
              newPersonelInputs={newPersonelInputs}
              setNewPersonelInputs={setNewPersonelInputs}
            />
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          show={!!showDeleteModal}
          deleteModal={showDeleteModal}
          setDeleteModal={setShowDeleteModal}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default KurumYonetimPaneli; 