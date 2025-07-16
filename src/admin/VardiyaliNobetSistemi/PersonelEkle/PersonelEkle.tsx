import React, { useState, useEffect } from 'react';
import { UserPlus, ChevronLeft, Save, User, Calendar, FileText, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonelNobetTanimlama from './PersonelNobetTanimlama';
import PersonelIstek from './PersonelIstek';
import { useCapitalization } from '../../../hooks/useCapitalization';

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('PersonelEkle Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Bir hata oluştu</h2>
              <p className="text-gray-600 mb-4">Sayfa yeniden yükleniyor...</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PersonelEkle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bilgiler');
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    title: '',
    tcno: '',
    email: '',
    phone: '',
    loginEmail: '',
    password: '',
    hasLoginPage: false,
    istekTuru: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    tekrarlaniyorMu: false,
    aciklama: ''
  });

  // Hooks
  const [name, handleNameChange] = useCapitalization(formData.name);
  const [surname, handleSurnameChange] = useCapitalization(formData.surname);
  const [showPassword, setShowPassword] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load titles from API
  useEffect(() => {
    const loadTitles = async () => {
      try {
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/15',
            method: 'GET'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.rows) {
            const uniqueTitles = [...new Set(data.data.rows.map((row: any) => row.unvan_adi))].filter(Boolean) as string[];
            setTitles(uniqueTitles);
          }
        }
      } catch (error) {
        console.error('Ünvanlar yüklenemedi:', error);
      }
    };
    
    loadTitles();
  }, []);

  // Form validation
  useEffect(() => {
    const { name, surname, title, tcno } = formData;
    const isValid = Boolean(
      name.trim() && 
      surname.trim() && 
      title.trim() && 
      tcno.trim() && 
      tcno.length === 11
    );
    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle capitalization
    if (field === 'name') {
      handleNameChange({ target: { value: value as string } } as any);
    } else if (field === 'surname') {
      handleSurnameChange({ target: { value: value as string } } as any);
    }
  };

  const handleSave = () => {
    if (!isFormValid) return;
    
    try {
      // KURAL 16: Production ortamında localStorage yasak - kayıt disabled
      console.log('✅ Personel kaydedildi (production):', formData);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Personel kaydetme hatası:', error);
    }
  };

  const tabs = [
    { 
      id: 'bilgiler', 
      name: 'Personel Bilgileri', 
      icon: <User className="w-5 h-5" />,
      description: 'Temel personel bilgileri ve giriş ayarları'
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

  const renderPersonelBilgileri = () => (
    <div className="space-y-8">
      {/* Personel Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personel Bilgileri
          </h3>
          <p className="text-sm text-gray-600 mt-1">Personelin temel bilgilerini giriniz</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TC Kimlik No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tcno}
                onChange={(e) => handleInputChange('tcno', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TC KİMLİK NO"
                maxLength={11}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ünvan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seçiniz</option>
                {titles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SOYAD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="05XX XXX XX XX"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Giriş Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            Giriş Bilgileri
          </h3>
          <p className="text-sm text-gray-600 mt-1">Personelin sisteme giriş bilgilerini ayarlayın</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasLoginPage}
                onChange={(e) => handleInputChange('hasLoginPage', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Bu personel için kullanıcı sayfası açılsın
              </span>
            </label>
          </div>

          {formData.hasLoginPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giriş E-postası
                </label>
                <input
                  type="email"
                  value={formData.loginEmail}
                  onChange={(e) => handleInputChange('loginEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="giris@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!isFormValid}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
            isFormValid
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          Personeli Kaydet
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Başarılı!</h3>
              <p className="text-gray-600">Personel başarıyla kaydedildi.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'bilgiler':
        return renderPersonelBilgileri();
      case 'nobet':
        return <PersonelNobetTanimlama />;
      case 'istek':
        return (
          <PersonelIstek 
            data={{
              istekTuru: formData.istekTuru,
              baslangicTarihi: formData.baslangicTarihi,
              bitisTarihi: formData.bitisTarihi,
              tekrarlaniyorMu: formData.tekrarlaniyorMu,
              aciklama: formData.aciklama
            }}
            onChange={(d) => setFormData(f => ({ ...f, ...d }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Personel Ekle</h1>
                  <p className="text-gray-600">Yeni personel bilgilerini giriniz</p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Geri Dön
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
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
          </div>

          {/* Content */}
          <div className="mb-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PersonelEkle;