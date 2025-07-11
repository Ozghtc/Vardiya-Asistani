import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Kullanıcılar localStorage'dan alınacak şekilde güncellendi
const getUsers = () => {
  const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
  return Array.isArray(localUsers) && localUsers.length > 0 ? localUsers : [
    { email: 'ozgur@gmail.com', password: '1234', role: 'admin' },
    { email: 'hatice@hotmail.com', password: '4321', role: 'personel' },
  ];
};

// Kullanıcıya kurum, departman, birim adlarını ekle
const enrichUserWithNames = async (user: any) => {
  if (!user || (user.role && user.role === 'admin')) return user;
  let kurum_adi = '-';
  let departman_adi = '-';
  let birim_adi = '-';

  if (user.kurum_id) {
    const kurumlar = JSON.parse(localStorage.getItem('admin_kurumlar') || '[]');
    const kurum = kurumlar.find((k: any) => k.id === user.kurum_id);
    kurum_adi = kurum?.kurum_adi || '-';
  }
  if (user.departman_id) {
    const departmanlar = JSON.parse(localStorage.getItem('admin_kurumlar_departmanlar') || '[]');
    const departman = departmanlar.find((d: any) => d.id === user.departman_id);
    departman_adi = departman?.departman_adi || '-';
  }
  if (user.birim_id) {
    const birimler = JSON.parse(localStorage.getItem('admin_kurumlar_birimler') || '[]');
    const birim = birimler.find((b: any) => b.id === user.birim_id);
    birim_adi = birim?.birim_adi || '-';
  }
  return { ...user, kurum_adi, departman_adi, birim_adi };
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // LocalStorage'dan kullanıcıları al
      const users = getUsers();
      
      // Kullanıcıyı bul
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Kullanıcı bilgilerini zenginleştir
        const enrichedUser = await enrichUserWithNames(user);
        
        // Kullanıcıyı localStorage'a kaydet
        localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
        
        // Rol bazlı yönlendirme
        if (enrichedUser.role === 'admin') {
          navigate('/admin');
        } else if (enrichedUser.role === 'yonetici') {
          navigate('/vardiyali-nobet');
        } else {
          navigate('/personel');
        }
      } else {
        setError('Geçersiz email veya şifre');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: string) => {
    try {
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const enrichedUser = await enrichUserWithNames({ ...user, role });
        localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
        navigate('/admin');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Giriş Yap
          </h2>
        </div>
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
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 