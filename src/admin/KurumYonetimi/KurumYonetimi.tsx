import React, { useState, useEffect } from 'react';
import { useTemporaryState } from '../../hooks/useApiState';
import { useCapitalization } from '../../hooks/useCapitalization';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import turkiyeIller from './il-ilceler/turkiye-il-ilce.json';
import { 
  testAPI, 
  getKurumlar, 
  addKurum, 
  updateKurum, 
  deleteKurum, 
  addTableColumn, 
  updateKurumlarTable, 
  createUsersTable, 
  setupUserTableFieldsManual,
  expandUserTable
} from '../../lib/api';

// Types
interface Kurum {
  id: string;
  kurum_adi: string;
  kurum_turu: string;
  adres: string;
  il: string;
  ilce: string;
  aktif_mi: boolean;
  departmanlar?: string; // Virgülle ayrılmış string
  birimler?: string; // Virgülle ayrılmış string
  created_at: string;
}

interface DepartmanBirim {
  id: string;
  kurum_id: string;
  departman_adi: string;
  birimler: string; // Virgülle ayrılmış string
  personel_turleri: string; // Virgülle ayrılmış string
}

// Predefined options
const KURUM_TURLERI = ['HASTANE', 'KLİNİK', 'SAĞLIK OCAĞI', 'TIP MERKEZİ', 'POLIKLINIK', 'ÖZEL HASTANE'];

const DEPARTMAN_SABLONLARI = [
  'ACİL SERVİS', 'YOĞUN BAKIM', 'DAHİLİYE', 'CERRAHİ', 'KADIN DOĞUM', 
  'ÇOCUK HASTALIKLARI', 'KARDİYOLOJİ', 'NÖROLOJİ', 'ÜROLOJİ', 'GÖZ', 
  'KULAK BURUN BOĞAZ', 'DERMATOLOJİ', 'PSİKİYATRİ', 'ORTOPEDİ', 'RADYOLOJİ'
];

const BIRIM_SABLONLARI = [
  'YATAN HASTA', 'POLİKLİNİK', 'AMELİYATHANE', 'YOĞUN BAKIM', 
  'ACİL MÜDAHALE', 'GÖZLEM', 'MUAYENE', 'TETKIK', 'LABORATUVAR'
];

const PERSONEL_TURLERI = [
  'DOKTOR', 'HEMŞİRE', 'SAĞLIK TEKNİKERİ', 'TEMİZLİK PERSONELİ', 
  'GÜVENLİK PERSONELİ', 'İDARİ PERSONEL', 'LABORANT', 'RADYOLOJİ TEKNİKERİ', 
  'FİZYOTERAPİST', 'PSİKOLOG', 'DİYETİSYEN', 'ECZACI'
];

const KurumYonetimi = () => {
  // States
  const [kurumlar, setKurumlar] = useState<Kurum[]>([]);
  const [departmanBirimler, setDepartmanBirimler] = useTemporaryState<DepartmanBirim[]>([]);

  // Form states
  const [kurumForm, setKurumForm] = useState({
    kurum_adi: '',
    kurum_turu: '',
    adres: '',
    il: null as { value: string; label: string } | null,
    ilce: null as { value: string; label: string } | null,
    aktif_mi: true
  });

  // Form departman/birim states
  const [formDepartmanlar, setFormDepartmanlar] = useState<string[]>([]);
  const [formBirimler, setFormBirimler] = useState<string[]>([]);
  const [newDepartmanInput, setNewDepartmanInput] = useState('');
  const [newBirimInput, setNewBirimInput] = useState('');

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'aktif' | 'pasif'>('all');
  const [selectedKurum, setSelectedKurum] = useState<Kurum | null>(null);
  const [editingKurum, setEditingKurum] = useState<Kurum | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{kurum: Kurum, confirmText: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  // Inline editing states
  const [editingDepartman, setEditingDepartman] = useState<{kurumId: string, departmanIndex: number} | null>(null);
  const [newDepartmanInputs, setNewDepartmanInputs] = useState<{[kurumId: string]: string}>({});
  const [newBirimInputs, setNewBirimInputs] = useState<{[key: string]: string}>({});
  const [newPersonelInputs, setNewPersonelInputs] = useState<{[key: string]: string}>({});

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dbUpdateLoading, setDbUpdateLoading] = useState(false);
  
  // User table states
  const [userTableCreating, setUserTableCreating] = useState(false);
  const [userTableFieldsAdding, setUserTableFieldsAdding] = useState(false);
  const [expandUserTableLoading, setExpandUserTableLoading] = useState(false);
  const [userTableId, setUserTableId] = useState<number | null>(13); // Mevcut kullanıcı tablosu ID'si

  const [kurumAdi, handleKurumAdiChange] = useCapitalization(kurumForm.kurum_adi);
  const [kurumTuru, handleKurumTuruChange] = useCapitalization(kurumForm.kurum_turu);
  const [adres, handleAdresChange] = useCapitalization(kurumForm.adres);
  const [formDepartmanInput, handleFormDepartmanInputChange] = useCapitalization(newDepartmanInput);
  const [formBirimInput, handleFormBirimInputChange] = useCapitalization(newBirimInput);

  // Load data
  useEffect(() => {
    loadKurumlar();
  }, []);

  const loadKurumlar = async () => {
    setLoading(true);
    try {
      const apiKurumlar = await getKurumlar();
      setKurumlar(apiKurumlar);
    } catch (error: any) {
      setErrorMsg('Kurumlar yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı tablosu oluştur
  const handleCreateUsersTable = async () => {
    setUserTableCreating(true);
    try {
      console.log('🏗️ Kullanıcı tablosu oluşturuluyor...');
      const result = await createUsersTable();
      
      if (result.success) {
        const tableId = result.data?.table?.id;
        if (tableId) {
          setUserTableId(tableId);
          setSuccessMsg('✅ Kullanıcı tablosu başarıyla oluşturuldu! ID: ' + tableId);
          console.log('🎯 Tablo oluşturma sonucu:', result);
        } else {
          setErrorMsg('❌ Tablo oluşturuldu ama ID alınamadı');
        }
      } else {
        setErrorMsg('❌ Hata: ' + result.message);
        console.error('❌ Tablo oluşturma hatası:', result);
      }
    } catch (error) {
      console.error('❌ Tablo oluşturma hatası:', error);
      setErrorMsg('❌ Kullanıcı tablosu oluşturulamadı');
    } finally {
      setUserTableCreating(false);
    }
  };

  // Kullanıcı tablosuna field'ları ekle
  const handleSetupUserTableFields = async () => {
    setUserTableFieldsAdding(true);
    try {
      console.log('🔧 Kullanıcı tablosuna field\'lar ekleniyor...');
      const results = await setupUserTableFieldsManual();
      
      const successCount = results.filter((r: any) => r.success).length;
      const totalCount = results.length;
      
      setSuccessMsg(`✅ ${successCount}/${totalCount} field başarıyla eklendi!`);
      console.log('🎯 Field ekleme sonuçları:', results);
    } catch (error) {
      console.error('❌ Field ekleme hatası:', error);
      setErrorMsg('❌ Field\'lar eklenemedi');
    } finally {
      setUserTableFieldsAdding(false);
    }
  };

  // Kullanıcı tablosunu genişlet
  const handleExpandUserTable = async () => {
    setExpandUserTableLoading(true);
    try {
      const result = await expandUserTable();
      if (result.success) {
        setSuccessMsg(`✅ ${result.message}`);
        console.log('Kullanıcı tablosu genişletildi:', result.data);
      } else {
        setErrorMsg(`❌ ${result.message}`);
      }
    } catch (error) {
      setErrorMsg('❌ Kullanıcı tablosu genişletilemedi');
      console.error('expandUserTable hatası:', error);
    } finally {
      setExpandUserTableLoading(false);
    }
  };

  // Filtered data
  const filteredKurumlar = kurumlar.filter(kurum => {
    const matchesSearch = kurum.kurum_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kurum.kurum_turu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'aktif' && kurum.aktif_mi) ||
                         (filterType === 'pasif' && !kurum.aktif_mi);
    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleAPITest = async () => {
    setApiLoading(true);
    try {
      await testAPI();
      setSuccessMsg('API bağlantısı başarılı!');
    } catch (error) {
      setErrorMsg('API bağlantısı başarısız!');
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateDatabase = async () => {
    setDbUpdateLoading(true);
    try {
      await updateKurumlarTable();
      setSuccessMsg('Veri tabanı başarıyla güncellendi! Departmanlar ve birimler sütunları eklendi.');
    } catch (error) {
      setErrorMsg('Veri tabanı güncellenirken hata oluştu!');
    } finally {
      setDbUpdateLoading(false);
    }
  };

  const handleKurumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const kurumData = {
      kurum_adi: kurumAdi,
      kurum_turu: kurumTuru,
      adres: adres,
      il: kurumForm.il?.value || '',
      ilce: kurumForm.ilce?.value || '',
      aktif_mi: kurumForm.aktif_mi,
      departmanlar: formDepartmanlar.join(', '),
      birimler: formBirimler.join(', ')
    };

    try {
      if (editingKurum) {
        await updateKurum(editingKurum.id, kurumData);
        setKurumlar(prev => prev.map(k => k.id === editingKurum.id ? { ...k, ...kurumData } : k));
        setSuccessMsg('Kurum başarıyla güncellendi!');
        setEditingKurum(null);
      } else {
        const response = await addKurum(kurumData);
        if (response.success) {
          await loadKurumlar(); // Refresh list
          
          // Add departmanlar and birimler to the new kurum
          const newKurum = response.data || { id: Date.now().toString() };
          
          // Create departman entries
          formDepartmanlar.forEach(departmanAdi => {
            const newDepartman: DepartmanBirim = {
              id: Date.now().toString() + Math.random(),
              kurum_id: newKurum.id,
              departman_adi: departmanAdi,
              birimler: formBirimler.join(', '),
              personel_turleri: ''
            };
            setDepartmanBirimler(prev => [...prev, newDepartman]);
          });
          
          // If no departman but has birimler, create a default departman
          if (formDepartmanlar.length === 0 && formBirimler.length > 0) {
            const defaultDepartman: DepartmanBirim = {
              id: Date.now().toString() + Math.random(),
              kurum_id: newKurum.id,
              departman_adi: 'GENEL',
              birimler: formBirimler.join(', '),
              personel_turleri: ''
            };
            setDepartmanBirimler(prev => [...prev, defaultDepartman]);
          }
          
          setSuccessMsg('Kurum başarıyla kaydedildi!');
        }
      }

      // Reset form
      handleKurumAdiChange({ target: { value: '' } } as any);
      handleKurumTuruChange({ target: { value: '' } } as any);
      handleAdresChange({ target: { value: '' } } as any);
      setKurumForm({
        kurum_adi: '',
        kurum_turu: '',
        adres: '',
        il: null,
        ilce: null,
        aktif_mi: true
      });
      setFormDepartmanlar([]);
      setFormBirimler([]);
      setNewDepartmanInput('');
      setNewBirimInput('');
    } catch (error: any) {
      setErrorMsg(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKurum = (kurum: Kurum) => {
    setShowDeleteModal({ kurum, confirmText: '' });
  };

  const confirmDelete = async () => {
    if (showDeleteModal && showDeleteModal.confirmText === showDeleteModal.kurum.kurum_adi) {
      try {
        await deleteKurum(showDeleteModal.kurum.id);
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
      await updateKurum(kurum.id, { aktif_mi: !kurum.aktif_mi });
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
    handleKurumAdiChange({ target: { value: kurum.kurum_adi } } as any);
    handleKurumTuruChange({ target: { value: kurum.kurum_turu } } as any);
    handleAdresChange({ target: { value: kurum.adres } } as any);
    setKurumForm({
      ...kurumForm,
      il: kurum.il ? { value: kurum.il, label: kurum.il } : null,
      ilce: kurum.ilce ? { value: kurum.ilce, label: kurum.ilce } : null,
      aktif_mi: kurum.aktif_mi
    });
    
    // Load existing departmanlar and birimler for editing
    const existingDepartmanlar = getKurumDepartmanlar(kurum.id);
    const departmanAdlari = existingDepartmanlar.map(d => d.departman_adi);
    const birimler = existingDepartmanlar.flatMap(d => d.birimler.split(', ').filter(b => b.trim()));
    
    // Veri tabanından departmanlar ve birimler yükle
    const dbDepartmanlar = kurum.departmanlar ? kurum.departmanlar.split(', ').filter(d => d.trim()) : [];
    const dbBirimler = kurum.birimler ? kurum.birimler.split(', ').filter(b => b.trim()) : [];
    
    // Hem local storage hem de veri tabanı verilerini birleştir
    const allDepartmanlar = [...departmanAdlari, ...dbDepartmanlar];
    const allBirimler = [...birimler, ...dbBirimler];
    
    // Tekrar edenler için unique array yap
    const uniqueDepartmanlar = [...new Set(allDepartmanlar)];
    const uniqueBirimler = [...new Set(allBirimler)];
    
    setFormDepartmanlar(uniqueDepartmanlar);
    setFormBirimler(uniqueBirimler);
  };

  // Form departman/birim handlers
  const addFormDepartman = () => {
    const departmanAdi = formDepartmanInput.trim();
    if (!departmanAdi) return;
    
    if (!formDepartmanlar.includes(departmanAdi)) {
      setFormDepartmanlar(prev => [...prev, departmanAdi]);
      setNewDepartmanInput('');
      handleFormDepartmanInputChange({ target: { value: '' } } as any);
    }
  };

  const removeFormDepartman = (departmanToRemove: string) => {
    setFormDepartmanlar(prev => prev.filter(d => d !== departmanToRemove));
  };

  const addFormBirim = () => {
    const birimAdi = formBirimInput.trim();
    if (!birimAdi) return;
    
    if (!formBirimler.includes(birimAdi)) {
      setFormBirimler(prev => [...prev, birimAdi]);
      setNewBirimInput('');
      handleFormBirimInputChange({ target: { value: '' } } as any);
    }
  };

  const removeFormBirim = (birimToRemove: string) => {
    setFormBirimler(prev => prev.filter(b => b !== birimToRemove));
  };

  // Departman/Birim inline handlers
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

  // Get departmanlar for kurum
  const getKurumDepartmanlar = (kurumId: string) => {
    return departmanBirimler.filter(d => d.kurum_id === kurumId);
  };

  // Auto-clear messages
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
          <button
            onClick={handleUpdateDatabase}
            disabled={dbUpdateLoading}
            className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            {dbUpdateLoading ? 'Güncelleniyor...' : '🔄 DB Güncelle'}
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="LocalStorage'ı temizle ve sayfayı yenile"
          >
            🗑️ Cache Temizle
          </button>
          
          {/* Kullanıcı Tablosu Butonları */}
          <button
            onClick={handleCreateUsersTable}
            disabled={userTableCreating}
            className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
            title="Kullanıcı tablosu oluştur"
          >
            {userTableCreating ? '⏳ Oluşturuluyor...' : '🏗️ Kullanıcı Tablosu Oluştur'}
          </button>
          
          {userTableId && (
            <button
              onClick={handleSetupUserTableFields}
              disabled={userTableFieldsAdding}
              className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
              title="Kullanıcı tablosuna field'ları ekle"
            >
              {userTableFieldsAdding ? '⏳ Ekleniyor...' : '🔧 Field\'ları Ekle'}
            </button>
          )}
          
          {userTableId && (
            <button
              onClick={handleExpandUserTable}
              disabled={expandUserTableLoading}
              className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
              title="Kullanıcı tablosunu genişlet"
            >
              {expandUserTableLoading ? '⏳ Genişletiliyor...' : '🔄 Kullanıcı Tablosunu Genişlet'}
            </button>
          )}
          
          {userTableId && (
            <div className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              ✅ Kullanıcı Tablosu: {userTableId}
            </div>
          )}
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
          {editingKurum ? 'Kurum Güncelle' : 'Yeni Kurum Ekle'}
        </h2>

        <form onSubmit={handleKurumSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kurum Adı</label>
              <input
                type="text"
                value={kurumAdi}
                onChange={handleKurumAdiChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                placeholder="Kurum adını giriniz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kurum Türü</label>
              <Select
                options={KURUM_TURLERI.map(tur => ({ value: tur, label: tur }))}
                value={kurumTuru ? { value: kurumTuru, label: kurumTuru } : null}
                onChange={(selected) => handleKurumTuruChange({ target: { value: selected?.value || '' } } as any)}
                placeholder="Kurum türü seçiniz"
                isClearable
                classNamePrefix="react-select"
                className="react-select-container"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <input
              type="text"
              value={adres}
              onChange={handleAdresChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
              placeholder="Kurum adresi"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
              <Select
                options={turkiyeIller.map(i => ({ value: i.ad, label: i.ad }))}
                value={kurumForm.il}
                onChange={(selected) => setKurumForm(prev => ({ ...prev, il: selected, ilce: null }))}
                placeholder="İl seçiniz"
                isClearable
                classNamePrefix="react-select"
                className="react-select-container"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
              <Select
                options={
                  kurumForm.il
                    ? (turkiyeIller.find(i => i.ad === kurumForm.il?.value)?.ilceler || []).map(ilce => ({ value: ilce, label: ilce }))
                    : []
                }
                value={kurumForm.ilce}
                onChange={(selected) => setKurumForm(prev => ({ ...prev, ilce: selected }))}
                placeholder="İlçe seçiniz"
                isDisabled={!kurumForm.il}
                isClearable
                classNamePrefix="react-select"
                className="react-select-container"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aktif"
                checked={kurumForm.aktif_mi}
                onChange={(e) => setKurumForm(prev => ({ ...prev, aktif_mi: e.target.checked }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="aktif" className="text-sm font-medium text-gray-700">Aktif mi?</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formDepartmanInput}
                onChange={handleFormDepartmanInputChange}
                placeholder="Departman ekle (örn: Satış, Üretim, Mutfak, vs.)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFormDepartman();
                  }
                }}
              />
              <button
                type="button"
                onClick={addFormDepartman}
                disabled={!formDepartmanInput.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ➕
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formBirimInput}
                onChange={handleFormBirimInputChange}
                placeholder="Birim ekle (örn: Kasa, Depo, Servis, vs.)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-green-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFormBirim();
                  }
                }}
              />
              <button
                type="button"
                onClick={addFormBirim}
                disabled={!formBirimInput.trim()}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ➕
              </button>
            </div>
          </div>

          {/* Eklenen Departmanlar */}
          {formDepartmanlar.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-300">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                Eklenen Departmanlar ({formDepartmanlar.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {formDepartmanlar.map((departman, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200 hover:bg-blue-200 transition-colors">
                    <span className="font-medium">{departman}</span>
                    <button
                      type="button"
                      onClick={() => removeFormDepartman(departman)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                      title="Departmanı kaldır"
                    >
                      ❌
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Eklenen Birimler */}
          {formBirimler.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 transition-all duration-300">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-green-600">🏢</span>
                Eklenen Birimler ({formBirimler.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {formBirimler.map((birim, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-full border border-green-200 hover:bg-green-200 transition-colors">
                    <span className="font-medium">{birim}</span>
                    <button
                      type="button"
                      onClick={() => removeFormBirim(birim)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                      title="Birimi kaldır"
                    >
                      ❌
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? '⏳ Kaydediliyor...' : editingKurum ? '✅ Güncelle' : '🏥 Kurum Ekle'}
            </button>

            {editingKurum && (
              <button
                type="button"
                onClick={() => {
                  setEditingKurum(null);
                  handleKurumAdiChange({ target: { value: '' } } as any);
                  handleKurumTuruChange({ target: { value: '' } } as any);
                  handleAdresChange({ target: { value: '' } } as any);
                  setKurumForm({
                    kurum_adi: '',
                    kurum_turu: '',
                    adres: '',
                    il: null,
                    ilce: null,
                    aktif_mi: true
                  });
                  setFormDepartmanlar([]);
                  setFormBirimler([]);
                  setNewDepartmanInput('');
                  setNewBirimInput('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ❌ İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Kurum Listesi */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Kurumlar ({filteredKurumlar.length})</h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kurum ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  🔍
                </div>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Kurumlar</option>
                <option value="aktif">Aktif Kurumlar</option>
                <option value="pasif">Pasif Kurumlar</option>
              </select>

              <button
                onClick={loadKurumlar}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              >
                🔄 Yenile
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-lg">Kurumlar yükleniyor...</p>
            </div>
          ) : filteredKurumlar.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-lg">Henüz kurum bulunmamaktadır</p>
              <p className="text-sm">Yukarıdaki formdan yeni kurum ekleyebilirsiniz</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredKurumlar.map(kurum => {
                const kurumDepartmanlar = getKurumDepartmanlar(kurum.id);
                const isExpanded = selectedKurum?.id === kurum.id;
                
                return (
                  <div
                    key={kurum.id}
                    className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 ${
                      isExpanded ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' : ''
                    } ${!kurum.aktif_mi ? 'opacity-60 bg-gray-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🏥</div>
                        <div>
                          <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-lg">
                            {kurum.kurum_adi}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${kurum.aktif_mi ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {kurum.aktif_mi ? 'Aktif' : 'Pasif'}
                            </span>
                            {kurum.kurum_turu && (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                                {kurum.kurum_turu}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedKurum(isExpanded ? null : kurum)}
                          className="p-2 rounded-lg transition-colors bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="Departman Yönetimi"
                        >
                          {isExpanded ? '🔼' : '🔽'}
                        </button>
                        
                        <button
                          onClick={() => handleToggleActive(kurum)}
                          className={`p-2 rounded-lg transition-colors ${
                            kurum.aktif_mi 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={kurum.aktif_mi ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {kurum.aktif_mi ? '✅' : '⏸️'}
                        </button>

                        <button
                          onClick={() => handleEditKurum(kurum)}
                          className="p-2 rounded-lg transition-colors bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        
                        <button
                          onClick={() => handleDeleteKurum(kurum)}
                          className="p-2 rounded-lg transition-colors bg-red-100 text-red-600 hover:bg-red-200"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Kurum Bilgileri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      {kurum.adres && (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{kurum.adres}</span>
                        </div>
                      )}
                      {(kurum.il || kurum.ilce) && (
                        <div className="flex items-center gap-2">
                          <span>🗺️</span>
                          <span>{kurum.il} {kurum.ilce}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span>{kurumDepartmanlar.length} Departman</span>
                      </div>
                    </div>

                    {/* Departmanlar ve Birimler - Veri Tabanından */}
                    {(kurum.departmanlar || kurum.birimler) && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {kurum.departmanlar && (
                            <div>
                              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <span>📋</span>
                                <span>Departmanlar (VT)</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {kurum.departmanlar.split(', ').filter(d => d.trim()).map((dept, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                                    {dept}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {kurum.birimler && (
                            <div>
                              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <span>🏢</span>
                                <span>Birimler (VT)</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {kurum.birimler.split(', ').filter(b => b.trim()).map((birim, index) => (
                                  <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                                    {birim}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Departman Özeti - Always Visible */}
                    {kurumDepartmanlar.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-2">Departmanlar</div>
                        <div className="flex flex-wrap gap-1">
                          {kurumDepartmanlar.slice(0, 4).map(dept => (
                            <span key={dept.id} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                              {dept.departman_adi}
                            </span>
                          ))}
                          {kurumDepartmanlar.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{kurumDepartmanlar.length - 4} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expanded Departman Management */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                          <span>🏢</span>
                          Departman Yönetimi
                        </h4>

                        {/* Add New Departman */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">Yeni Departman Ekle:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreatableSelect
                              options={DEPARTMAN_SABLONLARI.map(dept => ({ value: dept, label: dept }))}
                              value={newDepartmanInputs[kurum.id] ? { value: newDepartmanInputs[kurum.id], label: newDepartmanInputs[kurum.id] } : null}
                              onChange={(selected) => setNewDepartmanInputs(prev => ({ ...prev, [kurum.id]: selected?.value || '' }))}
                              onInputChange={(inputValue) => setNewDepartmanInputs(prev => ({ ...prev, [kurum.id]: inputValue }))}
                              placeholder="Departman adı seçin veya yazın"
                              isClearable
                              classNamePrefix="react-select"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addDepartman(kurum.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => addDepartman(kurum.id)}
                              disabled={!newDepartmanInputs[kurum.id]?.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              ➕ Ekle
                            </button>
                          </div>
                        </div>

                        {/* Departman List */}
                        <div className="space-y-4">
                          {kurumDepartmanlar.map((departman, index) => (
                            <div key={departman.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-gray-800 flex items-center gap-2">
                                  <span className="text-blue-600">📋</span>
                                  {departman.departman_adi}
                                </h5>
                                <button
                                  onClick={() => removeDepartman(departman.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Departmanı Sil"
                                >
                                  🗑️
                                </button>
                              </div>

                              {/* Birimler */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Birimler:</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <CreatableSelect
                                    options={BIRIM_SABLONLARI.map(birim => ({ value: birim, label: birim }))}
                                    value={newBirimInputs[departman.id] ? { value: newBirimInputs[departman.id], label: newBirimInputs[departman.id] } : null}
                                    onChange={(selected) => setNewBirimInputs(prev => ({ ...prev, [departman.id]: selected?.value || '' }))}
                                    onInputChange={(inputValue) => setNewBirimInputs(prev => ({ ...prev, [departman.id]: inputValue }))}
                                    placeholder="Birim adı"
                                    isClearable
                                    classNamePrefix="react-select"
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addBirim(departman.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => addBirim(departman.id)}
                                    disabled={!newBirimInputs[departman.id]?.trim()}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                                  >
                                    ➕
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {departman.birimler.split(', ').filter(b => b.trim()).map((birim, birimIndex) => (
                                    <span key={birimIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                      {birim}
                                      <button
                                        onClick={() => removeBirim(departman.id, birim)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        ❌
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Personel Türleri */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Personel Türleri:</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <CreatableSelect
                                    options={PERSONEL_TURLERI.map(personel => ({ value: personel, label: personel }))}
                                    value={newPersonelInputs[departman.id] ? { value: newPersonelInputs[departman.id], label: newPersonelInputs[departman.id] } : null}
                                    onChange={(selected) => setNewPersonelInputs(prev => ({ ...prev, [departman.id]: selected?.value || '' }))}
                                    onInputChange={(inputValue) => setNewPersonelInputs(prev => ({ ...prev, [departman.id]: inputValue }))}
                                    placeholder="Personel türü"
                                    isClearable
                                    classNamePrefix="react-select"
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addPersonel(departman.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => addPersonel(departman.id)}
                                    disabled={!newPersonelInputs[departman.id]?.trim()}
                                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                                  >
                                    ➕
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {departman.personel_turleri.split(', ').filter(p => p.trim()).map((personel, personelIndex) => (
                                    <span key={personelIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                      {personel}
                                      <button
                                        onClick={() => removePersonel(departman.id, personel)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        ❌
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {kurumDepartmanlar.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <div className="text-4xl mb-2">🏢</div>
                            <p className="text-sm">Henüz departman eklenmemiş</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
          );
        })}
            </div>
          )}
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800">Kurum Silme Onayı</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Bu kurumu silmek üzeresiniz:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-800">{showDeleteModal.kurum.kurum_adi}</div>
                  <div className="text-sm text-gray-600">{showDeleteModal.kurum.kurum_turu}</div>
                </div>
                
                <p className="text-sm text-gray-600 mt-4 mb-2">
                  Onaylamak için kurum adını yazın:
                </p>
                <input
                  type="text"
                  value={showDeleteModal.confirmText}
                  onChange={(e) => setShowDeleteModal(prev => prev ? { ...prev, confirmText: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={showDeleteModal.kurum.kurum_adi}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ❌ İptal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={showDeleteModal.confirmText !== showDeleteModal.kurum.kurum_adi}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KurumYonetimi;