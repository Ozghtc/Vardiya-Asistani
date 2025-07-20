import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthContext();

  // Debug: Kullanıcı bilgilerini kontrol et
  console.log('🔍 ProtectedRoute Debug:', {
    isAuthenticated,
    user: user ? { id: user.id, name: user.name, rol: user.rol } : null,
    allowedRoles,
    currentPath: window.location.pathname
  });

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated || !user) {
    console.log('❌ Kullanıcı giriş yapmamış, ana sayfaya yönlendiriliyor');
    return <Navigate to="/" replace />;
  }

  // Rol kontrolü yapılacaksa
  if (allowedRoles.length > 0) {
    const userRole = user.rol;
    
    console.log('🔍 Rol Kontrolü:', {
      userRole,
      allowedRoles,
      includes: allowedRoles.includes(userRole),
      userRoleType: typeof userRole,
      allowedRolesTypes: allowedRoles.map(r => typeof r)
    });
    
    // Kullanıcının rolü yoksa veya izin verilen roller arasında değilse
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log('❌ Rol uyumsuzluğu, yönlendirme yapılıyor');
      // Admin değilse kendi bölümüne yönlendir
      if (userRole === 'yonetici') {
        return <Navigate to="/admin/vardiyali-nobet" replace />;
      } else if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/admin/vardiyali-nobet" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 