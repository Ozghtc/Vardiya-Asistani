import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../landing/types/auth.types';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    console.log('🔐 AuthContext: Kullanıcı giriş yaptı:', userData);
    setUser(userData);
  };

  const logout = () => {
    console.log('🔐 AuthContext: Kullanıcı çıkış yaptı');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 