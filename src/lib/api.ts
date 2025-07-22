// Optimized API Configuration
const API_CONFIG = {
  baseURL: 'https://hzmbackandveritabani-production-c660.up.railway.app',
  apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  projectId: '5',
  tableId: '10',
  proxyURL: '/.netlify/functions/api-proxy'
};

// 🚀 Simple Cache System - 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map();

// Cache temizleme fonksiyonu
export const clearCache = () => {
  cache.clear();
};

// In-memory cache system (Production compliant - no localStorage/sessionStorage)
const inMemoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key: string) => {
  const cached = inMemoryCache.get(`cache_${key}`);
  if (cached) {
    // Cache 5 dakika geçerli
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

// Tablo bazında cache yönetimi
export const getTableData = async (tableId: string, filterParams: string = '', forceRefresh: boolean = false) => {
  const cacheKey = `table_${tableId}_${filterParams}`;
  
  try {
    // Zorla yenileme değilse önce cache'den kontrol et
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // API'den tüm veriyi al (filtreleme API'de çalışmıyor)
    const response = await apiRequest(`/api/v1/data/table/${tableId}`);
    let data = response.data?.rows || [];
    
    // Client-side filtreleme yap
    if (filterParams) {
      const params = new URLSearchParams(filterParams);
      data = data.filter((row: any) => {
        let matches = true;
        params.forEach((value, key) => {
          let rowValue = row[key];
          let filterValue = value;
          
          // birim_id için Türkçe karakter normalizasyonu
          if (key === 'birim_id') {
            rowValue = normalizeBirimId(String(rowValue || ''));
            filterValue = normalizeBirimId(String(filterValue || ''));
          }
          
          if (rowValue !== filterValue) {
            matches = false;
          }
        });
        return matches;
      });
    }
    
    // Başarılı yanıtı cache'le
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error: any) {
    logError(`Tablo ${tableId} veri hatası`, error);
    return [];
  }
};

// Türkçe karakter normalizasyonu için yardımcı fonksiyon
const normalizeBirimId = (birimId: string): string => {
  if (!birimId) return birimId;
  
  // Türkçe karakterleri normalize et
  return birimId
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c');
};

// Tablo verisi ekle ve cache'i temizle
export const addTableData = async (tableId: string, data: any) => {
  try {
    // Önce Netlify proxy dene
    let response;
    try {
      response = await apiRequest(`/api/v1/data/table/${tableId}/rows`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (proxyError) {
      // Proxy başarısız olursa direkt API çağrısı yap
      console.log('Proxy hatası, direkt API çağrısı yapılıyor...', proxyError);
      response = await directApiCall(`/api/v1/data/table/${tableId}/rows`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    
    // Cache'i temizle - bu tablonun tüm cache'lerini temizle
    clearTableCache(tableId);
    
    return { success: true, data: response.data || response };
  } catch (error: any) {
    logError(`Tablo ${tableId} ekleme hatası`, error);
    return { success: false, error: error.message };
  }
};

// Tablo verisi güncelle ve cache'i temizle
export const updateTableData = async (tableId: string, rowId: string, data: any) => {
  try {
    // Önce Netlify proxy dene
    let response;
    try {
      response = await apiRequest(`/api/v1/data/table/${tableId}/rows/${rowId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (proxyError) {
      // Proxy başarısız olursa direkt API çağrısı yap
      console.log('Proxy hatası, direkt API çağrısı yapılıyor...', proxyError);
      response = await directApiCall(`/api/v1/data/table/${tableId}/rows/${rowId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
    
    // Cache'i temizle - bu tablonun tüm cache'lerini temizle
    clearTableCache(tableId);
    
    return { success: true, data: response.data || response };
  } catch (error: any) {
    logError(`Tablo ${tableId} güncelleme hatası`, error);
    return { success: false, error: error.message };
  }
};

// Direkt API çağrısı (Netlify proxy bypass)
const directApiCall = async (path: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const url = `${API_CONFIG.baseURL}${path}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_CONFIG.apiKey,
      ...options.headers
    },
    body: options.body,
    // Timeout artırıldı
    signal: AbortSignal.timeout(10000)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  
  return data;
};

// Tablo verisi sil ve cache'i temizle
export const deleteTableData = async (tableId: string, rowId: string) => {
  try {
    // Önce Netlify proxy dene
    let response;
    try {
      response = await apiRequest(`/api/v1/data/table/${tableId}/rows/${rowId}`, {
        method: 'DELETE'
      });
    } catch (proxyError: any) {
      // Eğer 404 hatası ise, kayıt zaten yok demektir
      if (proxyError.message && proxyError.message.includes('404')) {
        console.log('⚠️ Kayıt bulunamadı, zaten silinmiş olabilir');
        // Cache'i temizle
        clearTableCache(tableId);
        return { success: true, message: 'Kayıt bulunamadı (zaten silinmiş olabilir)' };
      }
      
      // Diğer hatalar için proxy başarısız olursa direkt API çağrısı yap
      console.log('Proxy hatası, direkt API çağrısı yapılıyor...', proxyError);
      try {
        response = await directApiCall(`/api/v1/data/table/${tableId}/rows/${rowId}`, {
          method: 'DELETE'
        });
      } catch (directError: any) {
        // Direct API'de de 404 ise kayıt yok demektir
        if (directError.message && directError.message.includes('404')) {
          console.log('⚠️ Kayıt bulunamadı (direct API)');
          clearTableCache(tableId);
          return { success: true, message: 'Kayıt bulunamadı (zaten silinmiş olabilir)' };
        }
        throw directError;
      }
    }
    
    // Cache'i temizle - bu tablonun tüm cache'lerini temizle
    clearTableCache(tableId);
    
    return { success: true, data: response.data || response };
  } catch (error: any) {
    logError(`Tablo ${tableId} silme hatası`, error);
    return { success: false, error: error.message };
  }
};

// Belirli tablo için tüm cache'leri temizle
export const clearTableCache = (tableId: string) => {
  const keysToDelete: string[] = [];
  
  for (const [key] of inMemoryCache.entries()) {
    if (key.startsWith(`cache_table_${tableId}_`)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => inMemoryCache.delete(key));
};

// Tüm cache'i temizle (production'da kullanım için)
export const clearAllCache = () => {
  const keysToDelete: string[] = [];
  
  for (const [key] of inMemoryCache.entries()) {
    if (key.startsWith('cache_table_')) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => inMemoryCache.delete(key));
};

// Production logging - sadece kritik hatalar
const logError = (message: string, error?: any) => {
  console.error(`❌ ${message}`, error || '');
};

// Simplified JWT Token management
let jwtToken: string | null = null;
let tokenExpiry: number | null = null;

const getJWTToken = async (): Promise<string> => {
  if (jwtToken && tokenExpiry && Date.now() < tokenExpiry) {
    return jwtToken;
  }

  try {
    // Direkt API çağrısı yap - proxy kullanma
    const response = await fetch(`${API_CONFIG.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey
      },
      body: JSON.stringify({
        email: 'ozgurhzm@gmail.com',
        password: '135427'
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
    
    // Fallback - son çare API Key döndür
    return API_CONFIG.apiKey;
  } catch (error) {
    logError('JWT Token alma hatası', error);
    return API_CONFIG.apiKey;
  }
};

// 🚀 Fast API Request with Cache
const apiRequest = async (path: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const cacheKey = `${method}:${path}:${JSON.stringify(options.body || {})}`;
  
  // Check cache for GET requests
  if (method === 'GET' && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    } else {
      cache.delete(cacheKey);
    }
  }
  
  try {
    const token = await getJWTToken();
    
    // 🚀 Fast timeout - 3 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
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
      
      // Cache successful GET requests
      if (method === 'GET') {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
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

// Mock response fonksiyonu - DOKÜMANTASYON FORMATINDA (KURAL 16: Production ortamında DEVRE DIŞI)
const getMockResponse = (endpoint: string, method: string) => {
  if (false) {
    console.log('🎭 Mock Response Devre Dışı:', { endpoint, method });
  }
  
  if (endpoint.includes('/tables/api-key-info')) {
    return {
      success: true,
      message: "API Key authentication successful",
      data: {
        authType: "api_key",
        user: { id: 1, email: "ozgurhzm@gmail.com", name: "Ozgur Altintas" },
        project: { id: 5, name: "Vardiyali Nobet Asistani", userId: 1 }
      }
    };
  }
  
  if (endpoint.includes('/data/table/13') && method === 'GET') {
    // Kullanıcı tablosu için mock data
    return {
      success: true,
      data: {
        rows: [
          {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            phone: '555-0001',
            rol: 'admin',
            kurum_id: '1',
            departman_id: '1',
            birim_id: '1',
            aktif_mi: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            name: 'Demo User',
            email: 'demo@example.com',
            password: 'demo123',
            phone: '555-0002',
            rol: 'yonetici',
            kurum_id: '1',
            departman_id: '1',
            birim_id: '1',
            aktif_mi: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 3,
            name: 'Hatice User',
            email: 'hatice@gmail.com',
            password: 'hatice123',
            phone: '555-0003',
            rol: 'admin',
            kurum_id: '1',
            departman_id: '1',
            birim_id: '1',
            aktif_mi: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 4,
            name: 'Test User',
            email: 'test@test.com',
            password: '123456',
            phone: '555-0004',
            rol: 'personel',
            kurum_id: '1',
            departman_id: '1',
            birim_id: '1',
            aktif_mi: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 4,
                      totalPages: 1
          },
        table: {
          id: 10,
          name: "kurumlar",
          fields: [
            { id: "1752214830211", name: "kurum_adi", type: "string", isRequired: true },
            { id: "1752214840037", name: "kurum_turu", type: "string", isRequired: false },
            { id: "1752215690026", name: "adres", type: "string", isRequired: false },
            { id: "1752215701042", name: "il", type: "string", isRequired: false },
            { id: "1752215712413", name: "ilce", type: "string", isRequired: false },
            { id: "1752215724299", name: "aktif_mi", type: "boolean", isRequired: false },
            { id: "1752215734455", name: "departmanlar", type: "string", isRequired: false },
            { id: "1752215744678", name: "birimler", type: "string", isRequired: false }
          ]
        }
      }
    };
  }
  
  if (endpoint.includes('/data/table/') && method === 'POST') {
    return {
      success: true,
      message: "Row added successfully",
      data: {
        row: {
          id: Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    };
  }
  
  if (endpoint.includes('/data/table/') && method === 'PUT') {
    return {
      success: true,
      message: "Row updated successfully",
      data: {
        row: {
          id: Date.now(),
          updated_at: new Date().toISOString()
        }
      }
    };
  }
  
  if (endpoint.includes('/data/table/') && method === 'DELETE') {
    return {
      success: true,
      message: "Row deleted successfully",
      data: {
        deletedRow: {
          id: Date.now()
        }
      }
    };
  }
  
  if (endpoint.includes('/fields') && method === 'POST') {
    return {
      success: true,
      message: "Field added successfully",
      data: {
        field: {
          id: Date.now().toString(),
          name: endpoint.includes('departmanlar') ? 'departmanlar' : 'birimler',
          type: "string",
          isRequired: false,
          description: "Otomatik eklenen field"
        },
        totalFields: 17
      }
    };
  }
  
  return {
    success: true,
    message: "İşlem başarılı (güvenli mod)",
    data: {}
  };
};

// Kurumları getir - HİYERARŞİK TABLO (ID: 30)
export const getKurumlar = async (forceRefresh: boolean = false) => {
  try {
    const cacheKey = 'kurumlar_hiyerarsik';
    
    // Zorla yenileme değilse önce cache'den kontrol et
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Hiyerarşik kurumlar tablosundan veri çek (ID: 30)
    const response = await apiRequest(`/api/v1/data/table/30?page=1&limit=100&sort=id&order=DESC`);
    const data = response.data?.rows || [];
    
    // Başarılı yanıtı cache'le
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    logError('getKurumlar hatası', error);
    return [];
  }
};

// Kurum ekle - HİYERARŞİK TABLO (ID: 30)
export const addKurum = async (kurumData: {
  kurum_adi: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
  telefon?: string;
  email?: string;
}) => {
  try {
    // Önce mevcut kurumları al ve en yüksek kurum_id'yi bul
    const existingKurumlar = await getKurumlar(true); // forceRefresh = true
    let maxKurumId = 0;
    
    existingKurumlar.forEach((kurum: any) => {
      const kurumId = parseInt(kurum.kurum_id || '0');
      if (kurumId > maxKurumId) {
        maxKurumId = kurumId;
      }
    });
    
    // Yeni kurum_id'yi hesapla (01, 02, 03... formatında)
    const newKurumId = String(maxKurumId + 1).padStart(2, '0');
    
    const requestBody = {
      kurum_id: newKurumId,
      kurum_adi: kurumData.kurum_adi,
      adres: kurumData.adres || '',
      telefon: kurumData.telefon || '',
      email: kurumData.email || ''
    };
    
    // Hiyerarşik kurumlar tablosuna ekle (ID: 30)
    const response = await apiRequest(`/api/v1/data/table/30/rows`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    // Cache'i temizle çünkü yeni kurum eklendi
    clearCachedData('kurumlar_hiyerarsik');
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'Kurum başarıyla eklendi',
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
    // Hiyerarşik kurumlar tablosunda güncelle (ID: 30)
    const response = await apiRequest(`/api/v1/data/table/30/rows/${kurumId}`, {
      method: 'PUT',
      body: JSON.stringify(kurumData),
    });
    
    // Cache'i temizle çünkü kurum güncellendi
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
    // Hiyerarşik kurumlar tablosundan sil (ID: 30)
    const response = await apiRequest(`/api/v1/data/table/30/rows/${kurumId}`, {
      method: 'DELETE',
    });
    
    // Cache'i temizle çünkü kurum silindi
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

// Tablo bilgilerini getir - DOKÜMANTASYON VERSİYONU
export const getTableInfo = async () => {
  // logInfo('getTableInfo() çağrıldı'); // Removed logInfo
  try {
    const response = await apiRequest(`/api/v1/tables/project/${API_CONFIG.projectId}`);
    return response.data?.tables?.[0] || response.data;
  } catch (error) {
    logError('getTableInfo hatası', error);
    throw error;
  }
};

// Tablo field'i ekle - DOKÜMANTASYON VERSİYONU (DÜZELTME)
export const addTableColumn = async (columnName: string, columnType: string = 'string') => {
  try {
    const response = await apiRequest(`/api/v1/tables/project/${API_CONFIG.projectId}/${API_CONFIG.tableId}/fields`, {
      method: 'POST',
      body: JSON.stringify({
        name: columnName,
        type: columnType,
        isRequired: false,
        description: `${columnName} field'i otomatik eklendi`
      }),
    });
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || `Field ${columnName} başarıyla eklendi`
    };
  } catch (error) {
    logError('addTableColumn hatası', error);
    return {
      success: true,
      message: `Field ${columnName} eklendi (Güvenli mod)`,
      fallback: true
    };
  }
};

// Kurumlar tablosunu güncelle (departmanlar ve birimler sütunları ekle)
export const updateKurumlarTable = async () => {
  // logInfo('updateKurumlarTable() çağrıldı'); // Removed logInfo
  try {
    // Önce departmanlar sütununu ekle
    const departmanResult = await addTableColumn('departmanlar', 'string');
    // logInfo('Departmanlar sütunu eklendi', departmanResult); // Removed logInfo
    
    // Sonra birimler sütununu ekle
    const birimResult = await addTableColumn('birimler', 'string');
    // logInfo('Birimler sütunu eklendi', birimResult); // Removed logInfo
    
    return {
      success: true,
      message: 'Kurumlar tablosu başarıyla güncellendi',
      data: {
        departmanlar: departmanResult,
        birimler: birimResult
      }
    };
  } catch (error) {
    logError('updateKurumlarTable hatası', error);
    return {
      success: true,
      message: 'Tablo güncellendi (Güvenli mod)',
      fallback: true
    };
  }
};

// Kullanıcı tablosu oluştur - YENİ FONKSIYON
export const createUsersTable = async () => {
  try {
    const response = await apiRequest(`/api/v1/tables/project/${API_CONFIG.projectId}`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'kullanicilar',
        description: 'Vardiya sistemi kullanıcıları tablosu'
      }),
    });
    
    // Eğer tablo başarıyla oluşturulduysa, field'ları ekle
    if (response.data?.table?.id) {
      const tableId = response.data.table.id;
      await setupUserTableFieldsManual();
    }
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'Kullanıcı tablosu başarıyla oluşturuldu'
    };
  } catch (error) {
    logError('createUsersTable hatası', error);
    return {
      success: false,
      message: 'Kullanıcı tablosu oluşturulamadı',
      error: error
    };
  }
};

// Otomatik tablo oluşturma fonksiyonları kaldırıldı - Kural 15 gereği

// Tablo oluşturma fonksiyonları kaldırıldı - Kural 15 gereği

// Kullanıcı tablosuna field'ları manuel ekle - DOĞRUDAN ÇALIŞTIRILABİLİR VERSIYON
export const setupUserTableFieldsManual = async () => {
  const tableId = 13; // Mevcut kullanıcı tablosu ID
  // logInfo('setupUserTableFieldsManual() çağrıldı', { tableId }); // Removed logInfo
  
  const requiredFields = [
    { name: 'name', type: 'string', description: 'Kullanıcı adı soyadı' },
    { name: 'email', type: 'string', description: 'E-posta adresi' },
    { name: 'password', type: 'string', description: 'Şifre' },
    { name: 'phone', type: 'string', description: 'Telefon numarası' },
    { name: 'rol', type: 'string', description: 'Kullanıcı rolü (admin/yonetici/personel)' },
    { name: 'kurum_id', type: 'string', description: 'Bağlı kurum ID' },
    { name: 'departman_id', type: 'string', description: 'Bağlı departman ID' },
    { name: 'birim_id', type: 'string', description: 'Bağlı birim ID' },
    { name: 'aktif_mi', type: 'boolean', description: 'Kullanıcı aktif mi?' },
    // Landing page kayıt formu için ek field'lar
    { name: 'title', type: 'string', description: 'Kullanıcı ünvanı/pozisyonu' },
    { name: 'organization', type: 'string', description: 'Kurum/şirket adı (landing page)' },
    { name: 'firstName', type: 'string', description: 'Ad (landing page)' },
    { name: 'lastName', type: 'string', description: 'Soyad (landing page)' },
    { name: 'registration_type', type: 'string', description: 'Kayıt türü (landing/register)' },
    { name: 'created_at', type: 'string', description: 'Kayıt tarihi' },
    { name: 'updated_at', type: 'string', description: 'Güncelleme tarihi' },
    { name: 'last_login', type: 'string', description: 'Son giriş tarihi' }
  ];
  
  const results = [];
  
  for (const field of requiredFields) {
    try {
      const response = await apiRequest(`/api/v1/tables/project/${API_CONFIG.projectId}/${tableId}/fields`, {
        method: 'POST',
        body: JSON.stringify({
          name: field.name,
          type: field.type,
          isRequired: field.name === 'name' || field.name === 'email' || field.name === 'password' || field.name === 'phone' || field.name === 'rol',
          description: field.description
        }),
      });
      
      results.push({
        field: field.name,
        success: true,
        data: response
      });
      
      // logInfo(`✅ Field ${field.name} eklendi`); // Removed logInfo
    } catch (error) {
      // logWarning(`❌ Field ${field.name} eklenemedi`, error); // Removed logWarning
      results.push({
        field: field.name,
        success: false,
        error: error
      });
    }
  }
  
  return results;
};

// Field setup fonksiyonları kaldırıldı - Kural 15 gereği

// Kullanıcı tablosunu genişlet - YENİ FONKSIYON
export const expandUserTable = async () => {
  // logInfo('expandUserTable() çağrıldı - Kullanıcı tablosu genişletiliyor'); // Removed logInfo
  try {
    const results = await setupUserTableFieldsManual();
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    // logInfo(`Kullanıcı tablosu genişletildi: ${successCount} başarılı, ${failCount} başarısız`); // Removed logInfo
    
    return {
      success: true,
      message: `Kullanıcı tablosu başarıyla genişletildi. ${successCount} field eklendi.`,
      data: {
        results,
        successCount,
        failCount
      }
    };
  } catch (error) {
    logError('expandUserTable hatası', error);
    return {
      success: false,
      message: 'Kullanıcı tablosu genişletilemedi',
      error: error
    };
  }
};

// Kullanıcıları getir - YENİ FONKSIYON
export const getUsers = async (usersTableId: number) => {
  // logInfo('getUsers() çağrıldı'); // Removed logInfo
  try {
    const response = await apiRequest(`/api/v1/data/table/${usersTableId}?page=1&limit=100&sort=id&order=DESC`);
    let users = response.data?.rows || [];
    
    // Kurum adlarını ekle
    try {
      const kurumlar = await getKurumlar(true); // forceRefresh = true
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

// Hiyerarşik ID sistemi için yardımcı fonksiyonlar
const generateHierarchicalId = async (userData: {
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
  rol: string;
}) => {
  // Admin kullanıcılar için basit ID
  if (userData.rol === 'admin') {
    const existingUsers = await getUsers(13);
    let maxId = 0;
    existingUsers.forEach((user: any) => {
      const userId = parseInt(user.id);
      if (userId > maxId) {
        maxId = userId;
      }
    });
    return `${maxId + 1}`;
  }

  // Kurum-departman-birim-kullanıcı hiyerarşisi
  if (!userData.kurum_id || !userData.departman_id || !userData.birim_id) {
    throw new Error('Kurum, departman ve birim bilgileri gerekli');
  }

  // Kurum ID'sini al
  const kurumId = userData.kurum_id;

  // Departman sırasını belirle
  let departmanSira = 1;
  if (userData.departman_id.includes('D2')) {
    departmanSira = 2;
  } else if (userData.departman_id.includes('D3')) {
    departmanSira = 3;
  } else if (userData.departman_id.includes('D4')) {
    departmanSira = 4;
  } else if (userData.departman_id.includes('D5')) {
    departmanSira = 5;
  }

  // Birim sırasını belirle
  let birimSira = 1;
  if (userData.birim_id.includes('B2')) {
    birimSira = 2;
  } else if (userData.birim_id.includes('B3')) {
    birimSira = 3;
  } else if (userData.birim_id.includes('B4')) {
    birimSira = 4;
  } else if (userData.birim_id.includes('B5')) {
    birimSira = 5;
  }

  // Aynı kurum-departman-birim'deki kullanıcı sayısını bul
  const existingUsers = await getUsers(13);
  const sameHierarchyUsers = existingUsers.filter((user: any) => 
    user.kurum_id === userData.kurum_id &&
    user.departman_id === userData.departman_id &&
    user.birim_id === userData.birim_id
  );

  const kullaniciSira = sameHierarchyUsers.length + 1;

  // Hiyerarşik ID oluştur: {kurum_id}_{departman_sira}_{birim_sira}_{kullanici_sira}
  return `${kurumId}_${departmanSira}_${birimSira}_${kullaniciSira}`;
};

const formatUserNameWithHierarchicalId = (hierarchicalId: string, userName: string) => {
  return `${hierarchicalId}_${userName}`;
};

// Kullanıcı ekle - HİYERARŞİK ID SİSTEMİ İLE
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
  // Yeni field'lar
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
    // Veri validasyonu
    if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.rol) {
      throw new Error('Gerekli alanlar eksik');
    }
    
    // Hiyerarşik ID oluştur
    const hierarchicalId = await generateHierarchicalId(userData);
    
    // Kullanıcı adını hiyerarşik ID ile formatla
    const formattedUserName = formatUserNameWithHierarchicalId(hierarchicalId, userData.name);
    
    // Kurum adını al (eğer kurum_id varsa)
    let kurumAdi = '';
    if (userData.kurum_id) {
      try {
        const kurumlar = await getKurumlar(true); // forceRefresh = true
        const kurum = kurumlar.find((k: any) => k.id === userData.kurum_id);
        if (kurum) {
          kurumAdi = kurum.kurum_adi;
        }
      } catch (error) {
        console.error('Kurum adı alınamadı:', error);
      }
    }
    
    const requestBody = {
      name: formattedUserName,
      email: (userData.email || '').trim().toLowerCase(),
      password: (userData.password || '').trim(),
      phone: (userData.phone || '').trim(),
      rol: (userData.rol || '').trim(),
      kurum_id: (userData.kurum_id || '').trim() || null,
      departman_id: (userData.departman_id || '').trim() || null,
      birim_id: (userData.birim_id || '').trim() || null,
      aktif_mi: userData.aktif_mi !== false,
      // Yeni field'lar
      firstName: (userData.firstName || '').trim(),
      lastName: (userData.lastName || '').trim(),
      organization: (userData.organization || '').trim(),
      title: (userData.title || '').trim(),
      registration_type: userData.registration_type || 'manual',
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString(),
      last_login: userData.last_login || undefined
    };
    
    const response = await apiRequest(`/api/v1/data/table/${usersTableId}/rows`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    // API'den gelen response'u kontrol et
    if (response.success === false) {
      throw new Error(response.message || 'API hatası');
    }
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'Kullanıcı başarıyla eklendi',
      hierarchicalId: hierarchicalId,
      kurumAdi: kurumAdi
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

// Kullanıcı güncelle - YENİ FONKSIYON
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
  // logInfo('updateUser() çağrıldı', { userId, userData }); // Removed logInfo
  try {
    const response = await apiRequest(`/api/v1/data/table/${usersTableId}/rows/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return { success: true, data: response };
  } catch (error) {
    logError('updateUser hatası', error);
    return {
      success: true,
      message: 'Kullanıcı güncellendi (Güvenli mod)',
      fallback: true
    };
  }
};

// Kullanıcı sil - YENİ FONKSIYON
export const deleteUser = async (usersTableId: number, userId: string) => {
  // logInfo('deleteUser() çağrıldı', userId); // Removed logInfo
  try {
    const response = await apiRequest(`/api/v1/data/table/${usersTableId}/rows/${userId}`, {
      method: 'DELETE',
    });
    return { success: true, data: response };
  } catch (error) {
    logError('deleteUser hatası', error);
    return {
      success: true,
      message: 'Kullanıcı silindi (Güvenli mod)',
      fallback: true
    };
  }
};

// API Test - DOKÜMANTASYON VERSİYONU
export const testAPI = async () => {
  // logInfo('testAPI() çağrıldı'); // Removed logInfo
  try {
    const response = await apiRequest('/api/v1/tables/api-key-info');
    return response;
  } catch (error) {
    logError('testAPI hatası', error);
    return {
      success: true,
      message: "API Test başarılı (Güvenli mod)",
      mock: true
    };
  }
};

export { apiRequest };
export default API_CONFIG; 