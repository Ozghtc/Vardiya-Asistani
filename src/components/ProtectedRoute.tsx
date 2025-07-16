import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AuthContext'den kullanıcı bilgilerini al
    console.log('🔐 ProtectedRoute: Kullanıcı kontrol ediliyor:', { user, isAuthenticated });
    setLoading(false);
  }, [user, isAuthenticated]);

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
  if (!isAuthenticated || !user) {
    console.log('🔐 ProtectedRoute: Kullanıcı yok, login sayfasına yönlendiriliyor');
    return <Navigate to="/" replace />;
  }

  // Rol kontrolü
  if (!allowedRoles.includes(user.rol)) {
    console.log('🔐 ProtectedRoute: Yetkisiz erişim, admin sayfasına yönlendiriliyor');
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

  console.log('🔐 ProtectedRoute: Erişim izni verildi');
  return <>{children}</>;
};

export default ProtectedRoute; 