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

  // Inline editing states - Orijinal koddan
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

  // Filtered data - Orijinal koddan
  const filteredKurumlar = kurumlar.filter(kurum => {
    const matchesSearch = kurum.kurum_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (kurum.adres?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

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

      {/* Kurum Listesi Placeholder */}
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
            <div className="space-y-4">
              {filteredKurumlar.map(kurum => (
                <div key={kurum.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏥</div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {kurum.kurum_adi}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {kurum.adres && <span>📍 {kurum.adres}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        kurum.aktif_mi !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {kurum.aktif_mi !== false ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KurumYonetimPaneli; 