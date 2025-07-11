import React, { useState, useEffect } from 'react';
import { UserPlus, ChevronLeft, Save, User, Calendar, Key, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonelBilgileri from './PersonelBilgileri';
import PersonelNobetTanimlama from './PersonelNobetTanimlama';
import GirisBilgileri from './GirisBilgileri';
import PersonelIstek from './PersonelIstek';

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // Hata loglanabilir
    // console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 32 }}>
          <h2>Bir hata oluştu:</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const PersonelEkle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bilgiler');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    title: '',
    tcno: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    startDate: '',
    istekTuru: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    tekrarlaniyorMu: false,
    aciklama: '',
    hasLoginPage: false,
    password: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('Personel Bilgilerini Giriniz');
  const [hasNobetTanimlama, setHasNobetTanimlama] = useState(false);

  useEffect(() => {
    // Check if any shifts are defined in localStorage
    const checkExistingShifts = () => {
      const savedOzelNobetler = localStorage.getItem('kayitliOzelNobetler');
      const savedGenelNobetler = localStorage.getItem('kayitliGenelNobetler');
      
      const ozelNobetler = savedOzelNobetler ? JSON.parse(savedOzelNobetler) : [];
      const genelNobetler = savedGenelNobetler ? JSON.parse(savedGenelNobetler) : [];
      
      return ozelNobetler.length > 0 || genelNobetler.length > 0;
    };

    setHasNobetTanimlama(checkExistingShifts());
  }, []);

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

    if (!isValid) {
      setValidationMessage('Personel Bilgilerini Giriniz');
    } else if (!hasNobetTanimlama) {
      setValidationMessage('En Az Bir Nöbet Tanımlayın');
    } else {
      setValidationMessage('');
    }
  }, [formData, hasNobetTanimlama]);

  const tabs = [
    { id: 'bilgiler', name: 'Personel Bilgileri', icon: <User className="w-5 h-5" /> },
    { id: 'nobet', name: 'Nöbet Tanımlama', icon: <Calendar className="w-5 h-5" /> },
    { id: 'giris', name: 'Giriş Bilgileri', icon: <Key className="w-5 h-5" /> },
    { id: 'istek', name: 'İstek ve İzinler', icon: <FileText className="w-5 h-5" /> },
  ];

  const handleSave = () => {
    if (!isFormValid) return;
    
    const savedPersonnel = localStorage.getItem('personeller');
    const personeller = savedPersonnel ? JSON.parse(savedPersonnel) : [];
    
    const newPersonel = {
      id: Date.now(),
      ...formData
    };
    
    personeller.push(newPersonel);
    localStorage.setItem('personeller', JSON.stringify(personeller));
    
    navigate(-1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bilgiler':
        return <PersonelBilgileri data={{
          name: formData.name,
          surname: formData.surname,
          title: formData.title,
          tcno: formData.tcno,
          email: formData.email
        }} onChange={d => setFormData(f => ({ ...f, ...d }))} />;
      case 'nobet':
        return <PersonelNobetTanimlama />;
      case 'giris':
        return <GirisBilgileri />;
      case 'istek':
        return <PersonelIstek 
          data={{
            istekTuru: formData.istekTuru,
            baslangicTarihi: formData.baslangicTarihi,
            bitisTarihi: formData.bitisTarihi,
            tekrarlaniyorMu: formData.tekrarlaniyorMu,
            aciklama: formData.aciklama
          }}
          onChange={d => setFormData(f => ({ ...f, ...d }))}
        />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Personel Ekle</h2>
            </div>
            {validationMessage && !hasNobetTanimlama && (
              <div className="mt-2 text-red-600 text-sm font-medium">
                {validationMessage}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={!isFormValid || !hasNobetTanimlama}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFormValid && hasNobetTanimlama
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>Kaydet</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Geri Dön</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="border-b">
            <div className="flex gap-4 px-4 pt-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 w-64 px-4 py-3 rounded-lg transition-all duration-300
                      font-medium shadow-sm
                      ${isActive ? 'bg-blue-600 text-white shadow-lg outline outline-2 outline-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 border border-gray-200'}
                    `}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PersonelEkle;