import React from 'react';
import { Trash2 } from 'lucide-react';
import { DeleteConfirmModalProps } from '../types/TanimliAlanlar.types';

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  loading, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Alanı Sil</h3>
            <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Bu alanı silmek istediğinizden emin misiniz?
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? 'Siliniyor...' : 'Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal; 