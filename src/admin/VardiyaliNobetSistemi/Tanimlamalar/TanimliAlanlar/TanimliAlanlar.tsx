import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTanimliAlanlar } from './hooks/useTanimliAlanlar';
import { useAlanOperations } from './hooks/useAlanOperations';
import { useAlanModalState } from './hooks/useAlanModalState';
import { calculateGenelToplam, formatNumber, getActiveDays } from './utils/alanCalculations';
import GenelRapor from './components/GenelRapor';
import AlanListesi from './components/AlanListesi';
import AlanDetayModal from './components/AlanDetayModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

const TanimliAlanlar: React.FC = () => {
  // Main state management
  const {
    alanlar,
    expandedAlan,
    selectedAlan,
    isDetayModalOpen,
    deleteDialog,
    loading,
    setExpandedAlan,
    setSelectedAlan,
    setIsDetayModalOpen,
    setDeleteDialog,
    setLoading,
    loadAlanlar
  } = useTanimliAlanlar();

  // Operations management
  const {
    handleDelete,
    confirmDelete,
    cancelDelete
  } = useAlanOperations(
    deleteDialog,
    setDeleteDialog,
    setLoading,
    loadAlanlar
  );

  // Modal state management
  const {
    toggleExpand,
    openDetayModal,
    closeDetayModal,
    navigate,
    getHomeRouteForUser
  } = useAlanModalState(
    expandedAlan,
    setExpandedAlan,
    setSelectedAlan,
    setIsDetayModalOpen
  );

  // Calculations
  const genelToplam = calculateGenelToplam(alanlar);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Alan verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tanımlı Alanlar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAlanlar}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Yenileniyor...' : 'Yenile'}</span>
          </button>
          <button
            onClick={() => navigate(getHomeRouteForUser())}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </button>
        </div>
      </div>

      {/* Genel Rapor */}
      <GenelRapor genelToplam={genelToplam} formatNumber={formatNumber} />

      {/* Alanlar Listesi */}
      <AlanListesi
        alanlar={alanlar}
        loading={loading}
        expandedAlan={expandedAlan}
        onToggleExpand={toggleExpand}
        onOpenDetayModal={openDetayModal}
        onHandleDelete={handleDelete}
        getActiveDays={getActiveDays}
      />

      {/* HZM işbirliği ile */}
      <div className="mt-8 text-center">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          HZM İşbirliği ile
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteDialog.isOpen}
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Detay Modal */}
      <AlanDetayModal
        alan={selectedAlan}
        isOpen={isDetayModalOpen}
        onClose={closeDetayModal}
      />
    </div>
  );
};

export default TanimliAlanlar; 