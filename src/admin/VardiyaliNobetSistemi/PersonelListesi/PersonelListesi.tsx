import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MoreVertical, Mail, Phone, Building2, ArrowRight, Clock, Calendar, User2, Users, FileText } from 'lucide-react';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';
import { useAuthContext } from '../../../contexts/AuthContext';
import PersonelNobetTanimlama from '../PersonelEkle/PersonelNobetTanimlama';
import PersonelIstek from '../PersonelEkle/PersonelIstek';

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
  const [activeTab, setActiveTab] = useState('liste');
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; personId?: number}>({
    isOpen: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const loadPersonnel = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/21',
          method: 'GET'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rows) {
          // Kullanıcının kurum/departman/birim'ine göre filtreleme
          const filteredPersonnel = result.data.rows.filter((person: Personnel) => 
            person.kurum_id === user.kurum_id &&
            person.departman_id === user.departman_id &&
            person.birim_id === user.birim_id
          );
          
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

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/21/rows/${id}`,
          method: 'DELETE'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPersonnel(prev => prev.filter(p => p.id !== id));
          setSelectedPerson(null);
        } else {
          alert('Personel silinirken bir hata oluştu');
        }
      } else {
        alert('Personel silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Personel silme hatası:', error);
      alert('Personel silinirken bir hata oluştu');
    }
  };

  const tabs = [
    { 
      id: 'liste', 
      name: 'Personel Listesi', 
      icon: <Users className="w-5 h-5" />,
      description: 'Personel listesi ve yönetimi'
    },
    { 
      id: 'nobet', 
      name: 'Nöbet Tanımlama', 
      icon: <Calendar className="w-5 h-5" />,
      description: 'Vardiya ve nöbet programı ayarları'
    },
    { 
      id: 'istek', 
      name: 'İstek ve İzinler', 
      icon: <FileText className="w-5 h-5" />,
      description: 'Özel istekler ve izin talepleri'
    }
  ];

  const renderPersonelListesi = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500">Personel listesi yükleniyor...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadPersonnel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Yeniden Dene
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personnel List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">TC / Ad Soyad</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">İletişim</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Durum</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {personnel.map((person) => (
                    <tr 
                      key={person.id} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedPerson?.id === person.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedPerson(person)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{person.ad} {person.soyad}</div>
                          <div className="text-sm text-gray-500">{person.tcno}</div>
                          <div className="text-sm text-blue-600">{person.unvan}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{person.email || 'E-posta yok'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{person.telefon || 'Telefon yok'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          person.aktif_mi 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {person.aktif_mi ? 'Aktif' : 'Pasif'}
                        </span>
                        {person.kullanici_sayfasi_aktif && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Giriş Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/personel-ekle/${person.id}`);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ isOpen: true, personId: person.id });
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  <p className="text-gray-500">Henüz personel kaydı bulunmuyor</p>
                  <button
                    onClick={() => navigate('/personel-ekle')}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>İlk Personeli Ekle</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {selectedPerson ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <User2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPerson.ad} {selectedPerson.soyad}</h3>
                  <p className="text-sm text-gray-500">{selectedPerson.unvan}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{selectedPerson.email || 'E-posta yok'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{selectedPerson.telefon || 'Telefon yok'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{user?.kurum_adi || 'Kurum bilgisi yok'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Kayıt: {new Date(selectedPerson.olusturma_tarihi).toLocaleDateString('tr-TR')}</span>
                </div>
                {selectedPerson.giris_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User2 className="w-4 h-4" />
                    <span>Giriş: {selectedPerson.giris_email}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Detayları görüntülemek için personel seçin</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'liste':
        return renderPersonelListesi();
      case 'nobet':
        return <PersonelNobetTanimlama />;
      case 'istek':
        return (
          <PersonelIstek 
            data={{
              istekTuru: '',
              baslangicTarihi: '',
              bitisTarihi: '',
              tekrarlaniyorMu: false,
              aciklama: ''
            }}
            onChange={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personel Yönetimi</h2>
        <button
          onClick={() => navigate('/personel-ekle')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Personel</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:block">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={() => deleteDialog.personId && handleDelete(deleteDialog.personId)}
        title="Personel Silme"
        message="Bu personeli silmek istediğinizden emin misiniz?"
      />
    </div>
  );
};

export default PersonelListesi;