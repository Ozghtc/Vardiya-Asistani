import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, FileText, BarChart } from 'lucide-react';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';

interface NobetGrubu {
  saat: number;
  gunler: string[];
  hours?: string;
}

interface Alan {
  id: number;
  name: string;
  color: string;
  description: string;
  isActive?: boolean;
  nobetler?: NobetGrubu[];
  totalHours: number;
  totalVardiya: number;
  activeDays: number;
}

const TanimliAlanlar: React.FC = () => {
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [expandedAlan, setExpandedAlan] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; alanId?: number}>({
    isOpen: false
  });

  useEffect(() => {
    // Supabase ile ilgili kodları kaldır
  }, []);

  const calculateTotalHours = (alan: Alan) => {
    if (!alan.nobetler) return 0;
    return alan.nobetler.reduce((total, nobet) => {
      return total + (nobet.saat * nobet.gunler.length);
    }, 0);
  };

  const calculateTotalVardiya = (alan: Alan) => {
    if (!alan.nobetler) return 0;
    return alan.nobetler.reduce((total, nobet) => {
      return total + nobet.gunler.length;
    }, 0);
  };

  const genelToplam = alanlar.reduce((acc, alan) => ({
    haftalikSaat: acc.haftalikSaat + alan.totalHours,
    haftalikVardiya: acc.haftalikVardiya + alan.totalVardiya,
    aylikSaat: acc.aylikSaat + (alan.totalHours * 30/7),
    aylikVardiya: acc.aylikVardiya + (alan.totalVardiya * 30/7)
  }), {
    haftalikSaat: 0,
    haftalikVardiya: 0,
    aylikSaat: 0,
    aylikVardiya: 0
  });

  const toggleExpand = (alanId: number) => {
    setExpandedAlan(expandedAlan === alanId ? null : alanId);
  };

  const handleDelete = async (alanId: number) => {
    // Supabase ile ilgili kodları kaldır
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alanlar</h1>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="font-semibold text-blue-800 mb-2">
              <BarChart className="inline-block w-4 h-4 mr-2" />
              Genel Rapor
            </div>
            <div className="space-y-1 text-blue-700">
              <div>Haftalık: {Math.round(genelToplam.haftalikSaat)} Saat • {Math.round(genelToplam.haftalikVardiya)} Vardiya</div>
              <div>30 Günlük: {Math.round(genelToplam.aylikSaat)} Saat • {Math.round(genelToplam.aylikVardiya)} Vardiya</div>
            </div>
          </div>
          <Link
            to="/programlar/vardiyali-nobet/alan-yonetimi"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {alanlar.map((alan) => (
          <div key={alan.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(alan.id)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: alan.color }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{alan.name}</h3>
                  <p className="text-sm text-gray-500">
                    {alan.totalHours} Saat • {alan.totalVardiya} Vardiya • {alan.activeDays} Aktif Gün
                  </p>
                </div>
                {expandedAlan === alan.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Rapor"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ isOpen: true, alanId: alan.id });
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {expandedAlan === alan.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Detaylı Bilgiler</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500">Toplam Saat</div>
                        <div className="text-lg font-semibold text-gray-900">{alan.totalHours}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500">Toplam Vardiya</div>
                        <div className="text-lg font-semibold text-gray-900">{alan.totalVardiya}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500">Aktif Günler</div>
                        <div className="text-lg font-semibold text-gray-900">{alan.activeDays}</div>
                      </div>
                    </div>
                  </div>

                  {alan.nobetler && alan.nobetler.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Nöbet Detayları</h4>
                      <div className="space-y-2">
                        {alan.nobetler.map((nobet, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="font-medium text-gray-800 mb-1">
                              {nobet.saat} Saatlik Nöbet
                              {nobet.hours && (
                                <span className="ml-2 text-xs text-gray-500">({nobet.hours.split(' - ').map(s=>s.slice(0,5)).join(' - ')})</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {nobet.gunler.map((gun, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                  {gun}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={() => deleteDialog.alanId && handleDelete(deleteDialog.alanId)}
        title="Alan Silme"
        message="Bu alanı silmek istediğinizden emin misiniz?"
      />
    </div>
  );
};

export default TanimliAlanlar;