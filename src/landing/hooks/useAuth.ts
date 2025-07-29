import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser, addKurum, getUsers, getKurumlar, setJWTToken } from '../../lib/api';
import { LoginData, RegisterData, User, EnrichedUser, AuthResponse } from '../types/auth.types';
import { useAuthContext } from '../../contexts/AuthContext';

// 3-Layer API Key Configuration
const API_CONFIG = {
  apiKey: import.meta.env.VITE_HZM_API_KEY,
  userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
  projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD,
  proxyURL: '/.netlify/functions/api-proxy'
};

// Bölüm 4: Authentication Logic
// 150 satır - KURAL 9 uyumlu

export const useAuth = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuthContext();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    phone: '',
    title: ''
  });

  const redirectToUserPanel = (role: string) => {
    const userRole = role.toLowerCase();
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'yonetici') {
      navigate('/admin/vardiyali-nobet');
    } else {
      navigate('/personel/panel');
    }
  };

  const enrichUserWithNames = async (user: User): Promise<EnrichedUser> => {
    console.log('🔍 Kullanıcı zenginleştiriliyor:', user);
    
    if (!user || user.rol === 'admin') {
      return {
        ...user,
        name: user.name || 'Bilinmiyor',
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
      
      if (user.kurum_id && kurumlar.length > 0) {
        const kurum = kurumlar.find((k: any) => 
          k.kurum_id === user.kurum_id || 
          k.kurum_id === String(user.kurum_id) || 
          String(k.kurum_id) === String(user.kurum_id)
        );
        
        if (kurum) {
          kurum_adi = kurum.kurum_adi || 'Bilinmiyor';
          
          // Departman bilgisi
          if (kurum.departmanlar && user.departman_id) {
            try {
              if (typeof kurum.departmanlar === 'string' && kurum.departmanlar.startsWith('[')) {
                const departmanlar = JSON.parse(kurum.departmanlar);
                const departman = departmanlar.find((d: any) => d.id === user.departman_id);
                departman_adi = departman?.departman_adi || 'Bilinmiyor';
              } else {
                departman_adi = kurum.departmanlar.split(',')[0]?.trim() || 'Bilinmiyor';
              }
            } catch (e) {
              departman_adi = 'Bilinmiyor';
            }
          }
          
          // Birim bilgisi
          if (kurum.birimler && user.birim_id) {
            try {
              if (typeof kurum.birimler === 'string' && kurum.birimler.startsWith('[')) {
                const birimler = JSON.parse(kurum.birimler);
                const birim = birimler.find((b: any) => b.id === user.birim_id);
                birim_adi = birim?.birim_adi || 'Bilinmiyor';
              } else {
                birim_adi = kurum.birimler.split(',')[0]?.trim() || 'Bilinmiyor';
              }
            } catch (e) {
              birim_adi = 'Bilinmiyor';
            }
          }
        }
      }
    } catch (error) {
      console.warn('Kurum bilgileri alınamadı:', error);
    }
    
    return {
      ...user,
      name: user.name || 'Bilinmiyor', // Kullanıcı adını temizle
      kurum_adi,
      departman_adi,
      birim_adi,
      lastActivity: new Date().toISOString(),
      loginTime: new Date().toISOString()
    };
  };

  const handleLogin = async (e: React.FormEvent): Promise<{ success: boolean; onSuccess?: () => void }> => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const { email, password } = loginData;
      
      if (!email || !password) {
        setLoginError('Email ve şifre gereklidir');
        return { success: false };
      }

      console.log('🔐 Güvenli login başlatılıyor...');
      
      // 1. ÖNCE JWT TOKEN AL (3-Layer API Key System ile)
      try {
        const response = await fetch(API_CONFIG.proxyURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: '/api/v1/auth/login',
            method: 'POST',
            body: { email, password },
            // 3-Layer Authentication
            apiKey: API_CONFIG.apiKey,
            userEmail: API_CONFIG.userEmail,
            projectPassword: API_CONFIG.projectPassword
          })
        });

        if (response.ok) {
          const authData = await response.json();
          if (authData.success && authData.data && authData.data.token) {
            // JWT Token'ı güvenli şekilde kaydet
            setJWTToken(authData.data.token);
            console.log('✅ JWT Token güvenli şekilde alındı');
          } else {
            setLoginError('Geçersiz giriş bilgileri');
            return { success: false };
          }
        } else {
          setLoginError('Sunucu hatası - Lütfen tekrar deneyin');
          return { success: false };
        }
      } catch (authError) {
        console.error('JWT Auth hatası:', authError);
        setLoginError('Kimlik doğrulama hatası');
        return { success: false };
      }
      
      // 2. ŞIMDI KULLANICILARI ÇEK (3-Layer API Key System ile)
      const users = await getUsers(33);
      
      if (!users || users.length === 0) {
        setLoginError('Sistem hatası: Kullanıcı veritabanına erişilemiyor');
        return { success: false };
      }

      // Kullanıcıyı bul
      const user = users.find((u: any) => 
        (u.email || '').toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.aktif_mi === true
      );

      if (!user) {
        setLoginError('Geçersiz email veya şifre');
        return { success: false };
      }

      // Kurum bilgilerini al
      const enrichedUser = await enrichUserWithNames(user);
      
      // AuthContext'e kullanıcı bilgilerini kaydet
      contextLogin(enrichedUser);
      
      // KURAL 16: Production ortamında localStorage yasak - direkt yönlendirme
      console.log('✅ Güvenli login başarılı:', {
        email: user.email,
        rol: user.rol,
        kurum: enrichedUser.kurum_adi
      });

      // Rol bazlı yönlendirme
      redirectToUserPanel(user.rol);
      
      return { success: true };
      
    } catch (error) {
      console.error('Login hatası:', error);
      setLoginError('Giriş yapılırken bir hata oluştu');
      return { success: false };
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent): Promise<{ success: boolean; onSuccess?: () => void }> => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    try {
      const { firstName, lastName, email, password, confirmPassword, phone, organization, title } = registerData;
      
      if (password !== confirmPassword) {
        setRegisterError('Şifreler eşleşmiyor!');
        return { success: false };
      }

      if (password.length < 4) {
        setRegisterError('Şifre en az 4 karakter olmalıdır!');
        return { success: false };
      }

      if (!firstName || !lastName || !email || !password || !phone || !organization || !title) {
        setRegisterError('Tüm alanlar doldurulmalıdır!');
        return { success: false };
      }

      console.log('📝 Kayıt başlatılıyor...');
      
      // Kurum oluştur
      const kurumResult = await addKurum({
        kurum_adi: organization,
        kurum_turu: 'Özel Sektör',
        adres: '',
        il: '',
        ilce: '',
        aktif_mi: true,
        departmanlar: JSON.stringify([
          { id: '1', departman_adi: 'Genel Müdürlük' }
        ]),
        birimler: JSON.stringify([
          { id: '1', birim_adi: 'Yönetim' }
        ])
      });

      // Rol belirleme
      let rol = 'yonetici';
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes('admin') || titleLower.includes('sistem')) {
        rol = 'admin';
      } else if (titleLower.includes('müdür') || titleLower.includes('şef')) {
        rol = 'yonetici';
      } else if (titleLower.includes('personel') || titleLower.includes('çalışan')) {
        rol = 'personel';
      }

      // Kullanıcı verisi
      const userData = {
        name: `${firstName} ${lastName}`.trim(),
        email: email.toLowerCase(),
        password: password,
        phone: phone,
        rol: rol,
        kurum_id: kurumResult.data?.row?.id || '1',
        departman_id: '1',
        birim_id: '1',
        aktif_mi: true,
        firstName: firstName,
        lastName: lastName,
        organization: organization,
        title: title,
        registration_type: 'landing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const userResult = await addUser(33, userData);

      if (userResult.success) {
        console.log('✅ Kayıt başarılı');
        
        // Kullanıcı verisini zenginleştir
        const enrichedUserData = {
          ...userData,
          id: userResult.data?.row?.id || Date.now().toString(),
          rol: rol as 'admin' | 'yonetici' | 'personel',
          name: userData.name,
          kurum_adi: organization,
          departman_adi: 'Genel Müdürlük',
          birim_adi: 'Yönetim',
          lastActivity: new Date().toISOString(),
          loginTime: new Date().toISOString()
        };
        
        // AuthContext'e kullanıcı bilgilerini kaydet
        contextLogin(enrichedUserData);
        
        // KURAL 16: Production ortamında localStorage yasak - direkt yönlendirme
        console.log('✅ Kayıt başarılı, direkt yönlendirme:', {
          email: userData.email,
          rol: rol,
          kurum: organization
        });
        
        redirectToUserPanel(rol);
        return { success: true };
      } else {
        setRegisterError(userResult.message || 'Kayıt işlemi başarısız');
        return { success: false };
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setRegisterError('Kayıt işlemi sırasında bir hata oluştu');
      return { success: false };
    } finally {
      setRegisterLoading(false);
    }
  };

  return {
    // State
    loginLoading,
    registerLoading,
    loginError,
    registerError,
    loginData,
    registerData,
    
    // Actions
    handleLogin,
    handleRegister,
    setLoginData,
    setRegisterData,
    setLoginError,
    setRegisterError,
    
    // Utils
    redirectToUserPanel,
    enrichUserWithNames
  };
}; 