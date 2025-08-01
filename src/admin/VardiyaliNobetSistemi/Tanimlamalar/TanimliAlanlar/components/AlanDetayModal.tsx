import React from 'react';
import { X } from 'lucide-react';
import { AlanDetayModalProps, Vardiya } from '../types/TanimliAlanlar.types';
import { weekDays, MODAL_Z_INDEX, DEFAULT_TARGET_HOURS } from '../constants/alanConstants';
import { parseVardiyaData } from '../utils/alanDataParser';
import { 
  getGunVardiyalari, 
  getGunToplamSaat, 
  getHaftalikToplamSaat, 
  getHaftalikToplamVardiya,
  getMonthlyMultiplier 
} from '../utils/alanCalculations';

const AlanDetayModal: React.FC<AlanDetayModalProps> = ({ alan, isOpen, onClose }) => {
  if (!isOpen || !alan) return null;
  
  // Vardiya verilerini parse et
  const parsedVardiyalar: Vardiya[] = parseVardiyaData(alan.vardiyalar);

  // Haftalık toplam hesaplamaları
  const haftalikToplamSaat = getHaftalikToplamSaat(parsedVardiyalar, weekDays);
  const haftalikToplamVardiya = getHaftalikToplamVardiya(parsedVardiyalar, weekDays);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-${MODAL_Z_INDEX} p-4`}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: alan.renk }}
            />
            <h2 className="text-xl font-bold text-gray-900">{alan.alan_adi} - Günlük Toplam Mesailer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Özet Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Haftalık Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Haftalık Özet</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{haftalikToplamSaat}</div>
                  <div className="text-sm text-gray-600">Saat</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{haftalikToplamVardiya}</div>
                  <div className="text-sm text-gray-600">Vardiya</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{alan.activeDays || 0}</div>
                  <div className="text-sm text-gray-600">Gün</div>
                </div>
              </div>
            </div>

            {/* Aylık Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Aylık Özet</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(() => {
                      const aktifGun = alan.activeDays || 0;
                      if (aktifGun === 0) return 0;
                      const carpim = getMonthlyMultiplier(aktifGun);
                      return Math.round(haftalikToplamSaat * carpim);
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Saat</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {(() => {
                      const aktifGun = alan.activeDays || 0;
                      if (aktifGun === 0) return 0;
                      const carpim = getMonthlyMultiplier(aktifGun);
                      return Math.round(haftalikToplamVardiya * carpim);
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Vardiya</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">30</div>
                  <div className="text-sm text-gray-600">Gün</div>
                </div>
              </div>
            </div>
          </div>

          {/* Günlük Vardiya Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDays.map((gunAdi) => {
              const gunVardiyalari = getGunVardiyalari(parsedVardiyalar, gunAdi);
              const gunToplamSaat = getGunToplamSaat(parsedVardiyalar, gunAdi);
              const hedefSaat = DEFAULT_TARGET_HOURS; // Varsayılan hedef saat
              const ekMesai = Math.max(0, gunToplamSaat - hedefSaat);
              const kalanMesai = Math.max(0, hedefSaat - gunToplamSaat);

              return (
                <div key={gunAdi} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  {/* Gün Başlığı */}
                  <h3 className="font-bold text-center text-gray-900 mb-3">{gunAdi}</h3>
                  
                  {/* Özet Bilgiler */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">T: {hedefSaat}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">Ek Mes: {ekMesai}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">Kalan Mes: {kalanMesai}</div>
                    </div>
                  </div>

                  {/* Vardiya Listesi */}
                  <div className="space-y-2">
                    {gunVardiyalari.length > 0 ? (
                      gunVardiyalari.map((vardiya, index) => (
                        <div key={index} className="bg-white rounded border p-2 text-xs">
                          <div className="font-medium">
                            {index + 1} Vardiya: {vardiya.name} ({vardiya.startTime} - {vardiya.endTime}) {vardiya.duration} saat
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded border p-2 text-xs text-gray-500 text-center">
                        Vardiya yok
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlanDetayModal; 