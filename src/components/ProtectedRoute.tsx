import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthContext();

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Rol kontrolü yapılacaksa
  if (allowedRoles.length > 0) {
    const userRole = user.rol;
    
    // Kullanıcının rolü yoksa veya izin verilen roller arasında değilse
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Admin değilse ana sayfaya yönlendir
      if (userRole !== 'admin') {
        return <Navigate to="/admin" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 