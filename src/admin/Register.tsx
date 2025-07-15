import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser, getKurumlar } from '../lib/api';
import { useCapitalization } from '../hooks/useCapitalization';

interface KurumData {
  id: string;
  kurum_adi: string;
  departmanlar?: string;
  birimler?: string;
}

interface DepartmanData {
  id: string;
  departman_adi: string;
}

interface BirimData {
  id: string;
  birim_adi: string;
}

const Register: React.FC = () => {
  const [name, handleNameChange] = useCapitalization('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [rol, setRol] = useState<'admin' | 'yonetici' | 'personel'>('personel');
  const [kurum_id, setKurumId] = useState('');
  const [departman_id, setDepartmanId] = useState('');
  const [birim_id, setBirimId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [kurumlar, setKurumlar] = useState<KurumData[]>([]);
  const [departmanlar, setDepartmanlar] = useState<DepartmanData[]>([]);
  const [birimler, setBirimler] = useState<BirimData[]>([]);
  const navigate = useNavigate();

  // Kurumları yükle
  useEffect(() => {
    const loadKurumlar = async () => {
      try {
        const kurumData = await getKurumlar();
        setKurumlar(kurumData || []);
      } catch (error) {
        console.error('Kurumlar yüklenemedi:', error);
      }
    };
    loadKurumlar();
  }, []);

  // Kurum seçildiğinde departmanları yükle
  useEffect(() => {
    if (kurum_id) {
      const secilenKurum = kurumlar.find(k => k.id === kurum_id);
      if (secilenKurum?.departmanlar) {
        try {
          const departmanData = JSON.parse(secilenKurum.departmanlar);
          setDepartmanlar(departmanData || []);
        } catch (error) {
          console.error('Departman verisi parse edilemedi:', error);
          setDepartmanlar([]);
        }
      } else {
        setDepartmanlar([]);
      }
      setDepartmanId('');
      setBirimId('');
      setBirimler([]);
    }
  }, [kurum_id, kurumlar]);

  // Departman seçildiğinde birimleri yükle
  useEffect(() => {
    if (departman_id) {
      const secilenKurum = kurumlar.find(k => k.id === kurum_id);
      if (secilenKurum?.birimler) {
        try {
          const birimData = JSON.parse(secilenKurum.birimler);
          setBirimler(birimData || []);
        } catch (error) {
          console.error('Birim verisi parse edilemedi:', error);
          setBirimler([]);
        }
      } else {
        setBirimler([]);
      }
      setBirimId('');
    }
  }, [departman_id, kurumlar, kurum_id]);

  // Form validation
  const validateForm = () => {
    const safeName = name || '';
    const safeEmail = email || '';
    const safePassword = password || '';
    const safePhone = phone || '';
    
    if (!safeName.trim()) {
      setError('Ad Soyad gereklidir');
      return false;
    }
    if (!safeEmail.trim()) {
      setError('Email gereklidir');
      return false;
    }
    if (!safePassword.trim() || safePassword.length < 4) {
      setError('Şifre en az 4 karakter olmalıdır');
      return false;
    }
    if (!safePhone.trim()) {
      setError('Telefon gereklidir');
      return false;
    }
    if (rol !== 'admin' && (!kurum_id || !departman_id || !birim_id)) {
      setError('Admin olmayan kullanıcılar için kurum, departman ve birim seçimi zorunludur');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Güvenli string işleme
      const safeName = (name || '').trim();
      const safeEmail = (email || '').trim();
      const safePassword = (password || '').trim();
      const safePhone = (phone || '').trim();
      
      const userData = {
        name: safeName,
        email: safeEmail.toLowerCase(),
        password: safePassword,
        phone: safePhone,
        rol,
        kurum_id: rol === 'admin' ? undefined : kurum_id,
        departman_id: rol === 'admin' ? undefined : departman_id,
        birim_id: rol === 'admin' ? undefined : birim_id,
        aktif_mi: true,
        // Yeni field'lar
        firstName: safeName.split(' ')[0] || '', // İlk kelime ad
        lastName: safeName.split(' ').slice(1).join(' ') || '', // Geri kalanlar soyad
        organization: rol === 'admin' ? 'Sistem' : (kurumlar.find(k => k.id === kurum_id)?.kurum_adi || ''),
        title: rol === 'admin' ? 'Sistem Yöneticisi' : (rol === 'yonetici' ? 'Yönetici' : 'Personel'),
        registration_type: 'register',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: undefined
      };

      const result = await addUser(13, userData);

      if (result.success) {
        // Kullanıcı verilerini zenginleştir
        const enrichedUser = {
          ...userData,
          id: result.data?.row?.id || Date.now(),
          kurum_adi: rol === 'admin' ? 'Sistem' : (kurumlar.find(k => k.id === kurum_id)?.kurum_adi || '-'),
          departman_adi: rol === 'admin' ? 'Yönetim' : (departmanlar.find(d => d.id === departman_id)?.departman_adi || '-'),
          birim_adi: rol === 'admin' ? 'Sistem' : (birimler.find(b => b.id === birim_id)?.birim_adi || '-'),
          created_at: new Date().toISOString()
        };

        // Otomatik login - localStorage'a kaydet
        localStorage.setItem('currentUser', JSON.stringify(enrichedUser));

        // Rol bazlı yönlendirme
        if (enrichedUser.rol === 'admin') {
          navigate('/admin');
        } else if (enrichedUser.rol === 'yonetici') {
          navigate('/vardiyali-nobet');
        } else {
          navigate('/personel');
        }
      } else {
        setError(result.message || 'Kayıt işlemi başarısız');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError('Kayıt işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kayıt Ol
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vardiya Yönetim Sistemi'ne katılın
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Ad Soyad */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ad Soyad *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Ad Soyad"
                value={name}
                onChange={handleNameChange}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre (min 4 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="0555 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                Rol *
              </label>
              <select
                id="rol"
                name="rol"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={rol}
                onChange={(e) => setRol(e.target.value as 'admin' | 'yonetici' | 'personel')}
              >
                <option value="personel">Personel</option>
                <option value="yonetici">Yönetici</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Kurum seçimi (Admin değilse) */}
            {rol !== 'admin' && (
              <div>
                <label htmlFor="kurum_id" className="block text-sm font-medium text-gray-700">
                  Kurum *
                </label>
                <select
                  id="kurum_id"
                  name="kurum_id"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={kurum_id}
                  onChange={(e) => setKurumId(e.target.value)}
                >
                  <option value="">Kurum seçiniz</option>
                  {kurumlar.map((kurum) => (
                    <option key={kurum.id} value={kurum.id}>
                      {kurum.kurum_adi}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Departman seçimi (Admin değilse ve kurum seçilmişse) */}
            {rol !== 'admin' && kurum_id && (
              <div>
                <label htmlFor="departman_id" className="block text-sm font-medium text-gray-700">
                  Departman *
                </label>
                <select
                  id="departman_id"
                  name="departman_id"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={departman_id}
                  onChange={(e) => setDepartmanId(e.target.value)}
                >
                  <option value="">Departman seçiniz</option>
                  {departmanlar.map((departman) => (
                    <option key={departman.id} value={departman.id}>
                      {departman.departman_adi}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Birim seçimi (Admin değilse ve departman seçilmişse) */}
            {rol !== 'admin' && departman_id && (
              <div>
                <label htmlFor="birim_id" className="block text-sm font-medium text-gray-700">
                  Birim *
                </label>
                <select
                  id="birim_id"
                  name="birim_id"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={birim_id}
                  onChange={(e) => setBirimId(e.target.value)}
                >
                  <option value="">Birim seçiniz</option>
                  {birimler.map((birim) => (
                    <option key={birim.id} value={birim.id}>
                      {birim.birim_adi}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 