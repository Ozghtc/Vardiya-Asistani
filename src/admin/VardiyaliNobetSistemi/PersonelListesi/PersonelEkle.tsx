import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Save, User, UserPlus } from 'lucide-react';
import { safeStringOperation } from '../../../hooks/useCapitalization';
import { apiRequest } from '../../../lib/api';
import { useAuthContext } from '../../../contexts/AuthContext';

interface Unvan {
  id: number;
  unvan_adi: string;
  aciklama?: string;
}

interface MesaiTuru {
  id: number;
  mesai_adi: string;
  gunler: string;
  mesai_saati: number;
}

interface PersonelFormData {
  ad: string;
  soyad: string;
  tc: string;
  unvan_id: string;
  mesai_hesap: string;
  email: string;
  telefon: string;
}

const PersonelEkle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState<PersonelFormData>({
    ad: '',
    soyad: '',
    tc: '',
    unvan_id: '',
    mesai_hesap: '',
    email: '',
    telefon: ''
  });
  const [unvanlar, setUnvanlar] = useState<Unvan[]>([]);
  const [mesaiTurleri, setMesaiTurleri] = useState<MesaiTuru[]>([]);
  const [loading, setLoading] = useState(false);
  const [mesaiLoading, setMesaiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mesai türlerini yükle
  const loadMesaiTurleri = async () => {
    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) return;
    
    setMesaiLoading(true);
    try {
      console.log('🔍 Mesai türleri yükleniyor...');
      
      const response = await apiRequest(`/api/v1/data/table/24?kurum_id=${user.kurum_id}&departman_id=${user.departman_id}&birim_id=${user.birim_id}`, {
        method: 'GET'
      });
      
      console.log('📦 Mesai API Response:', response);
      
      if (response.success) {
        console.log('✅ Mesai türleri başarıyla yüklendi:', response.data.rows);
        setMesaiTurleri(response.data.rows);
      } else {
        console.error('❌ Mesai API Error:', response.error);
      }
    } catch (error) {
      console.error('🚨 Mesai türleri yüklenemedi:', error);
    } finally {
      setMesaiLoading(false);
    }
  };

  // Unvanları yükle
  useEffect(() => {
    const loadUnvanlar = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest('/api/v1/data/table/15');
        if (response.success && response.data?.rows) {
          setUnvanlar(response.data.rows);
        } else {
          setError('Ünvanlar yüklenemedi');
        }
      } catch (error) {
        console.error('Unvanlar yüklenirken hata:', error);
        setError('Ünvanlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUnvanlar();
      loadMesaiTurleri();
    }
  }, [user]);

  // Birim hemşire ise otomatik ünvan seçimi ve tam mesai seçimi
  useEffect(() => {
    if (unvanlar.length > 0 && mesaiTurleri.length > 0 && user) {
      // Birim hemşire ise otomatik hemşire ünvanı seç
      if (user.birim_id && user.birim_id.toLowerCase().includes('hemşire')) {
        const hemşireUnvan = unvanlar.find(unvan => 
          unvan.unvan_adi.toLowerCase().includes('hemşire') ||
          unvan.unvan_adi.toLowerCase().includes('hemşire')
        );
        
        if (hemşireUnvan) {
          setFormData(prev => ({
            ...prev,
            unvan_id: hemşireUnvan.id.toString()
          }));
        }
      }

      // Tam Mesai'yi otomatik seç
      const tamMesai = mesaiTurleri.find(mesai => 
        mesai.mesai_adi.toLowerCase().includes('tam') ||
        mesai.mesai_adi.toLowerCase().includes('full')
      );
      
      if (tamMesai) {
        setFormData(prev => ({
          ...prev,
          mesai_hesap: tamMesai.id.toString()
        }));
      }
    }
  }, [unvanlar, mesaiTurleri, user]);

  const handleInputChange = (field: keyof PersonelFormData, value: string) => {
    let processedValue = value;
    
    // TC için sadece rakam
    if (field === 'tc') {
      processedValue = value.replace(/\D/g, '').slice(0, 11);
    }
    
    // Telefon için format
    if (field === 'telefon') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Ad ve soyad için büyük harf
    if (field === 'ad' || field === 'soyad') {
      processedValue = safeStringOperation(value, 'toUpperCase');
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Kullanıcı bilgileri bulunamadı');
      return;
    }
    
    // Validasyon
    if (!formData.ad || !formData.soyad || !formData.tc || !formData.unvan_id) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (formData.tc.length !== 11) {
      setError('TC Kimlik No 11 haneli olmalıdır');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Seçilen ünvanın adını bul
      const secilenUnvan = unvanlar.find(unvan => unvan.id.toString() === formData.unvan_id);
      const unvanAdi = secilenUnvan ? secilenUnvan.unvan_adi : '';

      const personelData = {
        tcno: formData.tc, // API'de tcno olarak geçiyor
        ad: formData.ad,
        soyad: formData.soyad,
        unvan: formData.unvan_id, // ID olarak kaydet
        unvan_adi: unvanAdi, // Metin olarak da kaydet
        mesai_hesap: formData.mesai_hesap,
        email: formData.email || '',
        telefon: formData.telefon || '',
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id,
        aktif_mi: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Personel verisi gönderiliyor:', personelData);

      const response = await apiRequest('/api/v1/data/table/21/rows', {
        method: 'POST',
        body: JSON.stringify(personelData)
      });

      console.log('API yanıtı:', response);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/personel-listesi');
        }, 2000);
      } else {
        setError(response.message || 'Personel eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Personel ekleme hatası:', error);
      setError(error.message || 'Personel eklenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

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

  const handleBack = () => {
    navigate(getHomeRoute());
  };

    // Kullanıcı yoksa loading göster
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Geri Dön</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Personel Ekle</h1>
            </div>
            <div className="flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-500">Personel Yönetimi</span>
            </div>
          </div>
          <p className="mt-2 text-gray-600">Yeni personel kaydı oluşturun</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="w-5 h-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Personel başarıyla eklendi! Personel listesine yönlendiriliyorsunuz...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-red-400">⚠️</div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Personel Bilgileri</h2>
            <p className="text-sm text-gray-600 mt-1">Temel personel bilgilerini girin</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Ad Soyad Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-2">
                  Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => handleInputChange('ad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AD"
                  required
                />
              </div>

              <div>
                <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-2">
                  Soyadı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="soyad"
                  value={formData.soyad}
                  onChange={(e) => handleInputChange('soyad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SOYAD"
                  required
                />
              </div>
            </div>

            {/* TC Kimlik Row */}
            <div>
              <label htmlFor="tc" className="block text-sm font-medium text-gray-700 mb-2">
                TC Kimlik No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tc"
                value={formData.tc}
                onChange={(e) => handleInputChange('tc', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12345678901"
                maxLength={11}
                required
              />
              <p className="mt-1 text-xs text-gray-500">11 haneli TC Kimlik numarası</p>
            </div>

            {/* Unvan ve Mesai Hesap Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="unvan" className="block text-sm font-medium text-gray-700 mb-2">
                  Ünvan <span className="text-red-500">*</span>
                </label>
                <select
                  id="unvan"
                  value={formData.unvan_id}
                  onChange={(e) => handleInputChange('unvan_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Ünvan seçiniz</option>
                  {unvanlar.map((unvan) => (
                    <option key={unvan.id} value={unvan.id}>
                      {unvan.unvan_adi}
                    </option>
                  ))}
                </select>
                {loading && <p className="mt-1 text-xs text-gray-500">Ünvanlar yükleniyor...</p>}
              </div>

              <div>
                <label htmlFor="mesai_hesap" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesai Hesap <span className="text-red-500">*</span>
                </label>
                <select
                  id="mesai_hesap"
                  value={formData.mesai_hesap}
                  onChange={(e) => handleInputChange('mesai_hesap', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Mesai hesap seçiniz</option>
                  {mesaiTurleri.map((mesai) => (
                    <option key={mesai.id} value={mesai.id}>
                      {mesai.mesai_adi}
                    </option>
                  ))}
                </select>
                {mesaiLoading && <p className="mt-1 text-xs text-gray-500">Mesai türleri yükleniyor...</p>}
                
                {/* Seçilen mesai türünün detayları */}
                {formData.mesai_hesap && (() => {
                  const secilenMesai = mesaiTurleri.find(mesai => mesai.id.toString() === formData.mesai_hesap);
                  if (secilenMesai) {
                    try {
                      const gunler = JSON.parse(secilenMesai.gunler);
                      return (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">{secilenMesai.mesai_adi}</div>
                          <div className="text-xs text-blue-600 mt-1">
                            Günler: {gunler.join(', ')} | {secilenMesai.mesai_saati} saat
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('JSON parse hatası:', error);
                      return null;
                    }
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* İletişim Bilgileri Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="telefon"
                  value={formData.telefon}
                  onChange={(e) => handleInputChange('telefon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5XX XXX XX XX"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Personel Ekle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonelEkle; 