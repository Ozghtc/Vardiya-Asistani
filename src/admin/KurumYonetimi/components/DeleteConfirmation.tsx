// Delete Confirmation Component
// Kurum silme onayı modal

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { DeleteConfirmationProps } from '../types/KurumManagement.types';

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  show,
  deleteModal,
  setDeleteModal,
  onConfirmDelete
}) => {
  const [loading, setLoading] = useState(false);

  if (!show || !deleteModal) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmDelete();
      setDeleteModal(null);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDeleteModal(null);
  };

  const isConfirmValid = deleteModal.confirmText === deleteModal.kurum.kurum_adi;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleCancel}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-red-50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  Kurum Silme Onayı
                  <button
                    onClick={handleCancel}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="space-y-4">
              {/* Warning Message */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">⚠️ Bu işlem geri alınamaz!</p>
                    <p>
                      <strong>{deleteModal.kurum.kurum_adi}</strong> kurumu ve ona bağlı 
                      <strong> tüm veriler</strong> (departmanlar, birimler, personeller, nöbetler) 
                      kalıcı olarak silinecektir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Kurum Bilgileri */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Silinecek Kurum:</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <div><strong>Kurum Adı:</strong> {deleteModal.kurum.kurum_adi}</div>
                  <div><strong>Kurum Türü:</strong> {deleteModal.kurum.kurum_turu || 'Belirtilmemiş'}</div>
                  <div><strong>İl/İlçe:</strong> {deleteModal.kurum.il || 'Belirtilmemiş'} / {deleteModal.kurum.ilce || 'Belirtilmemiş'}</div>
                  <div><strong>Kurum ID:</strong> {deleteModal.kurum.kurum_id || 'Belirtilmemiş'}</div>
                </div>
              </div>

              {/* Onay Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Onaylamak için kurum adını yazın:
                </label>
                <input
                  type="text"
                  placeholder={deleteModal.kurum.kurum_adi}
                  value={deleteModal.confirmText}
                  onChange={(e) => setDeleteModal({
                    ...deleteModal,
                    confirmText: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tam olarak <strong>"{deleteModal.kurum.kurum_adi}"</strong> yazmanız gerekiyor
                </p>
              </div>

              {/* Cascade Delete Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-amber-800 mb-1">🔗 Bağlı Veriler:</h5>
                <p className="text-xs text-amber-700">
                  Bu kurum ile ilişkili tüm departmanlar, birimler, personeller, 
                  nöbet kayıtları ve diğer veriler de silinecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmValid || loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Kurumu Sil
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation; 