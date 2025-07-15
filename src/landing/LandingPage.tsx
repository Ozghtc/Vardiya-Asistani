import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Calendar, Shield, CheckCircle, Star, ArrowRight, Mail, Lock, User, Building2, Phone } from 'lucide-react';
import { addUser, addKurum, getUsers, getKurumlar } from '../lib/api';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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

  const testimonials = [
    {
      name: "Dr. Mehmet Yılmaz",
      title: "Başhekim",
      organization: "Ankara Şehir Hastanesi",
      content: "Vardiya planlaması artık çok daha kolay. Personelimizin memnuniyeti %40 arttı.",
      rating: 5
    },
    {
      name: "Ayşe Demir",
      title: "İnsan Kaynakları Müdürü",
      organization: "İstanbul Üniversitesi Hastanesi",
      content: "Manuel planlamadan kurtulduk. Zaman tasarrufu inanılmaz.",
      rating: 5
    },
    {
      name: "Fatma Kaya",
      title: "Hemşire Başı",
      organization: "İzmir Katip Çelebi Üniversitesi",
      content: "Personel isteklerini kolayca yönetebiliyoruz. Harika bir sistem!",
      rating: 5
    }
  ];

  // HZM API'den kullanıcı doğrulaması
  const authenticateUser = async (email: string, password: string) => {
    try {
      console.log('🔴 CALLING getUsers(13)...');
      const users = await getUsers(13); // HZM kullanıcı tablosu ID: 13
      console.log('🔴 getUsers RESPONSE:', users);
      
      if (!users || users.length === 0) {
        throw new Error('Kullanıcı verisi alınamadı');
      }

      // Email ve şifre ile kullanıcı bul
      console.log('🔴 SEARCHING FOR USER:', { email, password });
      console.log('🔴 AVAILABLE USERS:', users.map((u: any) => ({ 
        email: u.email, 
        password: u.password,
        rol: u.rol,
        aktif_mi: u.aktif_mi 
      })));
      
      const user = users.find((u: any) => 
        (u.email || '').toLowerCase() === (email || '').toLowerCase() && 
        u.password === password &&
        u.aktif_mi !== false
      );

      console.log('🔴 FOUND USER:', user);
      
      if (!user) {
        console.log('🔴 USER NOT FOUND - AVAILABLE EMAILS:', users.map((u: any) => u.email));
        throw new Error('Geçersiz email veya şifre');
      }

      return user;
    } catch (error) {
      console.log('🔴 authenticateUser ERROR:', error);
      console.error('Kullanıcı doğrulama hatası:', error);
      throw error;
    }
  };

  // Kullanıcıya kurum, departman, birim adlarını ekle
  const enrichUserWithNames = async (user: any) => {
    if (!user || user.rol === 'admin') return user;
    
    let kurum_adi = '-';
    let departman_adi = '-';
    let birim_adi = '-';

    try {
      // HZM'den kurumları al
      const kurumlar = await getKurumlar();
      
      if (user.kurum_id && kurumlar.length > 0) {
        const kurum = kurumlar.find((k: any) => k.id === user.kurum_id);
        kurum_adi = kurum?.kurum_adi || '-';
        
        // Departman ve birim bilgilerini kurum verisinden al
        if (kurum?.departmanlar && user.departman_id) {
          try {
            const departmanlar = JSON.parse(kurum.departmanlar);
            const departman = departmanlar.find((d: any) => d.id === user.departman_id);
            departman_adi = departman?.departman_adi || '-';
          } catch (e) {
            console.warn('Departman verisi parse edilemedi:', e);
          }
        }
        
        if (kurum?.birimler && user.birim_id) {
          try {
            const birimler = JSON.parse(kurum.birimler);
            const birim = birimler.find((b: any) => b.id === user.birim_id);
            birim_adi = birim?.birim_adi || '-';
          } catch (e) {
            console.warn('Birim verisi parse edilemedi:', e);
          }
        }
      }
    } catch (error) {
      console.warn('Kurum bilgileri alınamadı:', error);
    }
    
    return { ...user, kurum_adi, departman_adi, birim_adi };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔴 LOGIN STARTED:', loginData);
    setLoginLoading(true);
    setLoginError('');

    try {
      console.log('🔴 CALLING authenticateUser...');
      // HZM API'den kullanıcı doğrulaması
      const user = await authenticateUser(loginData.email, loginData.password);
      console.log('🔴 authenticateUser SUCCESS:', user);
      
      // Kullanıcı bilgilerini zenginleştir
      console.log('🔴 ENRICHING USER:', user);
      const enrichedUser = await enrichUserWithNames(user);
      console.log('🔴 ENRICHED USER:', enrichedUser);
      
      // Kullanıcıyı localStorage'a kaydet (session için)
      localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
      console.log('🔴 SAVED TO LOCALSTORAGE:', enrichedUser);
      
      // Popup'u kapat
      setShowLogin(false);
      
      // Rol bazlı yönlendirme
      console.log('🔴 ROLE-BASED NAVIGATION:', enrichedUser.rol);
      if (enrichedUser.rol === 'admin') {
        console.log('🔴 NAVIGATING TO: /admin');
        navigate('/admin');
      } else if (enrichedUser.rol === 'yonetici') {
        console.log('🔴 NAVIGATING TO: /vardiyali-nobet');
        navigate('/vardiyali-nobet');
      } else {
        console.log('🔴 NAVIGATING TO: /personel');
        navigate('/personel');
      }
    } catch (err) {
      console.log('🔴 LOGIN ERROR:', err);
      setLoginError(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      console.log('🔴 LOGIN FINISHED');
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Güvenli string validasyonu - undefined/null kontrolleri
    const firstName = (registerData.firstName || '').trim();
    const lastName = (registerData.lastName || '').trim();
    const email = (registerData.email || '').trim();
    const password = (registerData.password || '').trim();
    const confirmPassword = (registerData.confirmPassword || '').trim();
    const phone = (registerData.phone || '').trim();
    const organization = (registerData.organization || '').trim();
    const title = (registerData.title || '').trim();
    
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

    setRegisterLoading(true);

    try {
      // 1. Önce kurum oluştur
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

      // 2. Rol belirleme (title'dan yola çıkarak)
      let rol = 'yonetici'; // Landing page'den gelenler genelde yönetici
      const titleLower = (title || '').toLowerCase();
      if (titleLower.includes('admin') || titleLower.includes('sistem')) {
        rol = 'admin';
      } else if (titleLower.includes('personel') || titleLower.includes('çalışan')) {
        rol = 'personel';
      }

      // 3. Kullanıcı oluştur
      const userData = {
        name: `${firstName} ${lastName}`.trim(),
        email: (email || '').toLowerCase(),
        password: password,
        phone: phone,
        rol,
        kurum_id: kurumResult.data?.row?.id || '1',
        departman_id: '1',
        birim_id: '1',
        aktif_mi: true,
        // Yeni field'lar
        firstName: firstName,
        lastName: lastName,
        organization: organization,
        title: title,
        registration_type: 'landing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: undefined
      };

      const userResult = await addUser(13, userData);

      if (userResult.success) {
              // 4. Otomatik login - kullanıcı verisini localStorage'a kaydet
      const loginUser = {
        ...userData,
        id: userResult.data?.row?.id || Date.now(),
        kurum_adi: (organization || '').trim(),
        departman_adi: 'Genel Müdürlük',
        birim_adi: 'Yönetim',
        created_at: new Date().toISOString()
      };

      try {
        localStorage.setItem('currentUser', JSON.stringify(loginUser));
        console.log('✅ LocalStorage kaydetme başarılı');
      } catch (error) {
        console.error('❌ LocalStorage kaydetme hatası:', error);
        alert('Kayıt tamamlandı ancak oturum açma sırasında hata oluştu');
      }

        // 5. Başarı mesajı ve yönlendirme
        alert('Kayıt başarılı! Sisteme giriş yapılıyor...');
        setShowRegister(false);
        
        // Rol bazlı yönlendirme
        setTimeout(() => {
          if (rol === 'admin') {
            navigate('/admin');
          } else if (rol === 'yonetici') {
            navigate('/vardiyali-nobet');
          } else {
            navigate('/personel');
          }
        }, 1000);
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
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium relative"
              >
                Ücretsiz Başla
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                  HzmSoft işbirliği ile
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Türkiye'nin En Gelişmiş
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Vardiya Yönetim </span>
              Platformu
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Hastaneler, güvenlik şirketleri, fabrikalar ve tüm mesai tabanlı işletmeler için 
              yapay zeka destekli akıllı vardiya planlama çözümü
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowRegister(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2"
              >
                Ücretsiz Dene
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300 font-semibold text-lg">
                Demo İzle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Neden VardiyaPro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern işletmelerin ihtiyaçlarına özel tasarlanmış kapsamlı özellikler
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
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

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.title}</div>
                  <div className="text-sm text-blue-600">{testimonial.organization}</div>
                </div>
              </div>
            ))}
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
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yap</h2>
              <p className="text-gray-600">Hesabınıza erişim sağlayın</p>
            </div>
            
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{loginError}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ornek@email.com"
                    required
                    disabled={loginLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    disabled={loginLoading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50"
              >
                {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Hesabınız yok mu?{' '}
                                  <button
                    onClick={() => {
                      setShowLogin(false);
                      setShowRegister(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    disabled={loginLoading}
                  >
                    Kayıt Ol
                  </button>
              </p>
            </div>
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              disabled={loginLoading}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kayıt Ol</h2>
              <p className="text-gray-600">Ücretsiz hesabınızı oluşturun</p>
            </div>
            
            {registerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{registerError}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({...registerData, firstName: e.target.value || ''})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={registerLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({...registerData, lastName: e.target.value || ''})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ornek@email.com"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kurum/Şirket
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerData.organization}
                    onChange={(e) => setRegisterData({...registerData, organization: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Şirket adı"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0555 123 45 67"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ünvan
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerData.title}
                    onChange={(e) => setRegisterData({...registerData, title: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="İnsan Kaynakları Müdürü"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value || ''})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50"
              >
                {registerLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Zaten hesabınız var mı?{' '}
                <button
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={registerLoading}
                >
                  Giriş Yap
                </button>
              </p>
            </div>
            <button
              onClick={() => setShowRegister(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              disabled={registerLoading}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 