// Delete Confirmation Component
// Kullanıcı silme onay modalı

import React from 'react';
import { DeleteConfirmationProps } from '../types/UserManagement.types';

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  show,
  deleteModal,
  setDeleteModal,
  onConfirmDelete
}) => {
  if (!show || !deleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800">Kullanıcı Silme Onayı</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Bu kullanıcıyı silmek üzeresiniz:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-800">{deleteModal.user.name}</div>
              <div className="text-sm text-gray-600">{deleteModal.user.email}</div>
            </div>
            
            <p className="text-sm text-gray-600 mt-4 mb-2">
              Onaylamak için kullanıcı adını yazın:
            </p>
            <input
              type="text"
              value={deleteModal.confirmText}
              onChange={(e) => setDeleteModal(prev => prev ? { ...prev, confirmText: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={deleteModal.user.name}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ❌ İptal
            </button>
            <button
              onClick={onConfirmDelete}
              disabled={deleteModal.confirmText !== deleteModal.user.name}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🗑️ Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation; 