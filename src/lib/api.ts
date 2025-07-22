// Optimized API Configuration
const API_CONFIG = {
  baseURL: 'https://hzmbackandveritabani-production-c660.up.railway.app',
  apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  projectId: '5',
  proxyURL: '/.netlify/functions/api-proxy'
};

// In-memory cache system - 5 minutes
const inMemoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000;

export const getCachedData = (key: string) => {
  const cached = inMemoryCache.get(`cache_${key}`);
  if (cached) {
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return cached.data;
    } else {
      inMemoryCache.delete(`cache_${key}`);
    }
  }
  return null;
};

export const setCachedData = (key: string, data: any) => {
  inMemoryCache.set(`cache_${key}`, {
    data,
    timestamp: Date.now()
  });
  
  // Memory temizliği - 100'den fazla entry varsa eski olanları temizle
  if (inMemoryCache.size > 100) {
    const entries = Array.from(inMemoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // En eski 20 entry'yi sil
    for (let i = 0; i < 20 && i < entries.length; i++) {
      inMemoryCache.delete(entries[i][0]);
    }
  }
};

export const clearCachedData = (key: string) => {
  inMemoryCache.delete(`cache_${key}`);
};

// Tüm cache'i temizle
export const clearAllCache = () => {
  inMemoryCache.clear();
};

// Belirli tablo cache'ini temizle
export const clearTableCache = (tableId: string) => {
  inMemoryCache.delete(`cache_table_${tableId}`);
};

// Genel tablo işlemleri - eski sistem uyumluluğu için
export const getTableData = async (tableId: string, params?: any, forceRefresh = false) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${tableId}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    logError('getTableData hatası', error);
    return { rows: [] };
  }
};

export const addTableData = async (tableId: string, data: any) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${tableId}/rows`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    clearTableCache(tableId);
    return response;
  } catch (error) {
    logError('addTableData hatası', error);
    return { success: false, message: 'Veri eklenemedi' };
  }
};

export const updateTableData = async (tableId: string, rowId: string, data: any) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${tableId}/rows/${rowId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    clearTableCache(tableId);
    return response;
  } catch (error) {
    logError('updateTableData hatası', error);
    return { success: false, message: 'Veri güncellenemedi' };
  }
};

export const deleteTableData = async (tableId: string, rowId: string) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${tableId}/rows/${rowId}`, {
      method: 'DELETE'
    });
    clearTableCache(tableId);
    return response;
  } catch (error) {
    logError('deleteTableData hatası', error);
    return { success: false, message: 'Veri silinemedi' };
  }
};

// Kullanıcı tablosu oluşturma - eski sistem uyumluluğu
export const createUsersTable = async () => {
  try {
    const response = await apiRequest(`/api/v1/tables/project/5`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'kullanicilar_new',
        description: 'Yeni kullanıcı tablosu'
      })
    });
    return response;
  } catch (error) {
    logError('createUsersTable hatası', error);
    return { success: false, message: 'Tablo oluşturulamadı' };
  }
};

// Production logging - sadece kritik hatalar
const logError = (message: string, error?: any) => {
  console.error(`❌ ${message}`, error || '');
};

// JWT Token management
let jwtToken: string | null = null;
let tokenExpiry: number | null = null;

const getJWTToken = async (): Promise<string> => {
  if (jwtToken && tokenExpiry && Date.now() < tokenExpiry) {
    return jwtToken;
  }
  
  try {
    const response = await fetch('/.netlify/functions/api-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: {
          email: 'ozgurhzm@gmail.com',
          password: '135427'
        },
        apiKey: API_CONFIG.apiKey
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data && data.data.token) {
        jwtToken = data.data.token;
        tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 saat
        return data.data.token;
      }
    }
    
    return API_CONFIG.apiKey;
  } catch (error) {
    logError('JWT Token alma hatası', error);
    return API_CONFIG.apiKey;
  }
};

// API Request with timeout
const apiRequest = async (path: string, options: RequestInit = {}) => {
  try {
    const token = await getJWTToken();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          method: options.method || 'GET',
          body: options.body ? JSON.parse(options.body as string) : undefined,
          jwtToken: token,
          apiKey: API_CONFIG.apiKey,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }
      
      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - API yanıt vermiyor');
      }
      throw fetchError;
    }
  } catch (error) {
    logError('API Request Error', error);
    throw error;
  }
};

// ================================
// KURUM YÖNETİMİ FONKSİYONLARI
// ================================

// Kurumları getir - HİYERARŞİK TABLO (ID: 30)
export const getKurumlar = async (forceRefresh: boolean = false) => {
  try {
    const cacheKey = 'kurumlar_hiyerarsik';
    
    // 🚨 ZORLA CACHE TEMİZLE
    if (forceRefresh) {
      clearCachedData(cacheKey);
      clearTableCache('30');
      clearAllCache();
      console.log('🧹 CACHE TEMİZLENDİ - FRESH DATA ÇEKILIYOR');
    }
    
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log('📦 CACHE\'DEN VERİ GELDİ:', cachedData);
        return cachedData;
      }
    }
    
    const response = await apiRequest(`/api/v1/data/table/30?page=1&limit=100&sort=id&order=DESC`);
    let data = response.data?.rows || [];
    
    // DEPARTMAN ve BIRIM verilerini eşle
    data = data.map((kurum: any) => ({
      ...kurum,
      departman_id: kurum.DEPARTMAN_ID || '',
      departmanlar: kurum.DEPARTMAN_ADI || '',
      birim_id: kurum.BIRIM_ID || '',
      birimler: kurum.BIRIM || '' // BIRIM_ADI değil, BIRIM kullanılmalı
    }));
    
    console.log('🔍 getKurumlar - Raw data count:', response.data?.rows?.length);
    console.log('🔍 getKurumlar - Raw data:', response.data?.rows);
    console.log('🔍 getKurumlar - Processed data count:', data.length);
    console.log('🔍 getKurumlar - Processed data:', data);
    
    setCachedData(cacheKey, data);
    console.log('💾 VERİ CACHE\'E KAYDEDİLDİ');
    
    return data;
  } catch (error) {
    logError('getKurumlar hatası', error);
    return [];
  }
};

// Kurum ekle - 3 TABLOYA KAYIT YAP (HİYERARŞİK + DEPARTMANLAR + BİRİMLER)
export const addKurum = async (kurumData: {
  kurum_adi: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
  telefon?: string;
  email?: string;
  departmanlar?: string;
  birimler?: string;
}) => {
  try {
    // 🔄 CACHE TEMİZLE VE GÜNCEL VERİLERİ AL
    clearCachedData('kurumlar_hiyerarsik');
    clearTableCache('30');
    
    // Direkt API'den güncel verileri al
    const kurumlarResponse = await apiRequest(`/api/v1/data/table/30`, {
      method: 'GET'
    });
    
    const existingKurumlar = kurumlarResponse.data?.rows || [];
    let maxKurumId = 0;
    
    existingKurumlar.forEach((kurum: any) => {
      const kurumId = parseInt(kurum.kurum_id || '0');
      if (kurumId > maxKurumId) {
        maxKurumId = kurumId;
      }
    });
    
    const newKurumId = String(maxKurumId + 1).padStart(2, '0');
    
    // Debug: Hangi ID üretildiğini logla
    console.log(`🆔 Yeni Kurum ID: ${newKurumId} (Max ID: ${maxKurumId})`);
    
    const departmanlar = kurumData.departmanlar || '';
    const birimler = kurumData.birimler || '';
    
    const departmanIdList = departmanlar.split(',')
      .filter(d => d.trim())
      .map((_, index) => `${newKurumId}_D${index + 1}`)
      .join(',');
    
    const birimIdList = birimler.split(',')
      .filter(b => b.trim())
      .map((_, index) => `${newKurumId}_B${index + 1}`)
      .join(',');
    
    // 1️⃣ ANA KURUM TABLOSUNA KAYDET (ID: 30)
    const requestBody = {
      kurum_id: newKurumId,
      kurum_adi: kurumData.kurum_adi,
      adres: kurumData.adres || '',
      telefon: kurumData.telefon || '',
      email: kurumData.email || '',
      DEPARTMAN_ID: departmanIdList,
      DEPARTMAN_ADI: departmanlar,
      BIRIM_ID: birimIdList,
      BIRIM: birimler
    };
    
    const response = await apiRequest(`/api/v1/data/table/30/rows`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    // 2️⃣ DEPARTMANLARI AYRI TABLOYA KAYDET (ID: 34)
    if (departmanlar.trim()) {
      const departmanList = departmanlar.split(',').filter(d => d.trim());
      
      for (let i = 0; i < departmanList.length; i++) {
        const departmanAdi = departmanList[i].trim();
        const departmanId = `${newKurumId}_D${i + 1}`;
        
        try {
          await apiRequest(`/api/v1/data/table/34/rows`, {
            method: 'POST',
            body: JSON.stringify({
              departman_id: departmanId,
              departman_adi: departmanAdi,
              kurum_id: newKurumId,
              aktif_mi: true
            }),
          });
        } catch (error) {
          console.warn(`Departman kaydedilemedi: ${departmanAdi}`, error);
        }
      }
    }
    
    // 3️⃣ BİRİMLERİ AYRI TABLOYA KAYDET (ID: 35) - DOĞRUDAN KURUMA BAĞLI
    if (birimler.trim()) {
      const birimList = birimler.split(',').filter(b => b.trim());
      
      for (let i = 0; i < birimList.length; i++) {
        const birimAdi = birimList[i].trim();
        const birimId = `${newKurumId}_B${i + 1}`;
        
        try {
          await apiRequest(`/api/v1/data/table/35/rows`, {
            method: 'POST',
            body: JSON.stringify({
              birim_id: birimId,
              birim_adi: birimAdi,
              kurum_id: newKurumId, // Birimler doğrudan kuruma bağlı
              aktif_mi: true
            }),
          });
        } catch (error) {
          console.warn(`Birim kaydedilemedi: ${birimAdi}`, error);
        }
      }
    }
    
    // Cache'leri temizle
    clearCachedData('kurumlar_hiyerarsik');
    clearTableCache('34'); // departmanlar
    clearTableCache('35'); // birimler
    
    return {
      success: true,
      data: response.data || response,
      message: 'Kurum ve bağlı departman/birimler başarıyla eklendi',
      newKurumId: newKurumId
    };
  } catch (error) {
    logError('addKurum hatası', error);
    return {
      success: false,
      message: 'Kurum eklenirken hata oluştu: ' + (error as any).message,
      error: true
    };
  }
};

// Kurum güncelle - HİYERARŞİK TABLO (ID: 30)
export const updateKurum = async (kurumId: string, kurumData: {
  kurum_adi?: string;
  adres?: string;
  telefon?: string;
  email?: string;
}) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/30/rows/${kurumId}`, {
      method: 'PUT',
      body: JSON.stringify(kurumData),
    });
    
    clearCachedData('kurumlar_hiyerarsik');
    
    return { success: true, data: response };
  } catch (error) {
    logError('updateKurum hatası', error);
    return {
      success: false,
      message: 'Kurum güncellenirken hata oluştu: ' + (error as any).message,
      error: true
    };
  }
};

// Kurum sil - HİYERARŞİK TABLO (ID: 30)
export const deleteKurum = async (kurumId: string) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/30/rows/${kurumId}`, {
      method: 'DELETE',
    });
    
    clearCachedData('kurumlar_hiyerarsik');
    
    return { success: true, data: response };
  } catch (error) {
    logError('deleteKurum hatası', error);
    return {
      success: false,
      message: 'Kurum silinirken hata oluştu: ' + (error as any).message,
      error: true
    };
  }
};

// ================================
// KULLANICI YÖNETİMİ FONKSİYONLARI
// ================================

// Kullanıcıları getir - KULLANICILAR TABLOSU (ID: 33)
export const getUsers = async (usersTableId: number) => {
  try {
    const token = await getJWTToken();
    
    const response = await fetch('/.netlify/functions/api-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: `/api/v1/data/table/${usersTableId}?page=1&limit=100&sort=id&order=DESC`,
        method: 'GET',
        jwtToken: token,
        apiKey: API_CONFIG.apiKey
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    let users = data.data?.rows || [];
    
    // Kurum adlarını ekle
    try {
      const kurumlar = await getKurumlar(true);
      users = users.map((user: any) => {
        if (user.kurum_id) {
          const kurum = kurumlar.find((k: any) => k.id === user.kurum_id);
          if (kurum) {
            return {
              ...user,
              kurum_adi: kurum.kurum_adi
            };
          }
        }
        return {
          ...user,
          kurum_adi: null
        };
      });
    } catch (error) {
      console.error('Kurum adları eklenirken hata:', error);
    }
    
    return users;
  } catch (error) {
    logError('getUsers hatası', error);
    return [];
  }
};

// Kullanıcı ekle - KULLANICILAR TABLOSU (ID: 33)
export const addUser = async (usersTableId: number, userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  rol: string;
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
  aktif_mi?: boolean;
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  registration_type?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}) => {
  try {
    if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.rol) {
      throw new Error('Gerekli alanlar eksik');
    }
    
    const requestBody = {
      name: userData.name,
      email: (userData.email || '').trim().toLowerCase(),
      password: (userData.password || '').trim(),
      phone: (userData.phone || '').trim(),
      rol: (userData.rol || '').trim(),
      kurum_id: (userData.kurum_id || '').trim() || null,
      departman_id: (userData.departman_id || '').trim() || null,
      birim_id: (userData.birim_id || '').trim() || null,
      aktif_mi: userData.aktif_mi !== false,
      firstName: (userData.firstName || '').trim(),
      lastName: (userData.lastName || '').trim(),
      organization: (userData.organization || '').trim(),
      title: (userData.title || '').trim(),
      registration_type: userData.registration_type || 'manual',
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString(),
      last_login: userData.last_login || undefined
    };
    
    const token = await getJWTToken();
    
    const response = await fetch('/.netlify/functions/api-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: `/api/v1/data/table/${usersTableId}/rows`,
        method: 'POST',
        body: requestBody,
        jwtToken: token,
        apiKey: API_CONFIG.apiKey
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.message || 'API hatası');
    }
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Kullanıcı başarıyla eklendi'
    };
  } catch (error) {
    logError('addUser hatası', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Kullanıcı eklenemedi',
      error: error
    };
  }
};

// Kullanıcı güncelle - KULLANICILAR TABLOSU (ID: 33)
export const updateUser = async (usersTableId: number, userId: string, userData: {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  rol?: string;
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
  aktif_mi?: boolean;
}) => {
  try {
    const token = await getJWTToken();
    
    const response = await fetch('/.netlify/functions/api-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: `/api/v1/data/table/${usersTableId}/rows/${userId}`,
        method: 'PUT',
        body: userData,
        jwtToken: token,
        apiKey: API_CONFIG.apiKey
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    logError('updateUser hatası', error);
    return {
      success: false,
      message: 'Kullanıcı güncellenemedi: ' + (error as any).message
    };
  }
};

// Kullanıcı sil - KULLANICILAR TABLOSU (ID: 33)
export const deleteUser = async (usersTableId: number, userId: string) => {
  try {
    const token = await getJWTToken();
    
    const response = await fetch('/.netlify/functions/api-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: `/api/v1/data/table/${usersTableId}/rows/${userId}`,
        method: 'DELETE',
        jwtToken: token,
        apiKey: API_CONFIG.apiKey
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    logError('deleteUser hatası', error);
    return {
      success: false,
      message: 'Kullanıcı silinemedi: ' + (error as any).message
    };
  }
};

// ================================
// DEPARTMAN YÖNETİMİ FONKSİYONLARI
// ================================

// Departmanları getir - DEPARTMANLAR TABLOSU (ID: 34)
export const getDepartmanlar = async (forceRefresh = false) => {
  const cacheKey = 'departmanlar';
  
  if (!forceRefresh) {
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return cachedData;
  }

  try {
    const data = await apiRequest(`/api/v1/data/table/34`);
    setCachedData(cacheKey, data.rows || []);
    return data.rows || [];
  } catch (error: any) {
    logError('getDepartmanlar hatası', error);
    return [];
  }
};

// Departman ekle - DEPARTMANLAR TABLOSU (ID: 34)
export const addDepartman = async (departmanData: {
  departman_id: string;
  departman_adi: string;
  kurum_id: string;
  aktif_mi?: boolean;
}) => {
  try {
    const requestBody = {
      departman_id: departmanData.departman_id,
      departman_adi: departmanData.departman_adi,
      kurum_id: departmanData.kurum_id,
      aktif_mi: departmanData.aktif_mi !== false
    };

    const response = await apiRequest(`/api/v1/data/table/34/rows`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    clearCachedData('departmanlar');
    
    return {
      success: true,
      data: response.data || response,
      message: 'Departman başarıyla eklendi'
    };
  } catch (error) {
    logError('addDepartman hatası', error);
    return {
      success: false,
      message: 'Departman eklenirken hata oluştu: ' + (error as any).message
    };
  }
};

// Departman güncelle - DEPARTMANLAR TABLOSU (ID: 34)
export const updateDepartman = async (departmanId: string, departmanData: any) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/34/rows/${departmanId}`, {
      method: 'PUT',
      body: JSON.stringify(departmanData),
    });

    clearCachedData('departmanlar');
    
    return {
      success: true,
      data: response.data || response,
      message: 'Departman başarıyla güncellendi'
    };
  } catch (error) {
    logError('updateDepartman hatası', error);
    return {
      success: false,
      message: 'Departman güncellenirken hata oluştu: ' + (error as any).message
    };
  }
};

// Departman sil - DEPARTMANLAR TABLOSU (ID: 34)
export const deleteDepartman = async (departmanId: string) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/34/rows/${departmanId}`, {
      method: 'DELETE',
    });

    clearCachedData('departmanlar');
    
    return {
      success: true,
      data: response.data || response,
      message: 'Departman başarıyla silindi'
    };
  } catch (error) {
    logError('deleteDepartman hatası', error);
    return {
      success: false,
      message: 'Departman silinirken hata oluştu: ' + (error as any).message
    };
  }
};

// ================================
// BİRİM YÖNETİMİ FONKSİYONLARI
// ================================

// Birimleri getir - BİRİMLER TABLOSU (ID: 35)
export const getBirimler = async (forceRefresh = false) => {
  const cacheKey = 'birimler';
  
  if (!forceRefresh) {
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return cachedData;
  }

  try {
    const data = await apiRequest(`/api/v1/data/table/35`);
    setCachedData(cacheKey, data.rows || []);
    return data.rows || [];
  } catch (error: any) {
    logError('getBirimler hatası', error);
    return [];
  }
};

// Birim ekle - BİRİMLER TABLOSU (ID: 35)
export const addBirim = async (birimData: {
  birim_id: string;
  birim_adi: string;
  kurum_id: string;
  aktif_mi?: boolean;
}) => {
  try {
    const requestBody = {
      birim_id: birimData.birim_id,
      birim_adi: birimData.birim_adi,
      kurum_id: birimData.kurum_id,
      aktif_mi: birimData.aktif_mi !== false
    };

    const response = await apiRequest(`/api/v1/data/table/35/rows`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    clearCachedData('birimler');
    
    return {
      success: true,
      data: response.data || response,
      message: 'Birim başarıyla eklendi'
    };
  } catch (error) {
    logError('addBirim hatası', error);
    return {
      success: false,
      message: 'Birim eklenirken hata oluştu: ' + (error as any).message
    };
  }
};

// Birim güncelle - BİRİMLER TABLOSU (ID: 35)
export const updateBirim = async (birimId: string, birimData: any) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/35/rows/${birimId}`, {
      method: 'PUT',
      body: JSON.stringify(birimData),
    });

    clearCachedData('birimler');
    
    return {
      success: true,
      data: response.data || response,
      message: 'Birim başarıyla güncellendi'
    };
  } catch (error) {
    logError('updateBirim hatası', error);
    return {
      success: false,
      message: 'Birim güncellenirken hata oluştu: ' + (error as any).message
    };
  }
};

// Birim sil - BİRİMLER TABLOSU (ID: 35)
export const deleteBirim = async (birimId: string) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/35/rows/${birimId}`, {
      method: 'DELETE',
    });

    clearCachedData('birimler');
    
    return {
      success: true,
      data: response.data || response,
      message: 'Birim başarıyla silindi'
    };
  } catch (error) {
    logError('deleteBirim hatası', error);
    return {
      success: false,
      message: 'Birim silinirken hata oluştu: ' + (error as any).message
    };
  }
};

// ================================
// VERİ AKTARIMI FONKSİYONLARI
// ================================

// Kurumlar tablosundaki departman verilerini departmanlar tablosuna aktar
export const aktarDepartmanVerileri = async () => {
  try {
    const kurumlar = await getKurumlar(true);
    let aktarilanSayisi = 0;

    for (const kurum of kurumlar) {
      if (kurum.departman_id && kurum.departmanlar) {
        const departmanIds = kurum.departman_id.split(',').filter((id: string) => id.trim());
        const departmanAdlari = kurum.departmanlar.split(',').filter((ad: string) => ad.trim());

        for (let i = 0; i < departmanIds.length; i++) {
          const departmanId = departmanIds[i]?.trim();
          const departmanAdi = departmanAdlari[i]?.trim();

          if (departmanId && departmanAdi) {
            await addDepartman({
              departman_id: departmanId,
              departman_adi: departmanAdi,
              kurum_id: kurum.kurum_id,
              aktif_mi: true
            });
            aktarilanSayisi++;
          }
        }
      }
    }

    return {
      success: true,
      message: `${aktarilanSayisi} departman başarıyla aktarıldı`
    };
  } catch (error) {
    logError('aktarDepartmanVerileri hatası', error);
    return {
      success: false,
      message: 'Departman verileri aktarılırken hata oluştu: ' + (error as any).message
    };
  }
};

// Kurumlar tablosundaki birim verilerini birimler tablosuna aktar
export const aktarBirimVerileri = async () => {
  try {
    const kurumlar = await getKurumlar(true);
    let aktarilanSayisi = 0;

    for (const kurum of kurumlar) {
      if (kurum.birim_id && kurum.birimler) {
        const birimIds = kurum.birim_id.split(',').filter((id: string) => id.trim());
        const birimAdlari = kurum.birimler.split(',').filter((ad: string) => ad.trim());

        for (let i = 0; i < birimIds.length; i++) {
          const birimId = birimIds[i]?.trim();
          const birimAdi = birimAdlari[i]?.trim();

          if (birimId && birimAdi) {
            await addBirim({
              birim_id: birimId,
              birim_adi: birimAdi,
              kurum_id: kurum.kurum_id,
              aktif_mi: true
            });
            aktarilanSayisi++;
          }
        }
      }
    }

    return {
      success: true,
      message: `${aktarilanSayisi} birim başarıyla aktarıldı`
    };
  } catch (error) {
    logError('aktarBirimVerileri hatası', error);
    return {
      success: false,
      message: 'Birim verileri aktarılırken hata oluştu: ' + (error as any).message
    };
  }
};

export { apiRequest };
export default API_CONFIG; 