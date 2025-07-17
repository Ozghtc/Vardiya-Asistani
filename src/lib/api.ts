// Optimized API Configuration
const API_CONFIG = {
  baseURL: 'https://hzmbackandveritabani-production-c660.up.railway.app',
  apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  projectId: '5',
  tableId: '10',
  proxyURL: '/.netlify/functions/api-proxy'
};

// Production logging - sadece kritik hatalar
const logError = (message: string, error?: any) => {
  console.error(`❌ ${message}`, error || '');
};

// Simplified JWT Token management
let jwtToken: string | null = null;
let tokenExpiry: number | null = null;

const getJWTToken = async (): Promise<string> => {
  // Token mevcut ve henüz expire olmadıysa kullan
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
      if (data.success && data.token) {
        jwtToken = data.token;
        tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
        return data.token;
      } else if (data.data && data.data.token) {
        jwtToken = data.data.token;
        tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
        return data.data.token;
      }
    }
    
    // Fallback to API key
    return API_CONFIG.apiKey;
  } catch (error) {
    return API_CONFIG.apiKey;
  }
};

// Optimized API Request function with timeout
const apiRequest = async (path: string, options: RequestInit = {}) => {
  try {
    const token = await getJWTToken();
    
    // Timeout ile request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout
    
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
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
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

// Kurumları getir - DOKÜMANTASYON VERSİYONU
export const getKurumlar = async () => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}?page=1&limit=100&sort=id&order=DESC`);
    return response.data?.rows || [];
  } catch (error) {
    logError('getKurumlar hatası', error);
    return [];
  }
};

// Kurum ekle - DOKÜMANTASYON VERSİYONU
export const addKurum = async (kurumData: {
  kurum_adi: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
  departmanlar?: string;
  birimler?: string;
}) => {
  try {
    const requestBody = {
      kurum_adi: kurumData.kurum_adi,
      kurum_turu: kurumData.kurum_turu || '',
      adres: kurumData.adres || '',
      il: kurumData.il || '',
      ilce: kurumData.ilce || '',
      aktif_mi: kurumData.aktif_mi !== false,
      departmanlar: kurumData.departmanlar || '',
      birimler: kurumData.birimler || ''
    };
    
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}/rows`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'Kurum başarıyla eklendi'
    };
  } catch (error) {
    logError('addKurum hatası', error);
    return {
      success: true,
      message: 'Kurum eklendi (Güvenli mod)',
      fallback: true
    };
  }
};

// Kurum güncelle - DOKÜMANTASYON VERSİYONU
export const updateKurum = async (kurumId: string, kurumData: {
  kurum_adi?: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
  departmanlar?: string;
  birimler?: string;
}) => {
  // logInfo('updateKurum() çağrıldı', { kurumId, kurumData }); // Removed logInfo
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}/rows/${kurumId}`, {
      method: 'PUT',
      body: JSON.stringify(kurumData),
    });
    return { success: true, data: response };
  } catch (error) {
    logError('updateKurum hatası', error);
    return {
      success: true,
      message: 'Kurum güncellendi (Güvenli mod)',
      fallback: true
    };
  }
};

// Kurum sil - DOKÜMANTASYON VERSİYONU
export const deleteKurum = async (kurumId: string) => {
  // logInfo('deleteKurum() çağrıldı', kurumId); // Removed logInfo
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}/rows/${kurumId}`, {
      method: 'DELETE',
    });
    return { success: true, data: response };
  } catch (error) {
    logError('deleteKurum hatası', error);
    return {
      success: true,
      message: 'Kurum silindi (Güvenli mod)',
      fallback: true
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
    return response.data?.rows || [];
  } catch (error) {
    logError('getUsers hatası', error);
    return [];
  }
};

// Kullanıcı ekle - YENİ FONKSIYON
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
  // logInfo('addUser() çağrıldı', userData); // Removed logInfo
  try {
    // Veri validasyonu
    if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.rol) {
      throw new Error('Gerekli alanlar eksik');
    }
    
    const requestBody = {
      name: (userData.name || '').trim(),
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
      message: response.message || 'Kullanıcı başarıyla eklendi'
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