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
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userStr);
        
        // HZM API ile gerçek kullanıcı doğrulaması
        const users = await getUsers(13); // Kullanıcı tablosu ID: 13
        
        const validUser = users.find((u: any) => 
          u.email === userData.email && 
          u.password === userData.password &&
          u.aktif_mi !== false
        );

        if (validUser) {
          setUser(validUser);
        } else {
          // Geçersiz kullanıcı - LocalStorage'ı temizle
          localStorage.removeItem('currentUser');
          setAuthError('Geçersiz kullanıcı bilgileri');
        }
      } catch (error) {
        console.error('Kullanıcı doğrulama hatası:', error);
        localStorage.removeItem('currentUser');
        setAuthError('Kullanıcı doğrulama başarısız');
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
              localStorage.removeItem('currentUser');
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