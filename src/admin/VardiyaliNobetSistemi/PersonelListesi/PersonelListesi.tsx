import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Edit, Trash2, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

// 3-Layer API Key Configuration
const API_CONFIG = {
  apiKey: import.meta.env.VITE_HZM_API_KEY,
  userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
  projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD,
  baseURL: import.meta.env.VITE_HZM_BASE_URL || 'https://hzmbackendveritabani-production.up.railway.app'
};

interface Personel {
  id: string;
  kullanici_id: string;
  name: string;
  email: string;
  phone: string;
  rol: string;
  unvan: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
  created_at: string;
  updated_at?: string;
}

const PersonelListesi: React.FC = () => {
  const { user } = useAuthContext();
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Personelleri yükle
  const loadPersoneller = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/33',
          method: 'GET',
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
              // KURAL 18: Debug log kaldırıldı - güvenlik riski
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        // Aynı kurum/departman/birim personellerine filtrele
        const filteredPersonel = data.data.rows.filter((p: any) => 
          p.kurum_id === user.kurum_id &&
          p.departman_id === user.departman_id &&
          p.birim_id === user.birim_id &&
          p.rol !== 'admin' // Admin kullanıcıları hariç tut
        );
        setPersoneller(filteredPersonel);
        console.log(`✅ ${filteredPersonel.length} personel yüklendi`);
      } else {
        console.warn('⚠️ Beklenmeyen API response formatı:', data);
        setPersoneller([]);
      }
    } catch (error) {
      console.error('❌ Personeller yüklenirken hata:', error);
      setError('Personel listesi yüklenirken bir hata oluştu');
      setPersoneller([]);
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda personelleri yükle
  useEffect(() => {
    loadPersoneller();
  }, [user]);

  // Arama ve filtreleme
  const filteredPersoneller = personeller.filter(personel => {
    const matchesSearch = personel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         personel.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         personel.unvan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         personel.kullanici_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || personel.rol === filterRole;
    const matchesActive = filterActive === null || personel.aktif_mi === filterActive;
    
    return matchesSearch && matchesRole && matchesActive;
  });

  // Personel silme
  const handleDeletePersonel = async (personelId: string) => {
    if (!window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/33/rows/${personelId}`,
          method: 'DELETE',
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (response.ok) {
        console.log('✅ Personel silindi');
        loadPersoneller(); // Listeyi yenile
      } else {
        throw new Error('Personel silinemedi');
      }
    } catch (error) {
      console.error('❌ Personel silme hatası:', error);
      setError('Personel silinirken bir hata oluştu');
    }
  };

  // Personel durumu değiştirme
  const handleTogglePersonelStatus = async (personelId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/33/rows/${personelId}`,
          method: 'PUT',
          body: {
            aktif_mi: !currentStatus,
            updated_at: new Date().toISOString()
          },
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (response.ok) {
        console.log('✅ Personel durumu güncellendi');
        loadPersoneller(); // Listeyi yenile
      } else {
        throw new Error('Personel durumu güncellenemedi');
      }
    } catch (error) {
      console.error('❌ Personel durum güncelleme hatası:', error);
      setError('Personel durumu güncellenirken bir hata oluştu');
    }
  };

  // KURAL 18: İş mantığı backend'de yapılmalı
  const getRoleText = (role: string) => {
    // Backend'den rol tanımları gelecek
    return role; // Geçici: Rol adını olduğu gibi göster
  };

  // KURAL 18: UI mantığı backend'de yapılmalı
  const getRoleColor = (role: string) => {
    // Backend'den rol renkleri gelecek
    return 'bg-gray-100 text-gray-800'; // Geçici: Varsayılan renk
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500">Kullanıcı bilgileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personel Listesi</h2>
          <p className="text-gray-600 mt-1">
            {user.kurum_adi} - {user.departman_adi} - {user.birim_adi}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={loadPersoneller}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/vardiyali-nobet/personel-listesi/personel-ekle'}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Yeni Personel
          </button>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ad, email, ünvan veya ID ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Roller</option>
            <option value="yonetici">Yönetici</option>
            <option value="personel">Personel</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setFilterActive(value === 'all' ? null : value === 'active');
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Personeller yükleniyor...
          </div>
        </div>
      )}

      {/* Personel Tablosu */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol & Ünvan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersoneller.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterRole !== 'all' || filterActive !== null
                        ? 'Arama kriterlerinize uygun personel bulunamadı'
                        : 'Henüz personel bulunmuyor'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredPersoneller.map((personel) => (
                    <tr key={personel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {personel.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {personel.kullanici_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{personel.email}</div>
                        <div className="text-sm text-gray-500">{personel.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(personel.rol)}`}>
                          {getRoleText(personel.rol)}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">{personel.unvan}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          personel.aktif_mi
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {personel.aktif_mi ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(personel.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePersonelStatus(personel.id, personel.aktif_mi)}
                            className={`p-1 rounded hover:bg-opacity-20 ${
                              personel.aktif_mi
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={personel.aktif_mi ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            {personel.aktif_mi ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeletePersonel(personel.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* İstatistikler */}
      {!loading && personeller.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{personeller.length}</div>
            <div className="text-sm text-gray-600">Toplam Personel</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              0 {/* KURAL 18: filter().length backend'de yapılacak */}
            </div>
            <div className="text-sm text-gray-600">Aktif Personel</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              0 {/* KURAL 18: filter().length backend'de yapılacak */}
            </div>
            <div className="text-sm text-gray-600">Yönetici</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              0 {/* KURAL 18: filter().length backend'de yapılacak */}
            </div>
            <div className="text-sm text-gray-600">Personel</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonelListesi;