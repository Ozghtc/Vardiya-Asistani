import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User2, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';

interface Personnel {
  id: number;
  tcno: string;
  ad: string;
  soyad: string;
  unvan: string;
  email: string;
  telefon: string;
  giris_email?: string;
  kullanici_sayfasi_aktif?: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

const PersonelListesi: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    personId: number | null;
    personName: string;
  }>({
    isOpen: false,
    personId: null,
    personName: ''
  });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const loadPersonnel = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Cache'i temizle ve taze veri çek
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/21',
          method: 'GET',
          apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
          // Cache'i bypass et
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API\'den gelen TAZE personel verileri:', result);
        
        if (result.success && result.data?.rows) {
          // Tüm personelleri göster (MERT ALTİNTAS'ı bulmak için)
          const allPersonnel = result.data.rows;
          console.log('TÜM personel verileri (filtresiz):', allPersonnel);
          
          // MERT ALTİNTAS'ı ara
          const mertAltintas = allPersonnel.find((person: Personnel) => 
            person.ad === 'MERT' && person.soyad === 'ALTİNTAS'
          );
          console.log('MERT ALTİNTAS bulundu mu?:', mertAltintas);
          
          // Kullanıcının kurum/departman/birim'ine göre filtreleme
          const filteredPersonnel = allPersonnel.filter((person: Personnel) => 
            person.kurum_id === user.kurum_id &&
            person.departman_id === user.departman_id &&
            person.birim_id === user.birim_id
          );
          
          console.log('Filtrelenmiş personel verileri:', filteredPersonnel);
          setPersonnel(filteredPersonnel);
        } else {
          setError('Personel verileri yüklenemedi');
        }
      } else {
        setError('API çağrısı başarısız');
      }
    } catch (error) {
      console.error('Personel yükleme hatası:', error);
      setError('Personel verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const handleDeleteClick = (person: Personnel) => {
    setDeleteDialog({
      isOpen: true,
      personId: person.id,
      personName: `${person.ad} ${person.soyad}`
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.personId) return;

    try {
      setDeleting(true);
      
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/21/rows/${deleteDialog.personId}`,
          method: 'DELETE',
          apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7'
        })
      });

      if (response.ok) {
        // Personeli listeden kaldır
        setPersonnel(prev => prev.filter(p => p.id !== deleteDialog.personId));
        setDeleteDialog({ isOpen: false, personId: null, personName: '' });
      } else {
        setError('Personel silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Personel silme hatası:', error);
      setError('Personel silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, personId: null, personName: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/personel-islemleri')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Personel Listesi</h1>
            <p className="text-gray-600">Aktif personel listesi</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/personel-ekle')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Personel</span>
        </button>
      </div>

      {/* Excel Tarzı Personel Tablosu */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Personel Listesi ({personnel.length} personel)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Aktif Personel</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TC Kimlik No
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ünvan
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturma Tarihi
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {personnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {person.ad} {person.soyad}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{person.tcno}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {person.unvan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {person.email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {person.telefon || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {person.olusturma_tarihi ? new Date(person.olusturma_tarihi).toLocaleDateString('tr-TR') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      person.aktif_mi 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {person.aktif_mi ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/personel-duzenle/${person.id}`)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                        title="Personeli Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(person)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Personeli Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {personnel.length === 0 && (
            <div className="text-center py-12">
              <User2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Henüz personel kaydı bulunmuyor</p>
              <button
                onClick={() => navigate('/personel-ekle')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>İlk Personeli Ekle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Personeli Sil"
        message={`"${deleteDialog.personName}" adlı personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />
    </div>
  );
};

export default PersonelListesi;