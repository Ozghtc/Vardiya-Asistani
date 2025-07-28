import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, EnrichedUser } from '../landing/types/auth.types';
import { getUsers, getKurumlar, clearAllCache, clearJWTToken } from '../lib/api';

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
    // Kullanıcı adını olduğu gibi kullan - artık ID temizlemeye gerek yok
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearJWTToken(); // JWT Token'ı güvenli şekilde temizle
    console.log('🚪 Kullanıcı çıkış yaptı, JWT token temizlendi');
  }, []);

  const enrichUserWithNames = useCallback(async (userData: User): Promise<EnrichedUser> => {
    if (!userData || userData.rol === 'admin') {
      return {
        ...userData,
        name: userData.name || 'Bilinmiyor',
        kurum_adi: 'Bilinmiyor',
        departman_adi: 'Bilinmiyor', 
        birim_adi: 'Bilinmiyor',
        lastActivity: new Date().toISOString(),
        loginTime: new Date().toISOString()
      };
    }
    
    let kurum_adi = 'Bilinmiyor';
    let departman_adi = 'Bilinmiyor';
    let birim_adi = 'Bilinmiyor';

    try {
      const kurumlar = await getKurumlar();
      
      if (userData.kurum_id && kurumlar.length > 0) {
        const kurum = kurumlar.find((k: any) => 
          k.kurum_id === userData.kurum_id || 
          k.kurum_id === String(userData.kurum_id) || 
          String(k.kurum_id) === String(userData.kurum_id)
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
      name: userData.name || 'Bilinmiyor', // Kullanıcı adını temizle
      kurum_adi,
      departman_adi,
      birim_adi,
      lastActivity: new Date().toISOString(),
      loginTime: new Date().toISOString()
    };
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      console.log('🔄 Kullanıcı bilgileri yenileniyor...');
      // Cache'i temizle - zorla yenileme
      clearAllCache();
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

  // Periyodik yenileme kaldırıldı - kullanıcı logout sorunu yaratıyordu

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