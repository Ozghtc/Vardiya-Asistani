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
  gunluk_saatler: string; // Yeni format
  aktif_gunler: string; // Yeni format
  vardiyalar: string; // Yeni format
  kullanici_id: number;
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
      
      // 1. HZM API'den veri oku (YeniAlanTanimlama tablosu - ID: 25)
      try {
        // Netlify proxy üzerinden API çağrısı
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/25',
            method: 'GET',
            apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7'
          })
        });
        
        const result = await response.json();
        console.log('📊 API\'den gelen ham veri:', result);
        
        if (result.success && result.data && result.data.rows) {
          console.log('📊 API\'den gelen ham veri:', result.data.rows);
          
          const apiData = result.data.rows
            .filter((row: any) => {
              console.log('🔍 Filtreleme kontrolü:', {
                rowKurum: row.kurum_id,
                userKurum: currentUser.kurum_id,
                rowDepartman: row.departman_id,
                userDepartman: currentUser.departman_id,
                rowBirim: row.birim_id,
                userBirim: currentUser.birim_id
              });
              return true; // Tüm alanları göster, filtrelemeyi geçici olarak kaldır
            })
            .map((row: any) => {
              let parsedGunlukSaatler = {};
              let parsedAktifGunler = [];
              let parsedVardiyalar = [];
              
              try {
                parsedGunlukSaatler = JSON.parse(row.gunluk_saatler || '{}');
                parsedAktifGunler = JSON.parse(row.aktif_gunler || '[]');
                parsedVardiyalar = JSON.parse(row.vardiyalar || '[]');
              } catch (e) {
                console.error('JSON parse hatası:', e);
              }
              
              // Computed fields'i hesapla
              const totalHours = parsedVardiyalar.reduce((sum: number, vardiya: any) => sum + (vardiya.duration || 0), 0);
              const totalVardiya = parsedVardiyalar.length;
              const activeDays = parsedAktifGunler.length;
              
              const mappedRow = {
                id: parseInt(row.id.toString(), 10),
                alan_adi: row.alan_adi,
                aciklama: row.aciklama,
                renk: row.renk,
                gunluk_saatler: row.gunluk_saatler,
                aktif_gunler: row.aktif_gunler,
                vardiyalar: row.vardiyalar,
                kullanici_id: row.kullanici_id,
                kurum_id: row.kurum_id,
                departman_id: row.departman_id,
                birim_id: row.birim_id,
                totalHours: totalHours,
                totalVardiya: totalVardiya,
                activeDays: activeDays,
                nobetler: parsedVardiyalar
              };
              
              console.log('🔄 Alan map edildi:', { originalId: row.id, mappedId: mappedRow.id, name: mappedRow.alan_adi });
              return mappedRow;
            });
          
          alanData = [...alanData, ...apiData];
          console.log('✅ API\'den gelen alan sayısı:', apiData.length);
          console.log('📋 Final alan ID\'leri:', alanData.map(a => ({ id: a.id, name: a.alan_adi })));
        }
      } catch (error) {
        console.error('API hatası:', error);
      }
      
      // 2. Veritabanından gelen alanları kontrol et
      console.log('📊 Veritabanından gelen alan sayısı:', alanData.length);
      if (alanData.length === 0) {
        console.log('⚠️ Veritabanından hiç alan gelmedi. Kullanıcı bilgileri:', currentUser);
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
      console.log('🗑️ Alan siliniyor, ID:', alanId);
      
      // Netlify proxy üzerinden silme işlemi - Doğru endpoint
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/25/rows/${alanId}/delete`,
          method: 'POST',
          apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7'
        })
      });
      
      const result = await response.json();
      console.log('🗑️ Silme response:', result);
      
      if (response.ok && result.success) {
        console.log('✅ Alan başarıyla silindi:', result.data);
        alert('Alan başarıyla silindi!');
        loadAlanlar(); // Listeyi yenile
      } else {
        console.error('❌ Alan silme hatası:', result);
        let errorMessage = 'Alan silinirken hata oluştu';
        
        if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (result.data && result.data.message) {
          errorMessage = result.data.message;
        }
        
        console.log('🔍 Detaylı hata bilgisi:', {
          status: response.status,
          statusText: response.statusText,
          result: result
        });
        
        alert('Alan silinirken hata oluştu: ' + errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Alan silme exception:', error);
      
      // Hata türüne göre mesaj
      let errorMessage = 'Alan silinirken hata oluştu';
      
      if (error?.message?.includes('Failed to fetch')) {
        errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
      } else if (error?.message?.includes('Row not found')) {
        errorMessage = 'Bu alan bulunamadı. Sayfayı yenileyin.';
        loadAlanlar(); // Listeyi yenile
      } else if (error?.message?.includes('Failed to delete row')) {
        errorMessage = 'Silme işlemi başarısız. Lütfen tekrar deneyin.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
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
                    className={`p-2 rounded-lg transition-colors ${
                      loading 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={loading ? "Siliniyor..." : "Sil"}
                    disabled={loading}
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
                      <p className="text-sm text-gray-600">Aktif Günler: {alan.activeDays} gün</p>
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