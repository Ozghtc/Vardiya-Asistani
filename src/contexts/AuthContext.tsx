import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, EnrichedUser } from '../landing/types/auth.types';

interface AuthContextType {
  user: EnrichedUser | null;
  setUser: (user: EnrichedUser | null) => void;
  isAuthenticated: boolean;
  login: (user: EnrichedUser) => void;
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
  const [user, setUser] = useState<EnrichedUser | null>(null);

  const login = (userData: EnrichedUser) => {
    setUser(userData);
  };

  const logout = () => {
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