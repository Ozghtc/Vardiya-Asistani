import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, FileText, BarChart } from 'lucide-react';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';
import { apiRequest } from '../../../lib/api';

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

  // Kullanıcı bilgilerini localStorage'dan al
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    loadAlanlar();
  }, []);

  const loadAlanlar = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      let alanData: Alan[] = [];
      
      // 1. HZM API'den veri oku
      try {
        const response = await apiRequest('/api/v1/data/table/18');
        if (response.success && response.data.rows) {
          const apiData = response.data.rows
            .filter((row: any) => user && row.kurum_id === user.kurum_id && row.departman_id === user.departman_id && row.birim_id === user.birim_id)
            .map((row: any) => {
              let parsedVardiyaBilgileri = { nobetler: [] };
              try {
                parsedVardiyaBilgileri = JSON.parse(row.vardiya_bilgileri || '{}');
              } catch (e) {
                console.error('Vardiya bilgileri parse hatası:', e);
              }

              const nobetler = parsedVardiyaBilgileri.nobetler || [];
              
              return {
                id: row.id,
                alan_adi: row.alan_adi,
                aciklama: row.aciklama || '',
                renk: row.renk,
                gunluk_mesai_saati: row.gunluk_mesai_saati || 40,
                vardiya_bilgileri: row.vardiya_bilgileri || '{}',
                aktif_mi: row.aktif_mi !== false,
                kurum_id: row.kurum_id,
                departman_id: row.departman_id,
                birim_id: row.birim_id,
                nobetler: nobetler,
                totalHours: calculateTotalHours(nobetler),
                totalVardiya: calculateTotalVardiya(nobetler),
                activeDays: calculateActiveDays(nobetler)
              };
            });
          
          alanData = [...alanData, ...apiData];
        }
      } catch (error) {
        console.error('HZM API hatası:', error);
      }
      
      // 2. localStorage'dan veri oku (kırmızı alan burada olabilir)
      try {
        const localData = localStorage.getItem('tanimliAlanlar');
        if (localData) {
          const parsedLocalData = JSON.parse(localData);
          if (Array.isArray(parsedLocalData)) {
            const localAlanData = parsedLocalData
              .filter((alan: any) => user && alan.kurum_id === user.kurum_id && alan.departman_id === user.departman_id && alan.birim_id === user.birim_id)
              .map((alan: any) => ({
                id: alan.id || Date.now(),
                alan_adi: alan.name || alan.alan_adi,
                aciklama: alan.description || alan.aciklama || '',
                renk: alan.color || alan.renk,
                gunluk_mesai_saati: alan.dailyWorkHours || alan.gunluk_mesai_saati || 40,
                vardiya_bilgileri: JSON.stringify(alan.shifts || alan.vardiya_bilgileri || {}),
                aktif_mi: alan.aktif_mi !== false,
                kurum_id: alan.kurum_id || user.kurum_id,
                departman_id: alan.departman_id || user.departman_id,
                birim_id: alan.birim_id || user.birim_id,
                nobetler: alan.nobetler || [],
                totalHours: calculateTotalHours(alan.nobetler || []),
                totalVardiya: calculateTotalVardiya(alan.nobetler || []),
                activeDays: calculateActiveDays(alan.nobetler || [])
              }));
            
            // Çakışan verileri kontrol et (API'de olmayan localStorage verilerini ekle)
            localAlanData.forEach(localAlan => {
              const existsInAPI = alanData.some(apiAlan => 
                apiAlan.alan_adi === localAlan.alan_adi && 
                apiAlan.renk === localAlan.renk
              );
              
              if (!existsInAPI) {
                alanData.push(localAlan);
              }
            });
          }
        }
      } catch (error) {
        console.error('localStorage okuma hatası:', error);
      }
      
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

  const migrateToAPI = async () => {
    try {
      const localData = localStorage.getItem('tanimliAlanlar');
      if (!localData) {
        alert('localStorage\'da veri bulunamadı.');
        return;
      }

      const parsedData = JSON.parse(localData);
      const user = getCurrentUser();
      
      if (!user) {
        alert('Kullanıcı bilgisi bulunamadı.');
        return;
      }

      setLoading(true);
      let migratedCount = 0;

      for (const alan of parsedData) {
        if (alan.kurum_id === user.kurum_id && alan.departman_id === user.departman_id && alan.birim_id === user.birim_id) {
          try {
            const response = await apiRequest('/api/v1/tables/18/data', {
              method: 'POST',
              body: JSON.stringify({
                alan_adi: alan.name || alan.alan_adi,
                aciklama: alan.description || alan.aciklama || '',
                renk: alan.color || alan.renk,
                gunluk_mesai_saati: alan.dailyWorkHours || alan.gunluk_mesai_saati || 40,
                vardiya_bilgileri: JSON.stringify(alan.shifts || alan.vardiya_bilgileri || {}),
                aktif_mi: alan.aktif_mi !== false,
                kurum_id: alan.kurum_id || user.kurum_id,
                departman_id: alan.departman_id || user.departman_id,
                birim_id: alan.birim_id || user.birim_id
              })
            });

            if (response.success) {
              migratedCount++;
            }
          } catch (error) {
            console.error('Alan migrate hatası:', error);
          }
        }
      }

      alert(`${migratedCount} alan HZM API'ye aktarıldı.`);
      
      // localStorage'ı temizle
      localStorage.removeItem('tanimliAlanlar');
      
      // Listeyi yenile
      loadAlanlar();
    } catch (error) {
      console.error('Migration hatası:', error);
      alert('Migration sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
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
          <button
            onClick={migrateToAPI}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            localStorage → HZM API
          </button>
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
            Henüz alan tanımlanmamış. Yeni alan eklemek için yukarıdaki formu kullanın.
          </div>
        ) : (
          alanlar.map((alan) => (
            <div key={alan.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(alan.id)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: alan.renk }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{alan.alan_adi}</h3>
                    <p className="text-sm text-gray-500">
                      {alan.totalHours} Saat • {alan.totalVardiya} Vardiya • {alan.activeDays} Aktif Gün
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