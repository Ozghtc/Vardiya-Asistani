import React, { useState, useEffect } from 'react';
import { useTemporaryState } from '../../hooks/useApiState';
import { useCapitalization } from '../../hooks/useCapitalization';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { 
  Building2, Users, MapPin, Phone, Mail, Plus, Save, RotateCcw, AlertCircle, CheckCircle
} from 'lucide-react';
import { Kurum, DepartmanBirim, KurumFormData, FilterType, DeleteModalState } from './types/KurumManagement.types';
import { KurumCrudOperations } from './services/kurumCrudOperations';
import { 
  IL_OPTIONS, getIlceOptions, KURUM_TURU_OPTIONS, DEPARTMAN_OPTIONS, BIRIM_OPTIONS,
  DEPARTMAN_SABLONLARI, BIRIM_SABLONLARI, PERSONEL_TURLERI
} from './data/locationData';
import KurumEkleFormu from './components/KurumEkleFormu';
import KurumListesi from './components/KurumListesi';

const KurumYonetimPaneli: React.FC = () => {
  // States - Orijinal koddan koruyorum
  const [kurumlar, setKurumlar] = useState<Kurum[]>([]);
  const [departmanBirimler, setDepartmanBirimler] = useTemporaryState<DepartmanBirim[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form states
  const [kurumForm, setKurumForm] = useState<KurumFormData>({
    kurum_adi: '',
    kurum_turu: '',
    adres: '',
    il: null,
    ilce: null,
    aktif_mi: true
  });
  
  // Form departman/birim states - Orijinal koddan
  const [formDepartmanlar, setFormDepartmanlar] = useState<string[]>([]);
  const [formBirimler, setFormBirimler] = useState<string[]>([]);
  const [newDepartmanInput, setNewDepartmanInput] = useState('');
  const [newBirimInput, setNewBirimInput] = useState('');

  // UI states - Orijinal koddan
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedKurum, setSelectedKurum] = useState<Kurum | null>(null);
  const [editingKurum, setEditingKurum] = useState<Kurum | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<DeleteModalState | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Inline editing states - RESTORE EDİLDİ
  const [editingDepartman, setEditingDepartman] = useState<{kurumId: string, departmanIndex: number} | null>(null);
  const [newDepartmanInputs, setNewDepartmanInputs] = useState<{[kurumId: string]: string}>({});
  const [newBirimInputs, setNewBirimInputs] = useState<{[key: string]: string}>({});
  const [newPersonelInputs, setNewPersonelInputs] = useState<{[key: string]: string}>({});

  // Capitalization hooks - Orijinal koddan
  const [kurumAdi, handleKurumAdiChange] = useCapitalization(kurumForm.kurum_adi);
  const [kurumTuru, handleKurumTuruChange] = useCapitalization(kurumForm.kurum_turu);
  const [adres, handleAdresChange] = useCapitalization(kurumForm.adres);
  const [formDepartmanInput, handleFormDepartmanInputChange] = useCapitalization(newDepartmanInput);
  const [formBirimInput, handleFormBirimInputChange] = useCapitalization(newBirimInput);

  // Load data - Orijinal koddan
  useEffect(() => {
    loadKurumlar();
  }, []);

  const loadKurumlar = async () => {
    setLoading(true);
    try {
      const apiKurumlar = await KurumCrudOperations.getAllKurumlar();
      setKurumlar(apiKurumlar);
    } catch (error: any) {
      setErrorMsg('Kurumlar yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // API Test - Orijinal koddan
  const handleAPITest = async () => {
    setApiLoading(true);
    try {
      await KurumCrudOperations.testApiConnection(setSuccessMsg, setErrorMsg);
    } catch (error) {
      setErrorMsg('API bağlantısı başarısız!');
    } finally {
      setApiLoading(false);
    }
  };

  // RESTORE EDİLDİ - Departman/Birim handlers
  const handleDeleteKurum = (kurum: Kurum) => {
    setShowDeleteModal({ kurum, confirmText: '' });
  };

  const confirmDelete = async () => {
    if (showDeleteModal && showDeleteModal.confirmText === showDeleteModal.kurum.kurum_adi) {
      try {
        // Delete kurum logic here - implement in services
        setKurumlar(prev => prev.filter(k => k.id !== showDeleteModal.kurum.id));
        // Remove related departmanlar
        setDepartmanBirimler(prev => prev.filter(d => d.kurum_id !== showDeleteModal.kurum.id));
        setShowDeleteModal(null);
        setSelectedKurum(null);
        setSuccessMsg('Kurum başarıyla silindi!');
      } catch (error: any) {
        setErrorMsg('Kurum silinirken hata oluştu: ' + error.message);
      }
    }
  };

  const handleToggleActive = async (kurum: Kurum) => {
    try {
      // Toggle active logic here - implement in services
      setKurumlar(prev => prev.map(k => 
        k.id === kurum.id ? { ...k, aktif_mi: !k.aktif_mi } : k
      ));
      setSuccessMsg(`Kurum ${!kurum.aktif_mi ? 'aktif' : 'pasif'} hale getirildi!`);
    } catch (error: any) {
      setErrorMsg('Kurum durumu değiştirilirken hata oluştu: ' + error.message);
    }
  };

  const handleEditKurum = (kurum: Kurum) => {
    setEditingKurum(kurum);
    // Edit logic here
  };

  // Departman/Birim inline handlers - RESTORE EDİLDİ
  const addDepartman = (kurumId: string) => {
    const departmanAdi = newDepartmanInputs[kurumId]?.trim();
    if (!departmanAdi) return;

    const newDepartman: DepartmanBirim = {
      id: Date.now().toString() + Math.random(),
      kurum_id: kurumId,
      departman_adi: departmanAdi.toLocaleUpperCase('tr-TR'),
      birimler: '',
      personel_turleri: ''
    };

    setDepartmanBirimler(prev => [...prev, newDepartman]);
    setNewDepartmanInputs(prev => ({ ...prev, [kurumId]: '' }));
    setSuccessMsg('Departman başarıyla eklendi!');
  };

  const removeDepartman = (departmanId: string) => {
    setDepartmanBirimler(prev => prev.filter(d => d.id !== departmanId));
    setSuccessMsg('Departman silindi!');
  };

  const addBirim = (departmanId: string) => {
    const birimAdi = newBirimInputs[departmanId]?.trim();
    if (!birimAdi) return;

    setDepartmanBirimler(prev => prev.map(d => 
      d.id === departmanId 
        ? { ...d, birimler: d.birimler ? `${d.birimler}, ${birimAdi.toLocaleUpperCase('tr-TR')}` : birimAdi.toLocaleUpperCase('tr-TR') }
        : d
    ));
    setNewBirimInputs(prev => ({ ...prev, [departmanId]: '' }));
    setSuccessMsg('Birim başarıyla eklendi!');
  };

  const addPersonel = (departmanId: string) => {
    const personelAdi = newPersonelInputs[departmanId]?.trim();
    if (!personelAdi) return;

    setDepartmanBirimler(prev => prev.map(d => 
      d.id === departmanId 
        ? { ...d, personel_turleri: d.personel_turleri ? `${d.personel_turleri}, ${personelAdi.toLocaleUpperCase('tr-TR')}` : personelAdi.toLocaleUpperCase('tr-TR') }
        : d
    ));
    setNewPersonelInputs(prev => ({ ...prev, [departmanId]: '' }));
    setSuccessMsg('Personel türü başarıyla eklendi!');
  };

  const removeBirim = (departmanId: string, birimToRemove: string) => {
    setDepartmanBirimler(prev => prev.map(d => 
      d.id === departmanId 
        ? { ...d, birimler: d.birimler.split(', ').filter(b => b !== birimToRemove).join(', ') }
        : d
    ));
  };

  const removePersonel = (departmanId: string, personelToRemove: string) => {
    setDepartmanBirimler(prev => prev.map(d => 
      d.id === departmanId 
        ? { ...d, personel_turleri: d.personel_turleri.split(', ').filter(p => p !== personelToRemove).join(', ') }
        : d
    ));
  };

  // Auto-clear messages - Orijinal koddan
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  return (
    <div className="w-full max-w-full mx-0 mt-4 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kurum Yönetimi</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAPITest}
            disabled={apiLoading}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {apiLoading ? 'Test ediliyor...' : 'API Test'}
          </button>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Toplam: {kurumlar.length} kurum
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ❌ {errorMsg}
        </div>
      )}

      {/* Kurum Ekleme Formu */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-blue-600">🏥</span>
          Yeni Kurum Ekle
        </h2>
        
        <KurumEkleFormu onSuccess={loadKurumlar} />
      </div>

      {/* RESTORE EDİLDİ - Kapsamlı Kurumlar Listesi */}
      <KurumListesi
        kurumlar={kurumlar}
        departmanBirimler={departmanBirimler}
        loading={loading}
        searchTerm={searchTerm}
        filterType={filterType}
        selectedKurum={selectedKurum}
        showDeleteModal={showDeleteModal}
        newDepartmanInputs={newDepartmanInputs}
        newBirimInputs={newBirimInputs}
        newPersonelInputs={newPersonelInputs}
        onEdit={handleEditKurum}
        onDelete={handleDeleteKurum}
        onToggleActive={handleToggleActive}
        onSelectKurum={setSelectedKurum}
        onRefresh={loadKurumlar}
        setSearchTerm={setSearchTerm}
        setFilterType={setFilterType}
        setShowDeleteModal={setShowDeleteModal}
        confirmDelete={confirmDelete}
        setNewDepartmanInputs={setNewDepartmanInputs}
        setNewBirimInputs={setNewBirimInputs}
        setNewPersonelInputs={setNewPersonelInputs}
        addDepartman={addDepartman}
        removeDepartman={removeDepartman}
        addBirim={addBirim}
        removeBirim={removeBirim}
        addPersonel={addPersonel}
        removePersonel={removePersonel}
      />
    </div>
  );
};

export default KurumYonetimPaneli; 