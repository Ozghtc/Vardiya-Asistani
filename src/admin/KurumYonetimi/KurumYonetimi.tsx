import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useCapitalization } from '../../hooks/useCapitalization';
import Select from 'react-select';
import turkiyeIller from './il-ilceler/turkiye-il-ilce.json';
import { addKurum, getKurumlar, updateKurum, deleteKurum, testAPI } from '../../lib/api';

// Types
interface Kurum {
  id: string;
  kurum_adi: string;
  kurum_turu: string;
  adres: string;
  il: string;
  ilce: string;
  aktif_mi: boolean;
  departmanlar?: Departman[];
  created_at: string;
}

interface Departman {
  id: string;
  departman_adi: string;
  kurum_id: string;
  birimler?: Birim[];
  personel_turleri?: PersonelTuru[];
}

interface Birim {
  id: string;
  birim_adi: string;
  departman_id: string;
  kurum_id: string;
}

interface PersonelTuru {
  id: string;
  tur_adi: string;
  departman_id: string;
  kurum_id: string;
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
  const [departmanlar, setDepartmanlar] = useLocalStorage<Departman[]>('departmanlar', []);
  const [birimler, setBirimler] = useLocalStorage<Birim[]>('birimler', []);
  const [personelTurleri, setPersonelTurleri] = useLocalStorage<PersonelTuru[]>('personelTurleri', []);

  // Form states
  const [kurumForm, setKurumForm] = useState({
    kurum_adi: '',
    kurum_turu: '',
    adres: '',
    il: null as { value: string; label: string } | null,
    ilce: null as { value: string; label: string } | null,
    aktif_mi: true
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'aktif' | 'pasif'>('all');
  const [selectedKurum, setSelectedKurum] = useState<Kurum | null>(null);
  const [editingKurum, setEditingKurum] = useState<Kurum | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{kurum: Kurum, confirmText: string} | null>(null);
  const [showDepartmanModal, setShowDepartmanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Departman/Birim form states
  const [departmanForm, setDepartmanForm] = useState<Departman[]>([
    { id: '', departman_adi: '', kurum_id: '', birimler: [{ id: '', birim_adi: '', departman_id: '', kurum_id: '' }], personel_turleri: [{ id: '', tur_adi: '', departman_id: '', kurum_id: '' }] }
  ]);

  const [kurumAdi, handleKurumAdiChange] = useCapitalization(kurumForm.kurum_adi);
  const [kurumTuru, handleKurumTuruChange] = useCapitalization(kurumForm.kurum_turu);
  const [adres, handleAdresChange] = useCapitalization(kurumForm.adres);

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
  };

  // Departman/Birim handlers
  const addDepartman = () => {
    setDepartmanForm(prev => [...prev, {
      id: '',
      departman_adi: '',
      kurum_id: selectedKurum?.id || '',
      birimler: [{ id: '', birim_adi: '', departman_id: '', kurum_id: selectedKurum?.id || '' }],
      personel_turleri: [{ id: '', tur_adi: '', departman_id: '', kurum_id: selectedKurum?.id || '' }]
    }]);
  };

  const removeDepartman = (index: number) => {
    setDepartmanForm(prev => prev.filter((_, i) => i !== index));
  };

  const addBirim = (departmanIndex: number) => {
    setDepartmanForm(prev => prev.map((dep, i) => 
      i === departmanIndex 
        ? { ...dep, birimler: [...(dep.birimler || []), { id: '', birim_adi: '', departman_id: '', kurum_id: selectedKurum?.id || '' }] }
        : dep
    ));
  };

  const removeBirim = (departmanIndex: number, birimIndex: number) => {
    setDepartmanForm(prev => prev.map((dep, i) => 
      i === departmanIndex 
        ? { ...dep, birimler: dep.birimler?.filter((_, bi) => bi !== birimIndex) || [] }
        : dep
    ));
  };

  const addPersonelTuru = (departmanIndex: number) => {
    setDepartmanForm(prev => prev.map((dep, i) => 
      i === departmanIndex 
        ? { ...dep, personel_turleri: [...(dep.personel_turleri || []), { id: '', tur_adi: '', departman_id: '', kurum_id: selectedKurum?.id || '' }] }
        : dep
    ));
  };

  const removePersonelTuru = (departmanIndex: number, personelIndex: number) => {
    setDepartmanForm(prev => prev.map((dep, i) => 
      i === departmanIndex 
        ? { ...dep, personel_turleri: dep.personel_turleri?.filter((_, pi) => pi !== personelIndex) || [] }
        : dep
    ));
  };

  const saveDepartmanlar = () => {
    if (!selectedKurum) return;

    // Save to localStorage for now
    const newDepartmanlar = departmanForm.map(dep => ({
      ...dep,
      id: dep.id || Date.now().toString() + Math.random(),
      kurum_id: selectedKurum.id
    }));

    const newBirimler = departmanForm.flatMap(dep => 
      (dep.birimler || []).map(birim => ({
        ...birim,
        id: birim.id || Date.now().toString() + Math.random(),
        departman_id: dep.id || Date.now().toString() + Math.random(),
        kurum_id: selectedKurum.id
      }))
    );

    const newPersonelTurleri = departmanForm.flatMap(dep => 
      (dep.personel_turleri || []).map(personel => ({
        ...personel,
        id: personel.id || Date.now().toString() + Math.random(),
        departman_id: dep.id || Date.now().toString() + Math.random(),
        kurum_id: selectedKurum.id
      }))
    );

    setDepartmanlar(prev => [...prev.filter(d => d.kurum_id !== selectedKurum.id), ...newDepartmanlar]);
    setBirimler(prev => [...prev.filter(b => b.kurum_id !== selectedKurum.id), ...newBirimler]);
    setPersonelTurleri(prev => [...prev.filter(p => p.kurum_id !== selectedKurum.id), ...newPersonelTurleri]);

    setShowDepartmanModal(false);
    setSuccessMsg('Departman ve birimler başarıyla kaydedildi!');
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

  const getKurumDepartmanlar = (kurumId: string) => {
    return departmanlar.filter(d => d.kurum_id === kurumId);
  };

  const getDepartmanBirimler = (departmanId: string) => {
    return birimler.filter(b => b.departman_id === departmanId);
  };

  const getDepartmanPersoneller = (departmanId: string) => {
    return personelTurleri.filter(p => p.departman_id === departmanId);
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredKurumlar.map(kurum => (
                <div
                  key={kurum.id}
                  className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer ${
                    selectedKurum?.id === kurum.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
                  } ${!kurum.aktif_mi ? 'opacity-60 bg-gray-50' : ''}`}
                  onClick={() => setSelectedKurum(selectedKurum?.id === kurum.id ? null : kurum)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏥</div>
                      <div>
                        <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                          {kurum.kurum_adi}
                        </h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${kurum.aktif_mi ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {kurum.aktif_mi ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(kurum);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          kurum.aktif_mi 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={kurum.aktif_mi ? 'Pasif Yap' : 'Aktif Yap'}
                      >
                        {kurum.aktif_mi ? '✅' : '⏸️'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {kurum.kurum_turu && (
                      <div className="flex items-center gap-2">
                        <span>🏷️</span>
                        <span>{kurum.kurum_turu}</span>
                      </div>
                    )}
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
                    
                    {/* Departman Özeti */}
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Departmanlar</div>
                      {getKurumDepartmanlar(kurum.id).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {getKurumDepartmanlar(kurum.id).slice(0, 3).map(dept => (
                            <span key={dept.id} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                              {dept.departman_adi}
                            </span>
                          ))}
                          {getKurumDepartmanlar(kurum.id).length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{getKurumDepartmanlar(kurum.id).length - 3} daha
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Departman tanımlanmamış</p>
                      )}
                    </div>
                  </div>

                  {/* Expanded Actions */}
                  {selectedKurum?.id === kurum.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditKurum(kurum);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          ✏️ Düzenle
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKurum(kurum);
                            setDepartmanForm([
                              { id: '', departman_adi: '', kurum_id: kurum.id, birimler: [{ id: '', birim_adi: '', departman_id: '', kurum_id: kurum.id }], personel_turleri: [{ id: '', tur_adi: '', departman_id: '', kurum_id: kurum.id }] }
                            ]);
                            setShowDepartmanModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          🏢 Departman
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteKurum(kurum);
                          }}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Departman Detayları */}
                      {getKurumDepartmanlar(kurum.id).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-2">Departman Detayları</div>
                          <div className="space-y-2">
                            {getKurumDepartmanlar(kurum.id).map(dept => (
                              <div key={dept.id} className="text-xs">
                                <div className="font-medium text-gray-700">{dept.departman_adi}</div>
                                <div className="ml-2 text-gray-500">
                                  Birimler: {getDepartmanBirimler(dept.id).length} • 
                                  Personel: {getDepartmanPersoneller(dept.id).length}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Departman/Birim Modal */}
      {showDepartmanModal && selectedKurum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Departman ve Birim Yönetimi: {selectedKurum.kurum_adi}
                </h3>
                <button
                  onClick={() => setShowDepartmanModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ❌
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {departmanForm.map((departman, deptIndex) => (
                  <div key={deptIndex} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">Departman {deptIndex + 1}</h4>
                      {departmanForm.length > 1 && (
                        <button
                          onClick={() => removeDepartman(deptIndex)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Departman Adı</label>
                        <Select
                          options={DEPARTMAN_SABLONLARI.map(dept => ({ value: dept, label: dept }))}
                          value={departman.departman_adi ? { value: departman.departman_adi, label: departman.departman_adi } : null}
                          onChange={(selected) => {
                            const newForm = [...departmanForm];
                            newForm[deptIndex].departman_adi = selected?.value || '';
                            setDepartmanForm(newForm);
                          }}
                          placeholder="Departman seçiniz veya yazınız"
                          isClearable
                          isCreatable
                          classNamePrefix="react-select"
                        />
                      </div>
                    </div>

                    {/* Birimler */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-700">Birimler</h5>
                        <button
                          onClick={() => addBirim(deptIndex)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          ➕ Birim Ekle
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(departman.birimler || []).map((birim, birimIndex) => (
                          <div key={birimIndex} className="flex items-center gap-2">
                            <Select
                              options={BIRIM_SABLONLARI.map(b => ({ value: b, label: b }))}
                              value={birim.birim_adi ? { value: birim.birim_adi, label: birim.birim_adi } : null}
                              onChange={(selected) => {
                                const newForm = [...departmanForm];
                                if (newForm[deptIndex].birimler) {
                                  newForm[deptIndex].birimler![birimIndex].birim_adi = selected?.value || '';
                                }
                                setDepartmanForm(newForm);
                              }}
                              placeholder="Birim seçiniz"
                              isClearable
                              isCreatable
                              classNamePrefix="react-select"
                              className="flex-1"
                            />
                            <button
                              onClick={() => removeBirim(deptIndex, birimIndex)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              ❌
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personel Türleri */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-700">Personel Türleri</h5>
                        <button
                          onClick={() => addPersonelTuru(deptIndex)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          ➕ Personel Ekle
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(departman.personel_turleri || []).map((personel, personelIndex) => (
                          <div key={personelIndex} className="flex items-center gap-2">
                            <Select
                              options={PERSONEL_TURLERI.map(p => ({ value: p, label: p }))}
                              value={personel.tur_adi ? { value: personel.tur_adi, label: personel.tur_adi } : null}
                              onChange={(selected) => {
                                const newForm = [...departmanForm];
                                if (newForm[deptIndex].personel_turleri) {
                                  newForm[deptIndex].personel_turleri![personelIndex].tur_adi = selected?.value || '';
                                }
                                setDepartmanForm(newForm);
                              }}
                              placeholder="Personel türü seçiniz"
                              isClearable
                              isCreatable
                              classNamePrefix="react-select"
                              className="flex-1"
                            />
                            <button
                              onClick={() => removePersonelTuru(deptIndex, personelIndex)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              ❌
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={addDepartman}
                  className="px-6 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  ➕ Yeni Departman Ekle
                </button>
                
                <button
                  onClick={saveDepartmanlar}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all"
                >
                  💾 Departmanları Kaydet
                </button>
                
                <button
                  onClick={() => setShowDepartmanModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ❌ İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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