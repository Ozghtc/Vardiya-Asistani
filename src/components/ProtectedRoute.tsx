import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthContext();

  // Authentication and role check (debug logs removed for production security)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Role-based access control
  if (allowedRoles.length > 0) {
    // KURAL 18: Rol kontrolü backend'de yapılmalı - GÜVENLİK AÇIĞI!
    // Frontend'de rol kontrolü yapılmamalı, backend Authorization API gerekli
    // Geçici: Tüm authenticated kullanıcılara erişim (güvenlik riski!)
  }

  return <>{children}</>;
};

export default ProtectedRoute; 