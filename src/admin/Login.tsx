import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUsers, getKurumlar } from '../lib/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Register'dan gelen mesaj ve email'i kontrol et
  useEffect(() => {
    if (location.state) {
      const { message, email: registeredEmail } = location.state as { message?: string; email?: string };
      if (message) {
        setSuccessMessage(message);
        // Mesajı 5 saniye sonra temizle
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      if (registeredEmail) {
        setEmail(registeredEmail);
      }
    }
  }, [location.state]);

  // HZM API'den kullanıcı doğrulaması
  const authenticateUser = async (email: string, password: string) => {
    try {
      const users = await getUsers(13); // HZM kullanıcı tablosu ID: 13
      
      if (!users || users.length === 0) {
        throw new Error('Kullanıcı verisi alınamadı');
      }

      // Email ve şifre ile kullanıcı bul
      const user = users.find((u: any) => 
        u.email?.toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.aktif_mi !== false
      );

      if (!user) {
        throw new Error('Geçersiz email veya şifre');
      }

      return user;
    } catch (error) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // HZM API'den kullanıcı doğrulaması
      const user = await authenticateUser(email, password);
      
      // Kullanıcı bilgilerini zenginleştir
      const enrichedUser = await enrichUserWithNames(user);
      
      // Kullanıcıyı localStorage'a kaydet (session için)
      localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
      
      // Rol bazlı yönlendirme
      if (enrichedUser.rol === 'admin') {
        navigate('/admin');
      } else if (enrichedUser.rol === 'yonetici') {
        navigate('/vardiyali-nobet');
      } else {
        navigate('/personel');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vardiya Yönetim Sistemi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınızla giriş yapın
          </p>
        </div>

        {successMessage && (
          <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email adresi</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 