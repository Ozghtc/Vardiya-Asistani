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
    const userRole = user.rol;
    
    // Check if user has required role
    if (!userRole || !allowedRoles.includes(userRole)) {
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