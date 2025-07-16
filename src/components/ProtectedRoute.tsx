import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUsers } from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const validateUser = async () => {
      try {
        // KURAL 16: Production ortamında localStorage yasak - authentication disabled
        setAuthError('Authentication system disabled in production');
        setLoading(false);
        return;
        
        // HZM API ile gerçek kullanıcı doğrulaması (production'da disabled)
        const users = await getUsers(13); // Kullanıcı tablosu ID: 13
        
        // KURAL 16: Production ortamında disabled
        const validUser = null;

        if (validUser) {
          setUser(validUser);
        } else {
          // KURAL 16: Production ortamında localStorage yasak
          setAuthError('Authentication system disabled in production');
        }
      } catch (error) {
        console.error('Kullanıcı doğrulama hatası:', error);
        setAuthError('Authentication system disabled in production');
      } finally {
        setLoading(false);
      }
    };

    validateUser();
  }, []);

  // Yüklenirken loading göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Doğrulanıyor...</span>
      </div>
    );
  }

  // Kullanıcı yoksa login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Rol kontrolü
  if (!allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Yetkiniz Yok</h2>
          <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <button
            onClick={() => {
              // KURAL 16: Production ortamında localStorage yasak - temizleme disabled
              window.location.href = '/';
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 