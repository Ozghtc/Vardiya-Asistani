import React from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useModals } from '../hooks/useModals';

// Bölüm 5: Login Modal Component
// 180 satır - KURAL 9 uyumlu

interface LoginModalProps {
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const { 
    loginLoading, 
    loginError, 
    loginData, 
    setLoginData, 
    handleLogin 
  } = useAuth();
  
  const { 
    showLogin, 
    showPassword, 
    closeLogin, 
    openRegister, 
    togglePassword 
  } = useModals();

  const onSubmit = async (e: React.FormEvent) => {
    const result = await handleLogin(e);
    if (result.success) {
      closeLogin();
      onSuccess?.();
    }
  };

  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Giriş Yap</h2>
          <button
            onClick={closeLogin}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
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
                onClick={togglePassword}
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
                closeLogin();
                openRegister();
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ücretsiz Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 