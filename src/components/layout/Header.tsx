import React from 'react';
import { BellRing, User, Clock } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthContext();
  const [showMenu, setShowMenu] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<{date: string, time: string} | null>(null);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setCurrentTime({ date, time });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // AuthContext'den kullanıcı bilgilerini al - Demo veri gömme kaldırıldı
  React.useEffect(() => {
    console.log('🔐 Header: AuthContext kullanıcı bilgileri:', currentUser);
  }, [currentUser]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Yönetici Paneli';
      case '/vardiyali-nobet':
        return 'Vardiyalı Nöbet Sistemi';
      case '/vardiya-tanimlama':
        return 'Vardiya Tanımlama';
      case '/kurum-ekle':
        return 'Kurum Yönetimi';
      case '/kullanici-ekle':
        return 'Kullanıcı Yönetimi';
      case '/vardiya-planla':
        return 'Vardiya Planlama';
      case '/tanimlamalar':
        return 'Tanımlamalar';
      case '/nobet/ekran':
        return 'Nöbet Ekranı';
      case '/nobet/kurallar':
        return 'Nöbet Kuralları';
      case '/nobet/olustur':
        return 'Nöbet Oluştur';
      case '/nobet/raporlar':
        return 'Nöbet Raporları';
      default:
        return 'Vardiya Asistanı';
    }
  };

  const handleLogout = () => {
    // KURAL 16: Production ortamında localStorage yasak - direkt yönlendirme
    console.log('🔒 Production logout - landing page\'e yönlendiriliyor');
    logout();
    setShowMenu(false);
    navigate('/');
  };

  const handleLogoClick = () => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    const role = (currentUser.rol || '').toLowerCase();
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'yonetici') {
      navigate('/vardiyali-nobet');
    } else {
      navigate('/personel/panel');
    }
  };

  // Kullanıcı yoksa header'ı gösterme
  if (!currentUser) {
    return null;
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 pb-4">
        <div className="flex items-start justify-between h-16 w-full">
          {/* Sol: logo */}
          <div className="flex flex-col items-start space-y-1 pt-3">
            <div className="w-full flex justify-center">
              <div className="bg-blue-600 rounded-full px-12 py-1.5 flex items-center shadow-md mt-1 cursor-pointer" 
                   style={{maxWidth: 340}} 
                   onClick={handleLogoClick}>
                <span className="text-white font-bold text-base tracking-wide" style={{fontFamily: 'Montserrat, Arial, sans-serif', letterSpacing: '0.05em'}}>
                  Altintassoft
                </span>
              </div>
            </div>
          </div>
          
          {/* Orta: kurum adı */}
          <div className="flex flex-col items-center justify-center flex-1">
            {currentUser && currentUser.rol.toLowerCase() !== 'admin' && (
              <>
                <span className="font-extrabold text-2xl md:text-3xl text-gray-800 tracking-wide uppercase text-center pt-3" style={{letterSpacing: '0.04em'}}>
                  {currentUser.kurum_adi || 'Sistem'}
                </span>
                <p className="text-gray-700 font-semibold text-sm tracking-wide mt-[-4px] mb-2">
                  {currentUser.departman_adi || 'Yönetim'}&nbsp;&nbsp;&nbsp;{currentUser.birim_adi || 'Sistem'}
                </p>
              </>
            )}
          </div>
          
          {/* Sağ: kullanıcı bilgileri ve ikonlar */}
          <div className="flex items-start justify-end gap-2 -mt-1">
            {/* İSİM + ROL + SAAT */}
            <div className="flex flex-col items-end leading-tight mt-0.5">
              {/* İsim - Güvenli gösterim */}
              <span className="text-sm font-bold text-blue-700" title={currentUser.email || 'Kullanıcı'}>
                {currentUser.name || 'Kullanıcı'}
              </span>
              
              {/* Yetki (Buton) */}
              <button
                onClick={() => {
                  const role = (currentUser.rol || '').toLowerCase();
                  if (role === 'admin') navigate('/admin');
                  else if (role === 'yonetici') navigate('/vardiyali-nobet');
                  else navigate('/personel/panel');
                }}
                className={`mt-1 text-sm font-bold px-3 py-0.5 rounded shadow-sm transition cursor-pointer focus:outline-none
                  ${(currentUser.rol.toLowerCase() === 'admin') ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                    (currentUser.rol.toLowerCase() === 'yonetici') ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                    'bg-green-100 text-green-700 hover:bg-green-200'}`}
                title="Kendi paneline git"
              >
                {(currentUser.rol.toLowerCase() === 'admin') ? 'Admin' : 
                 (currentUser.rol.toLowerCase() === 'yonetici') ? 'Yönetici' : 'Personel'}
              </button>
              
              {/* Tarih & saat */}
              <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-[4px] rounded-xl shadow text-xs font-medium mt-[2px] min-w-[180px] max-w-[240px] justify-end">
                <Clock className="w-4 h-4 text-white opacity-80" />
                <span>{currentTime?.date}</span>
                <span className="mx-1">|</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currentTime?.time}</span>
              </div>
            </div>
            
            {/* Zil ikonu */}
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-1"
            >
              <BellRing className="h-6 w-6" />
            </button>
            
            {/* Profil ikonu */}
            <div className="relative mt-1">
              <button
                type="button"
                className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowMenu((v) => !v)}
              >
                <User className="h-6 w-6" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser.name || 'Kullanıcı'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {currentUser.email || 'Email bilgisi yok'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    Güvenli Çıkış
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;