import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, FileText, BarChart, X } from 'lucide-react';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';
import { apiRequest } from '../../../lib/api';
import { useAuthContext } from '../../../contexts/AuthContext';

interface NobetGrubu {
  saat: number;
  gunler: string[];
  hours?: string;
}

interface Vardiya {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  gunler: string[]; // Yeni format
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
  parsedVardiyalar?: Vardiya[];
}

// Detay Modal Component
const AlanDetayModal: React.FC<{
  alan: Alan | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ alan, isOpen, onClose }) => {
  if (!isOpen || !alan) return null;

  const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  
  // Vardiya verilerini parse et
  let parsedVardiyalar: Vardiya[] = [];
  try {
    const rawVardiyalar = JSON.parse(alan.vardiyalar || '[]');
    // API'den gelen yapıyı dönüştür
    parsedVardiyalar = rawVardiyalar.map((vardiya: any) => ({
      id: vardiya.id,
      name: vardiya.name,
      startTime: vardiya.hours ? vardiya.hours.split(' - ')[0] : '',
      endTime: vardiya.hours ? vardiya.hours.split(' - ')[1] : '',
      duration: vardiya.duration || 0,
      gunler: vardiya.days || [] // API'de 'days' olarak geliyor
    }));
  } catch (e) {
    console.error('Vardiya parse hatası:', e);
  }

  // Her gün için vardiya bilgilerini hesapla
  const getGunVardiyalari = (gunAdi: string) => {
    return parsedVardiyalar.filter(vardiya => 
      vardiya.gunler && vardiya.gunler.includes(gunAdi)
    );
  };

  const getGunToplamSaat = (gunAdi: string) => {
    const gunVardiyalari = getGunVardiyalari(gunAdi);
    return gunVardiyalari.reduce((toplam, vardiya) => toplam + (vardiya.duration || 0), 0);
  };

  // Haftalık toplam hesaplamaları
  const getHaftalikToplamSaat = () => {
    return gunler.reduce((toplam, gunAdi) => {
      return toplam + getGunToplamSaat(gunAdi);
    }, 0);
  };

  const getHaftalikToplamVardiya = () => {
    return gunler.reduce((toplam, gunAdi) => {
      return toplam + getGunVardiyalari(gunAdi).length;
    }, 0);
  };

  const haftalikToplamSaat = getHaftalikToplamSaat();
  const haftalikToplamVardiya = getHaftalikToplamVardiya();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                      const carpim = aktifGun === 5 ? 6 : aktifGun === 6 ? 5 : 30/7;
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
                      const carpim = aktifGun === 5 ? 6 : aktifGun === 6 ? 5 : 30/7;
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
            {gunler.map((gunAdi) => {
              const gunVardiyalari = getGunVardiyalari(gunAdi);
              const gunToplamSaat = getGunToplamSaat(gunAdi);
              const hedefSaat = 40; // Varsayılan hedef saat
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

const TanimliAlanlar: React.FC = () => {
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [expandedAlan, setExpandedAlan] = useState<number | null>(null);
  const [selectedAlan, setSelectedAlan] = useState<Alan | null>(null);
  const [isDetayModalOpen, setIsDetayModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; alanId?: number}>({
    isOpen: false
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Kullanıcı rolüne göre ana sayfa route'unu belirle
  const getHomeRoute = () => {
    if (!user) return '/';
    switch (user.rol) {
      case 'admin':
        return '/admin';
      case 'yonetici':
        return '/vardiyali-nobet';
      case 'personel':
        return '/personel/panel';
      default:
        return '/';
    }
  };

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
        
        // API response yapısını kontrol et
        let rows = [];
        if (result.success && result.data && result.data.rows) {
          rows = result.data.rows;
        } else if (result.rows) {
          rows = result.rows;
        } else if (Array.isArray(result)) {
          rows = result;
        } else if (result.data && Array.isArray(result.data)) {
          rows = result.data;
        }
        
        console.log('📊 İşlenmiş rows verisi:', rows);
        
        if (rows && rows.length > 0) {
          console.log('📊 API\'den gelen ham veri:', rows);
          
          const apiData = rows
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
                const rawVardiyalar = JSON.parse(row.vardiyalar || '[]');
                
                // API'den gelen yapıyı dönüştür
                parsedVardiyalar = rawVardiyalar.map((vardiya: any) => ({
                  id: vardiya.id,
                  name: vardiya.name,
                  startTime: vardiya.hours ? vardiya.hours.split(' - ')[0] : '',
                  endTime: vardiya.hours ? vardiya.hours.split(' - ')[1] : '',
                  duration: vardiya.duration || 0,
                  gunler: vardiya.days || [] // API'de 'days' olarak geliyor
                }));
              } catch (e) {
                console.error('JSON parse hatası:', e);
              }
              
              // Computed fields'i hesapla - Haftalık toplamlar
              const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
              
              // Her gün için vardiya sayısını ve saatini hesapla
              const gunlukVardiyaSayilari = gunler.map(gunAdi => {
                return parsedVardiyalar.filter((vardiya: Vardiya) => 
                  vardiya.gunler && vardiya.gunler.includes(gunAdi)
                ).length;
              });
              
              const gunlukSaatler = gunler.map(gunAdi => {
                const gunVardiyalari = parsedVardiyalar.filter((vardiya: Vardiya) => 
                  vardiya.gunler && vardiya.gunler.includes(gunAdi)
                );
                return gunVardiyalari.reduce((toplam: number, vardiya: Vardiya) => toplam + (vardiya.duration || 0), 0);
              });
              
              // Haftalık toplam saat = her günün toplam saatlerinin toplamı
              const totalHours = gunlukSaatler.reduce((toplam, gunSaat) => toplam + gunSaat, 0);
              
              // Haftalık toplam vardiya sayısı
              const totalVardiya = gunlukVardiyaSayilari.reduce((toplam, sayi) => toplam + sayi, 0);
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
                nobetler: parsedVardiyalar,
                parsedVardiyalar: parsedVardiyalar
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

  const openDetayModal = (alan: Alan) => {
    setSelectedAlan(alan);
    setIsDetayModalOpen(true);
  };

  const closeDetayModal = () => {
    setIsDetayModalOpen(false);
    setSelectedAlan(null);
  };

  const handleDelete = async (alanId: number) => {
    // Popup'ı aç
    setDeleteDialog({ isOpen: true, alanId });
  };

  const confirmDelete = async () => {
    const alanId = deleteDialog.alanId;
    if (!alanId) return;

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
      setDeleteDialog({ isOpen: false }); // Popup'ı kapat
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false });
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
            onClick={() => navigate(getHomeRoute())}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </button>
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
                    title="Detay Görünüm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetayModal(alan);
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
                    
                    {alan.parsedVardiyalar && alan.parsedVardiyalar.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Günlük Vardiya Grupları</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((gunAdi) => {
                            // Bu güne ait vardiyaları al
                            const gunVardiyalari = (alan.parsedVardiyalar || []).filter((vardiya) => 
                              vardiya.gunler && vardiya.gunler.includes(gunAdi)
                            );
                            
                            if (gunVardiyalari.length === 0) {
                              return (
                                <div key={gunAdi} className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                                  <div className="font-medium text-sm text-gray-900">{gunAdi}</div>
                                  <div className="text-xs text-gray-500 mt-1">Vardiya yok</div>
                                </div>
                              );
                            }
                            
                            // Bu gün için vardiyaları tip ve saatlerine göre grupla
                            const gunVardiyaGruplari = new Map<string, {name: string, hours: string, duration: number, count: number}>();
                            
                            gunVardiyalari.forEach((vardiya) => {
                              const key = `${vardiya.name}_${vardiya.startTime}_${vardiya.endTime}`;
                              if (gunVardiyaGruplari.has(key)) {
                                const grup = gunVardiyaGruplari.get(key)!;
                                grup.count++;
                              } else {
                                gunVardiyaGruplari.set(key, {
                                  name: vardiya.name,
                                  hours: `${vardiya.startTime} - ${vardiya.endTime}`,
                                  duration: vardiya.duration,
                                  count: 1
                                });
                              }
                            });
                            
                            return (
                              <div key={gunAdi} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <div className="font-medium text-sm text-gray-900 mb-2">{gunAdi}</div>
                                <div className="space-y-1">
                                  {Array.from(gunVardiyaGruplari.values()).map((grup, index) => (
                                    <div key={index} className="text-xs bg-white rounded p-1 border">
                                      <div className="font-medium">{grup.count} adet {grup.name}</div>
                                      <div className="text-gray-600">{grup.hours} • {grup.duration} saat</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
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

      {/* Silme Popup */}
      {deleteDialog.isOpen && (
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
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
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
      )}

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