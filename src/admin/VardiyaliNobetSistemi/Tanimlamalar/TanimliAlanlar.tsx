import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

// 3-Layer API Key Configuration
const API_CONFIG = {
  apiKey: import.meta.env.VITE_HZM_API_KEY || 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  userEmail: import.meta.env.VITE_HZM_USER_EMAIL || 'ozgurhzm@gmail.com',
  projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD || 'hzmsoft123456',
  baseURL: import.meta.env.VITE_HZM_BASE_URL || 'https://hzmbackandveritabani-production-c660.up.railway.app'
};

interface Alan {
  id: string;
  alan_id: string;
  alan_adi: string;
  aciklama?: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
  created_at: string;
  updated_at?: string;
}

const TanimliAlanlar: React.FC = () => {
  const { user } = useAuthContext();
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAktif, setFilterAktif] = useState<boolean | null>(null);
  const [editingAlan, setEditingAlan] = useState<Alan | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Alanları yükle
  const loadAlanlar = async () => {
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
          path: '/api/v1/data/table/72',
          method: 'GET',
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Alanlar API Response:', data);
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        const rows = data.data.rows.filter((alan: any) => 
          alan.kurum_id === user.kurum_id
        );
        setAlanlar(rows);
        console.log(`✅ ${rows.length} alan yüklendi`);
      } else {
        console.warn('⚠️ Beklenmeyen API response formatı:', data);
        setAlanlar([]);
      }
    } catch (error) {
      console.error('❌ Alanlar yüklenirken hata:', error);
      setError('Alanlar yüklenirken bir hata oluştu');
      setAlanlar([]);
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda alanları yükle
  useEffect(() => {
    loadAlanlar();
  }, [user]);

  // Arama ve filtreleme
  const filteredAlanlar = alanlar.filter(alan => {
    const matchesSearch = alan.alan_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alan.alan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alan.aciklama && alan.aciklama.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterAktif === null || alan.aktif_mi === filterAktif;
    
    return matchesSearch && matchesFilter;
  });

  // Alan silme
  const handleDeleteAlan = async (alanId: string) => {
    if (!window.confirm('Bu alanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/72/rows/${alanId}`,
          method: 'DELETE',
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (response.ok) {
        console.log('✅ Alan silindi');
        loadAlanlar(); // Listeyi yenile
      } else {
        throw new Error('Alan silinemedi');
      }
    } catch (error) {
      console.error('❌ Alan silme hatası:', error);
      setError('Alan silinirken bir hata oluştu');
    }
  };

  // Alan düzenleme
  const handleEditAlan = (alan: Alan) => {
    setEditingAlan(alan);
    setShowEditModal(true);
  };

  // Alan güncelleme
  const handleUpdateAlan = async (updatedData: Partial<Alan>) => {
    if (!editingAlan) return;

    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/72/rows/${editingAlan.id}`,
          method: 'PUT',
          body: {
            ...updatedData,
            updated_at: new Date().toISOString()
          },
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (response.ok) {
        console.log('✅ Alan güncellendi');
        setShowEditModal(false);
        setEditingAlan(null);
        loadAlanlar(); // Listeyi yenile
      } else {
        throw new Error('Alan güncellenemedi');
      }
    } catch (error) {
      console.error('❌ Alan güncelleme hatası:', error);
      setError('Alan güncellenirken bir hata oluştu');
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Tanımlı Alanlar</h2>
          <p className="text-gray-600 mt-1">
            {user.kurum_adi} - Toplam {alanlar.length} alan
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={loadAlanlar}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/vardiyali-nobet/tanimlamalar/yeni-alan'}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Yeni Alan Ekle
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
              placeholder="Alan adı, ID veya açıklama ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterAktif === null ? 'all' : filterAktif ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setFilterAktif(value === 'all' ? null : value === 'active');
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Alanlar</option>
            <option value="active">Aktif Alanlar</option>
            <option value="inactive">Pasif Alanlar</option>
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
            Alanlar yükleniyor...
          </div>
        </div>
      )}

      {/* Alanlar Tablosu */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alan Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlanlar.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterAktif !== null
                        ? 'Arama kriterlerinize uygun alan bulunamadı'
                        : 'Henüz tanımlanmış alan bulunmuyor'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredAlanlar.map((alan) => (
                    <tr key={alan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {alan.alan_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alan.alan_adi}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {alan.aciklama || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alan.aktif_mi
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {alan.aktif_mi ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(alan.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditAlan(alan)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAlan(alan.id)}
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

      {/* Düzenleme Modal'ı */}
      {showEditModal && editingAlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Alan Düzenle</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateAlan({
                alan_adi: formData.get('alan_adi') as string,
                aciklama: formData.get('aciklama') as string,
                aktif_mi: formData.get('aktif_mi') === 'true'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alan Adı
                  </label>
                  <input
                    type="text"
                    name="alan_adi"
                    defaultValue={editingAlan.alan_adi}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    name="aciklama"
                    defaultValue={editingAlan.aciklama}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    name="aktif_mi"
                    defaultValue={editingAlan.aktif_mi ? 'true' : 'false'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAlan(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TanimliAlanlar;