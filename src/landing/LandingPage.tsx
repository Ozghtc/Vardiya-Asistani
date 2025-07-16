import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Calendar, Shield, CheckCircle, Star, ArrowRight, Mail, Lock, User, Building2, Phone, Eye, EyeOff } from 'lucide-react';
import { addUser, addKurum, getUsers, getKurumlar } from '../lib/api';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    phone: '',
    title: ''
  });

  // Mevcut kullanıcıyı kontrol et
  useEffect(() => {
    const checkCurrentUser = () => {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email && user.rol) {
            // Kullanıcı zaten giriş yapmış, paneline yönlendir
            redirectToUserPanel(user.rol);
          }
        } catch (error) {
          // Bozuk veri varsa temizle
          localStorage.removeItem('currentUser');
        }
      }
    };

    checkCurrentUser();
  }, []);

  const redirectToUserPanel = (role: string) => {
    const userRole = role.toLowerCase();
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'yonetici') {
      navigate('/vardiyali-nobet');
    } else {
      navigate('/personel/panel');
    }
  };

  const features = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Akıllı Vardiya Planlama",
      description: "Yapay zeka destekli otomatik vardiya oluşturma ve optimizasyon"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Personel Yönetimi",
      description: "Kapsamlı personel takibi, izin yönetimi ve performans analizi"
    },
    {
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      title: "Esnek Takvim",
      description: "Özelleştirilebilir takvim görünümleri ve mobil erişim"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Güvenli Altyapı",
      description: "256-bit SSL şifreleme ve KVKK uyumlu veri koruma"
    }
  ];





  // Güvenli login fonksiyonu
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const { email, password } = loginData;
      
      if (!email || !password) {
        setLoginError('Email ve şifre gereklidir');
        return;
      }

      console.log('🔐 Güvenli login başlatılıyor...');
      
      // HZM API'den kullanıcıları getir
      const users = await getUsers(13);
      
      if (!users || users.length === 0) {
        setLoginError('Sistem hatası: Kullanıcı veritabanına erişilemiyor');
        return;
      }

      // Kullanıcıyı bul
      const user = users.find((u: any) => 
        (u.email || '').toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.aktif_mi !== false
      );

      if (!user) {
        setLoginError('Geçersiz email veya şifre');
        return;
      }

      // Kurum bilgilerini al
      const enrichedUser = await enrichUserWithNames(user);
      
      // Session bilgisi ekle
      const userWithSession = {
        ...enrichedUser,
        lastActivity: new Date().toISOString(),
        loginTime: new Date().toISOString()
      };

      // Güvenli storage
      localStorage.setItem('currentUser', JSON.stringify(userWithSession));
      
      console.log('✅ Güvenli login başarılı:', {
        email: user.email,
        rol: user.rol,
        kurum: enrichedUser.kurum_adi
      });

      // Başarı mesajı
      setShowLogin(false);
      
      // Rol bazlı yönlendirme
      redirectToUserPanel(user.rol);
      
    } catch (error) {
      console.error('Login hatası:', error);
      setLoginError('Giriş yapılırken bir hata oluştu');
    } finally {
      setLoginLoading(false);
    }
  };

  // Kullanıcıya kurum bilgilerini ekle
  const enrichUserWithNames = async (user: any) => {
    console.log('🔍 Kullanıcı zenginleştiriliyor:', user);
    
    if (!user || user.rol === 'admin') {
      return user;
    }
    
    let kurum_adi = 'Sistem';
    let departman_adi = 'Yönetim';
    let birim_adi = 'Sistem';

    try {
      const kurumlar = await getKurumlar();
      
      if (user.kurum_id && kurumlar.length > 0) {
        const kurum = kurumlar.find((k: any) => 
          k.id === user.kurum_id || 
          k.id === String(user.kurum_id) || 
          String(k.id) === String(user.kurum_id)
        );
        
        if (kurum) {
          kurum_adi = kurum.kurum_adi || 'Sistem';
          
          // Departman bilgisi
          if (kurum.departmanlar && user.departman_id) {
            try {
              if (typeof kurum.departmanlar === 'string' && kurum.departmanlar.startsWith('[')) {
                const departmanlar = JSON.parse(kurum.departmanlar);
                const departman = departmanlar.find((d: any) => d.id === user.departman_id);
                departman_adi = departman?.departman_adi || 'Yönetim';
              } else {
                departman_adi = kurum.departmanlar.split(',')[0]?.trim() || 'Yönetim';
              }
            } catch (e) {
              departman_adi = 'Yönetim';
            }
          }
          
          // Birim bilgisi
          if (kurum.birimler && user.birim_id) {
            try {
              if (typeof kurum.birimler === 'string' && kurum.birimler.startsWith('[')) {
                const birimler = JSON.parse(kurum.birimler);
                const birim = birimler.find((b: any) => b.id === user.birim_id);
                birim_adi = birim?.birim_adi || 'Sistem';
              } else {
                birim_adi = kurum.birimler.split(',')[0]?.trim() || 'Sistem';
              }
            } catch (e) {
              birim_adi = 'Sistem';
            }
          }
        }
      }
    } catch (error) {
      console.warn('Kurum bilgileri alınamadı:', error);
    }
    
    return { ...user, kurum_adi, departman_adi, birim_adi };
  };

  // Register fonksiyonu (mevcut kod korundu)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    try {
      const { firstName, lastName, email, password, confirmPassword, phone, organization, title } = registerData;
      
      if (password !== confirmPassword) {
        setRegisterError('Şifreler eşleşmiyor!');
        return;
      }

      if (password.length < 4) {
        setRegisterError('Şifre en az 4 karakter olmalıdır!');
        return;
      }

      if (!firstName || !lastName || !email || !password || !phone || !organization || !title) {
        setRegisterError('Tüm alanlar doldurulmalıdır!');
        return;
      }

      console.log('📝 Kayıt başlatılıyor...');
      
      // Kurum oluştur
      const kurumResult = await addKurum({
        kurum_adi: organization,
        kurum_turu: 'Özel Sektör',
        adres: '',
        il: '',
        ilce: '',
        aktif_mi: true,
        departmanlar: JSON.stringify([
          { id: '1', departman_adi: 'Genel Müdürlük' }
        ]),
        birimler: JSON.stringify([
          { id: '1', birim_adi: 'Yönetim' }
        ])
      });

      // Rol belirleme
      let rol = 'yonetici';
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes('admin') || titleLower.includes('sistem')) {
        rol = 'admin';
      } else if (titleLower.includes('müdür') || titleLower.includes('şef')) {
        rol = 'yonetici';
      } else if (titleLower.includes('personel') || titleLower.includes('çalışan')) {
        rol = 'personel';
      }

      // Kullanıcı verisi
      const userData = {
        name: `${firstName} ${lastName}`.trim(),
        email: email.toLowerCase(),
        password: password,
        phone: phone,
        rol: rol,
        kurum_id: kurumResult.data?.row?.id || '1',
        departman_id: '1',
        birim_id: '1',
        aktif_mi: true,
        firstName: firstName,
        lastName: lastName,
        organization: organization,
        title: title,
        registration_type: 'landing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const userResult = await addUser(13, userData);

      if (userResult.success) {
        console.log('✅ Kayıt başarılı');
        
        // Otomatik login
        const loginUser = {
          ...userData,
          id: userResult.data?.row?.id || Date.now(),
          kurum_adi: organization,
          departman_adi: 'Genel Müdürlük',
          birim_adi: 'Yönetim',
          lastActivity: new Date().toISOString(),
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(loginUser));
        
        setShowRegister(false);
        redirectToUserPanel(rol);
      } else {
        setRegisterError(userResult.message || 'Kayıt işlemi başarısız');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setRegisterError('Kayıt işlemi sırasında bir hata oluştu');
    } finally {
      setRegisterLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VardiyaPro</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">Akıllı Mesai Yönetimi</p>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AltıntaşSoft
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Ücretsiz Başla
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Vardiya Yönetimi
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Artık Kolay
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Yapay zeka destekli akıllı vardiya planlama sistemi ile personel yönetimini optimize edin. 
            Mobil uyumlu, bulut tabanlı ve güvenli.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRegister(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Ücretsiz Dene
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Güçlü Özellikler</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Modern teknoloji ile donatılmış, kullanıcı dostu ve güvenli vardiya yönetim sistemi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Aktif Kurum</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Personel</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Aylık Vardiya</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            30 gün ücretsiz deneme ile VardiyaPro'nun gücünü keşfedin. 
            Kredi kartı bilgisi gerektirmez.
          </p>
          <button
            onClick={() => setShowRegister(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg"
          >
            Ücretsiz Hesap Oluştur
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VardiyaPro</span>
              </div>
              <p className="text-gray-400 mb-4">
                Türkiye'nin en gelişmiş vardiya yönetim platformu
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-amber-400">AltıntaşSoft</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-400">HzmSoft İşbirliği</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ürün</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Özellikler</li>
                <li>Fiyatlandırma</li>
                <li>Demo</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Yardım Merkezi</li>
                <li>İletişim</li>
                <li>Eğitimler</li>
                <li>Durum</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Hakkımızda</li>
                <li>Blog</li>
                <li>Kariyer</li>
                <li>Gizlilik</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VardiyaPro. Tüm hakları saklıdır.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm mt-2">
              <span className="text-gray-500">Bir</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-amber-400">AltıntaşSoft</span>
              </div>
              <span className="text-gray-500">programıdır</span>
              <span className="text-gray-500">•</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-green-400">HzmSoft</span>
              </div>
              <span className="text-gray-500">işbirliği ile</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Giriş Yap</h2>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? '🔐 Giriş Yapılıyor...' : 'Güvenli Giriş'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ücretsiz Kayıt Ol
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal - Mevcut kod korundu */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ücretsiz Kayıt</h2>
              <button
                onClick={() => setShowRegister(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                  <input
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adınız"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                  <input
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Soyadınız"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şifre Tekrar</label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kuruluş Adı</label>
                <input
                  type="text"
                  value={registerData.organization}
                  onChange={(e) => setRegisterData({...registerData, organization: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Şirket/Kurum Adı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0500 000 00 00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ünvan</label>
                <input
                  type="text"
                  value={registerData.title}
                  onChange={(e) => setRegisterData({...registerData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Müdür, Şef, Personel, vb."
                  required
                />
              </div>

              {registerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{registerError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerLoading ? '📝 Kayıt Yapılıyor...' : 'Ücretsiz Kayıt Ol'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <button
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Giriş Yap
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 