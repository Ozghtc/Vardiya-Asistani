import React from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useModals } from './hooks/useModals';
import LandingContent from './components/LandingContent';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Footer from './components/Footer';

const LandingPage: React.FC = () => {
  const { 
    showLogin,
    showRegister,
    openLogin, 
    openRegister
  } = useModals();

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
                onClick={openLogin}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Giriş Yap
              </button>
              <button
                onClick={openRegister}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Ücretsiz Başla
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <LandingContent 
        onShowLogin={openLogin}
        onShowRegister={openRegister}
      />

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLogin && <LoginModal />}

      {/* Register Modal */}
      {showRegister && <RegisterModal />}
    </div>
  );
};

export default LandingPage; 