import React from 'react';
import { useAuth } from '../hooks/useAuth';

// Bölüm 6: Register Modal Component
// 200 satır - KURAL 9 uyumlu

interface RegisterModalProps {
  showRegister: boolean;
  closeRegister: () => void;
  openLogin: () => void;
  onSuccess?: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  showRegister, 
  closeRegister, 
  openLogin,
  onSuccess 
}) => {
  const { 
    registerLoading, 
    registerError, 
    registerData, 
    setRegisterData, 
    handleRegister 
  } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    const result = await handleRegister(e);
    if (result.success) {
      closeRegister();
      onSuccess?.();
    }
  };

  if (!showRegister) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ücretsiz Kayıt</h2>
          <button
            onClick={closeRegister}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
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
                closeRegister();
                openLogin();
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 