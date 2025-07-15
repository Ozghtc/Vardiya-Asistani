import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  let userStr = localStorage.getItem('currentUser');
  let user = userStr ? JSON.parse(userStr) : null;
  if (!user) {
    // Otomatik admin login
    user = { email: 'ozgur@gmail.com', password: '1234', role: 'admin', kurum_adi: '-', departman_adi: '-', birim_adi: '-' };
    localStorage.setItem('currentUser', JSON.stringify(user));
    userStr = JSON.stringify(user);
  }
  const role = (user?.role || '').toLowerCase();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 