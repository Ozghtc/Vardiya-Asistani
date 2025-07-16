import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, FileText, BarChart } from 'lucide-react';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';
import { apiRequest } from '../../../lib/api';
import { useAuthContext } from '../../../contexts/AuthContext';

interface NobetGrubu {
  saat: number;
  gunler: string[];
  hours?: string;
}

interface Alan {
  id: number;
  alan_adi: string;
  aciklama: string;
  renk: string;
  gunluk_mesai_saati: number;
  vardiya_bilgileri: string;
  aktif_mi: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  // Computed fields
  totalHours: number;
  totalVardiya: number;
  activeDays: number;
  nobetler?: NobetGrubu[];
}

const TanimliAlanlar: React.FC = () => {
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [expandedAlan, setExpandedAlan] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; alanId?: number}>({
    isOpen: false
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  // AuthContext'ten gerçek kullanıcı bilgilerini al
  const getCurrentUser = () => {
    if (user && user.kurum_id && user.departman_id && user.birim_id) {
      return { 
        kurum_id: user.kurum_id, 
        departman_id: user.departman_id, 
        birim_id: user.birim_id 
      };
    }
    return null;
  };

  useEffect(() => {
    loadAlanlar();
  }, []);

  const loadAlanlar = async () => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.error('Kullanıcı bilgileri yüklenemedi');
        return;
      }

      let alanData: Alan[] = [];
      
      console.log('🚀 loadAlanlar başladı, user:', currentUser);
      
      // 1. HZM API'den veri oku
      try {
        const response = await apiRequest('/api/v1/data/table/18');
        if (response.success && response.data.rows) {
          const apiData = response.data.rows
            .filter((row: any) => 
              row.kurum_id === currentUser.kurum_id && 
              row.departman_id === currentUser.departman_id && 
              row.birim_id === currentUser.birim_id
            )
            .map((row: any) => {
              let parsedVardiyaBilgileri = { nobetler: [] };
              try {
                parsedVardiyaBilgileri = JSON.parse(row.vardiya_bilgileri || '{}');
              } catch (e) {
                console.error('Vardiya bilgileri parse hatası:', e);
              }
              
              // Computed fields'i hesapla
              const nobetler = parsedVardiyaBilgileri.nobetler || [];
              const totalHours = nobetler.reduce((sum: number, nobet: any) => sum + (nobet.saat || 0), 0);
              const totalVardiya = nobetler.length;
              const activeDays = nobetler.reduce((days: Set<string>, nobet: any) => {
                if (nobet.gunler && Array.isArray(nobet.gunler)) {
                  nobet.gunler.forEach((gun: string) => days.add(gun));
                }
                return days;
              }, new Set()).size;
              
              return {
                id: parseInt(row.id.toString(), 10), // ID'yi number'a çevir
                alan_adi: row.alan_adi,
                aciklama: row.aciklama,
                renk: row.renk,
                gunluk_mesai_saati: row.gunluk_mesai_saati,
                vardiya_bilgileri: parsedVardiyaBilgileri,
                aktif_mi: row.aktif_mi,
                kurum_id: row.kurum_id,
                departman_id: row.departman_id,
                birim_id: row.birim_id,
                totalHours: totalHours,
                totalVardiya: totalVardiya,
                activeDays: activeDays,
                nobetler: nobetler
              };
            });
          
          alanData = [...alanData, ...apiData];
          console.log('✅ API\'den gelen alan sayısı:', apiData.length);
        }
      } catch (error) {
        console.error('API hatası:', error);
      }
      
      // 2. Kalıcı çözüm: Eğer hiç alan yoksa otomatik kırmızı alan oluştur
      if (alanData.length === 0 && currentUser) {
        const otomatikKirmiziAlan: Alan = {
          id: Date.now(),
          alan_adi: 'KIRMIZI ALAN',
          aciklama: 'Kırmızı Gözlem Alanı - Otomatik Oluşturuldu',
          renk: '#dc2626',
          gunluk_mesai_saati: 40,
          vardiya_bilgileri: '{}',
          aktif_mi: true,
          kurum_id: currentUser.kurum_id,
          departman_id: currentUser.departman_id,
          birim_id: currentUser.birim_id,
          totalHours: 0,
          totalVardiya: 0,
          activeDays: 0
        };
        
        alanData.push(otomatikKirmiziAlan);
        console.log('✅ Otomatik kırmızı alan oluşturuldu');
        
        // API'ye kaydetmeye çalış (başarısız olursa sorun değil)
        try {
          await apiRequest('/api/v1/data/table/18/rows', {
            method: 'POST',
            body: JSON.stringify({
              alan_adi: otomatikKirmiziAlan.alan_adi,
              aciklama: otomatikKirmiziAlan.aciklama,
              renk: otomatikKirmiziAlan.renk,
              gunluk_mesai_saati: otomatikKirmiziAlan.gunluk_mesai_saati,
              vardiya_bilgileri: otomatikKirmiziAlan.vardiya_bilgileri,
              aktif_mi: otomatikKirmiziAlan.aktif_mi,
              kurum_id: otomatikKirmiziAlan.kurum_id,
              departman_id: otomatikKirmiziAlan.departman_id,
              birim_id: otomatikKirmiziAlan.birim_id
            })
          });
          console.log('✅ Kırmızı alan API\'ye kaydedildi');
        } catch (error) {
          console.log('⚠️ API\'ye kaydetme başarısız, sadece görüntüleme için var:', error);
        }
      }
      
      console.log('📊 Final alanData:', alanData);
      setAlanlar(alanData);
    } catch (error) {
      console.error('Alanlar yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = (nobetler: NobetGrubu[]) => {
    if (!nobetler || !Array.isArray(nobetler)) return 0;
    return nobetler.reduce((total, nobet) => {
      return total + (nobet.saat * nobet.gunler.length);
    }, 0);
  };

  const calculateTotalVardiya = (nobetler: NobetGrubu[]) => {
    if (!nobetler || !Array.isArray(nobetler)) return 0;
    return nobetler.reduce((total, nobet) => {
      return total + nobet.gunler.length;
    }, 0);
  };

  const calculateActiveDays = (nobetler: NobetGrubu[]) => {
    if (!nobetler || !Array.isArray(nobetler)) return 0;
    const uniqueDays = new Set();
    nobetler.forEach(nobet => {
      nobet.gunler.forEach(gun => uniqueDays.add(gun));
    });
    return uniqueDays.size;
  };

  const getActiveDays = (alan: Alan) => {
    const uniqueDays = new Set<string>();
    if (alan.nobetler && alan.nobetler.length > 0) {
      alan.nobetler.forEach(nobet => {
        if (nobet.gunler && Array.isArray(nobet.gunler)) {
          nobet.gunler.forEach(gun => uniqueDays.add(gun));
        }
      });
    }
    return uniqueDays.size;
  };

  const genelToplam = alanlar.reduce((acc, alan) => ({
    haftalikSaat: acc.haftalikSaat + (alan.totalHours || 0),
    haftalikVardiya: acc.haftalikVardiya + (alan.totalVardiya || 0),
    aylikSaat: acc.aylikSaat + ((alan.totalHours || 0) * 30/7),
    aylikVardiya: acc.aylikVardiya + ((alan.totalVardiya || 0) * 30/7)
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
    if (!confirm('Bu alanı silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      const response = await apiRequest(`/api/v1/data/table/18/rows/${alanId}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        loadAlanlar(); // Listeyi yenile
      } else {
        alert('Alan silinirken hata oluştu: ' + (response.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Alan silme hatası:', error);
      alert('Alan silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Yükleniyor, lütfen bekleyin...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tanımlı Alanlar</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/tanimlamalar"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>
        </div>
      </div>

      {/* Genel Rapor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Genel Rapor</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(genelToplam.haftalikSaat)}</div>
            <div className="text-sm text-gray-600">Haftalık: {formatNumber(genelToplam.haftalikSaat)} Saat • {formatNumber(genelToplam.haftalikVardiya)} Vardiya</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatNumber(genelToplam.aylikSaat)}</div>
            <div className="text-sm text-gray-600">30 Günlük: {formatNumber(genelToplam.aylikSaat)} Saat • {formatNumber(genelToplam.aylikVardiya)} Vardiya</div>
          </div>
        </div>
      </div>

      {/* Alanlar Listesi */}
      <div className="space-y-4">
        {alanlar.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Henüz tanımlı alan bulunmamaktadır.</p>
          </div>
        ) : (
          alanlar.map((alan) => (
            <div
              key={alan.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => toggleExpand(alan.id)}
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
                  {expandedAlan === alan.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
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
                      handleDelete(alan.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedAlan === alan.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Alan Bilgileri</h4>
                      <p className="text-sm text-gray-600">{alan.aciklama || 'Açıklama eklenmemiş'}</p>
                      <p className="text-sm text-gray-600">Günlük Mesai: {alan.gunluk_mesai_saati} saat</p>
                    </div>
                    
                    {alan.nobetler && alan.nobetler.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Nöbet Grupları</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {alan.nobetler.map((nobet, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-sm">{nobet.saat} Saat</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {nobet.gunler.join(', ')}
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
          ))
        )}
      </div>

      {/* HZM işbirliği ile */}
      <div className="mt-8 text-center">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          HZM İşbirliği ile
        </button>
      </div>
    </div>
  );
};

export default TanimliAlanlar;