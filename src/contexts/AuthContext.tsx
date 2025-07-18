import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, EnrichedUser } from '../landing/types/auth.types';
import { getUsers, getKurumlar } from '../lib/api';

interface AuthContextType {
  user: EnrichedUser | null;
  setUser: (user: EnrichedUser | null) => void;
  isAuthenticated: boolean;
  login: (user: EnrichedUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

  const login = useCallback((userData: EnrichedUser) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const enrichUserWithNames = useCallback(async (userData: User): Promise<EnrichedUser> => {
    if (!userData || userData.rol === 'admin') {
      return {
        ...userData,
        kurum_adi: 'Sistem',
        departman_adi: 'Yönetim',
        birim_adi: 'Sistem',
        lastActivity: new Date().toISOString(),
        loginTime: new Date().toISOString()
      };
    }
    
    let kurum_adi = 'Sistem';
    let departman_adi = 'Yönetim';
    let birim_adi = 'Sistem';

    try {
      const kurumlar = await getKurumlar();
      
      if (userData.kurum_id && kurumlar.length > 0) {
        const kurum = kurumlar.find((k: any) => 
          k.id === userData.kurum_id || 
          k.id === String(userData.kurum_id) || 
          String(k.id) === String(userData.kurum_id)
        );
        
        if (kurum) {
          kurum_adi = kurum.kurum_adi || 'Sistem';
          
          // Departman bilgisi
          if (kurum.departmanlar && userData.departman_id) {
            try {
              if (typeof kurum.departmanlar === 'string' && kurum.departmanlar.startsWith('[')) {
                const departmanlar = JSON.parse(kurum.departmanlar);
                const departman = departmanlar.find((d: any) => d.id === userData.departman_id);
                departman_adi = departman?.departman_adi || 'Yönetim';
              } else {
                departman_adi = kurum.departmanlar.split(',')[0]?.trim() || 'Yönetim';
              }
            } catch (e) {
              departman_adi = 'Yönetim';
            }
          }
          
          // Birim bilgisi
          if (kurum.birimler && userData.birim_id) {
            try {
              if (typeof kurum.birimler === 'string' && kurum.birimler.startsWith('[')) {
                const birimler = JSON.parse(kurum.birimler);
                const birim = birimler.find((b: any) => b.id === userData.birim_id);
                birim_adi = birim?.birim_adi || 'Sistem';
              } else {
                birim_adi = kurum.birimler.split(',')[0]?.trim() || 'Sistem';
              }
            } catch (e) {
              birim_adi = 'Sistem';
            }
          }
        }
      }
    } catch (error) {
      console.error('Kurum bilgileri alınırken hata:', error);
    }

    return {
      ...userData,
      kurum_adi,
      departman_adi,
      birim_adi,
      lastActivity: new Date().toISOString(),
      loginTime: user?.loginTime || new Date().toISOString()
    };
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      console.log('🔄 Kullanıcı bilgileri yenileniyor...');
      const users = await getUsers(13); // Kullanıcılar tablosu ID'si
      const currentUser = users.find((u: any) => u.id === user.id);
      
      if (currentUser) {
        const enrichedUser = await enrichUserWithNames(currentUser);
        setUser(enrichedUser);
        console.log('✅ Kullanıcı bilgileri güncellendi:', enrichedUser);
      } else {
        console.warn('⚠️ Kullanıcı bulunamadı, oturum sonlandırılıyor');
        logout();
      }
    } catch (error) {
      console.error('❌ Kullanıcı bilgileri yenilenirken hata:', error);
    }
  }, [user, enrichUserWithNames, logout]);

  // Kullanıcı bilgilerini periyodik olarak yenile (5 dakikada bir)
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshUser();
      }, 5 * 60 * 1000); // 5 dakika
      return () => clearInterval(interval);
    }
  }, [user, refreshUser]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 