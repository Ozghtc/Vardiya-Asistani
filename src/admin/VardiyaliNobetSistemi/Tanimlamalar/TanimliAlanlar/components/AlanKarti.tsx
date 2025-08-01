import React from 'react';
import { ChevronDown, ChevronUp, Trash2, FileText } from 'lucide-react';
import { AlanKartiProps } from '../types/TanimliAlanlar.types';
import ExpandedAlanDetay from './ExpandedAlanDetay';

const AlanKarti: React.FC<AlanKartiProps> = ({
  alan,
  isExpanded,
  loading,
  onToggleExpand,
  onOpenDetayModal,
  onHandleDelete,
  getActiveDays
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onToggleExpand(alan.id)}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: alan.renk }}
          />
          <div>
            <h3 className="font-medium text-gray-900">{alan.alan_adi}</h3>
            <p className="text-sm text-gray-500">
              {(alan.totalHours || 0)} Saat • {(alan.totalVardiya || 0)} Vardiya • {getActiveDays(alan)} Aktif Gün
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
          <button
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Detay Görünüm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetayModal(alan);
            }}
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${
              loading 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title={loading ? "Siliniyor..." : "Sil"}
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onHandleDelete(alan.id);
            }}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <ExpandedAlanDetay alan={alan} />
      )}
    </div>
  );
};

export default AlanKarti; 