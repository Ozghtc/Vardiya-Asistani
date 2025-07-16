import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MoreVertical, Mail, Phone, Building2, ArrowRight, Clock, Calendar, User2 } from 'lucide-react';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';

interface Personnel {
  id: number;
  tcno: string;
  name: string;
  surname: string;
  title: string;
  email: string;
  phone: string;
  minHours: number;
  maxHours: number;
  createdAt: string;
  isActive: boolean;
  areas?: {
    id: number;
    name: string;
    color: string;
  }[];
  requests?: {
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
}

const PersonelListesi: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; personId?: number}>({
    isOpen: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    // KURAL 16: Production ortamında localStorage yasak - demo data sistemi
    
    if (savedPersonnel) {
      let parsedPersonnel = JSON.parse(savedPersonnel);
      
      // Add areas if available
      if (savedAreas) {
        const areas = JSON.parse(savedAreas);
        parsedPersonnel = parsedPersonnel.map((person: Personnel) => ({
          ...person,
          areas: areas.slice(0, 3) // Just for demo, showing first 3 areas
        }));
      }
      
      setPersonnel(parsedPersonnel);
    }
  }, []);

  const handleDelete = (id: number) => {
    const updated = personnel.filter(p => p.id !== id);
    setPersonnel(updated);
    // KURAL 16: Production ortamında localStorage yasak - kayıt disabled
    setSelectedPerson(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personel Listesi</h2>
        <button
          onClick={() => navigate('/personel-ekle')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Personel</span>
        </button>
      </div>

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
                          <div className="font-medium text-gray-900">{person.firstName} {person.lastName}</div>
                          <div className="text-sm text-gray-500">{person.tcno}</div>
                          <div className="text-sm text-blue-600">{person.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{person.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{person.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
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
                  <h3 className="font-semibold text-gray-900">{selectedPerson.firstName} {selectedPerson.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedPerson.title}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{selectedPerson.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{selectedPerson.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{selectedPerson.kurum}</span>
                </div>
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