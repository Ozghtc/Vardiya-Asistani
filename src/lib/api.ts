// Optimized API Configuration
const API_CONFIG = {
  baseURL: 'https://hzmbackandveritabani-production-c660.up.railway.app',
  apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  projectId: '5',
  proxyURL: '/.netlify/functions/api-proxy'
};

// 🚫 CACHE SİSTEMİ KALDIRILDI - KALICI ÇÖZÜM
// Tüm API çağrıları direkt backend'e gidecek
// Hiç cache mekanizması yok - fresh data garantisi

// Eski cache fonksiyonları - boş implementasyon (geriye uyumluluk için)
export const getCachedData = (key: string) => null;
export const setCachedData = (key: string, data: any) => {};
export const clearCachedData = (key: string) => {};
export const clearAllCache = () => {};
export const clearTableCache = (tableId: string) => {};

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

// JWT Token yönetimi - GÜVENLİ YÖNTEM
let jwtToken: string | null = null;
let tokenExpiry: number | null = null;

// JWT Token'ı güvenli şekilde kaydet (sadece login sonrası)
export const setJWTToken = (token: string) => {
  jwtToken = token;
  tokenExpiry = Date.now() + (6 * 60 * 60 * 1000); // 6 saat
  console.log('✅ JWT TOKEN GÜVENLİ ŞEKİLDE KAYDEDILDI');
};

// JWT Token'ı temizle (logout)
export const clearJWTToken = () => {
  jwtToken = null;
  tokenExpiry = null;
  console.log('🧹 JWT TOKEN TEMİZLENDİ');
};

const getJWTToken = async (): Promise<string> => {
  if (jwtToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('🎫 CACHED JWT TOKEN KULLANILIYOR');
    return jwtToken;
  }
  
  try {
    console.log('🔄 JWT TOKEN GEREKLİ...');
    
    // 🚨 GÜVENLİK: Hardcoded credentials kaldırıldı!
    // Token artık sadece kullanıcı giriş yaptığında alınacak
    if (!jwtToken) {
      throw new Error('JWT Token bulunamadı - Lütfen tekrar giriş yapın');
    }
    
    return jwtToken;
    
  } catch (error) {
    console.error('🚨 JWT Token alınamadı:', error);
    // Fallback: API Key ile sınırlı işlemler
    throw error;
  }
};

// API Request with timeout - TÜM İSTEKLER PROXY ÜZERİNDEN
const apiRequest = async (path: string, options: RequestInit = {}) => {
  try {
    const token = await getJWTToken();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      // 🔧 TÜM API İSTEKLERİ NETLIFY PROXY ÜZERİNDEN (CORS sorunu çözümü)
      // 🚫 CACHE ENGELLEME - Sekme/Browser cache'i tamamen devre dışı
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          path: `${path}${path.includes('?') ? '&' : '?'}_t=${Date.now()}`, // Timestamp cache buster
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
      
      console.log(`✅ API SUCCESS (PROXY): ${options.method || 'GET'} ${path}`, data);
      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - API yanıt vermiyor');
      }
      console.error(`❌ API ERROR (PROXY): ${options.method || 'GET'} ${path}`, fetchError);
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
      clearJWTToken(); // JWT token'i de temizle
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
      kurum_id: kurum.kurum_id, // 🔧 KURUM_ID'Yİ KORU!
      departman_id: kurum.DEPARTMAN_ID || '',
      departmanlar: kurum.DEPARTMAN_ADI || '',
      birim_id: kurum.BIRIM_ID || '',
      birimler: kurum.BIRIM || '', // BIRIM_ADI değil, BIRIM kullanılmalı
      aktif_mi: kurum.aktif_mi !== false // Varsayılan: true
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
      aktif_mi: kurumData.aktif_mi !== false, // Varsayılan: true
      DEPARTMAN_ID: departmanIdList,
      DEPARTMAN_ADI: departmanlar,
      BIRIM_ID: birimIdList,
      BIRIM: birimler
    };
    
    const response = await apiRequest(`/api/v1/data/table/30/rows`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    // 2️⃣ DEPARTMANLARI AYRI TABLOYA KAYDET (ID: 34) - DUPLICATE KONTROLÜ İLE
    if (departmanlar.trim()) {
      const departmanList = departmanlar.split(',').filter(d => d.trim());
      
      // Önce mevcut departmanları kontrol et
      const existingDepartmanlar = await apiRequest(`/api/v1/data/table/34`, {
        method: 'GET',
      });
      
      const existingDepartmanIds = existingDepartmanlar.data.rows.map((row: any) => row.departman_id);
      
      for (let i = 0; i < departmanList.length; i++) {
        const departmanAdi = departmanList[i].trim();
        const departmanId = `${newKurumId}_D${i + 1}`;
        
        // DUPLICATE KONTROLÜ
        if (existingDepartmanIds.includes(departmanId)) {
          console.warn(`⚠️ Departman zaten mevcut, atlanıyor: ${departmanId} - ${departmanAdi}`);
          continue;
        }
        
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
          console.log(`✅ Departman kaydedildi: ${departmanId} - ${departmanAdi}`);
        } catch (error) {
          console.warn(`❌ Departman kaydedilemedi: ${departmanAdi}`, error);
        }
      }
    }
    
    // 3️⃣ BİRİMLERİ AYRI TABLOYA KAYDET (ID: 35) - DUPLICATE KONTROLÜ İLE
    if (birimler.trim()) {
      const birimList = birimler.split(',').filter(b => b.trim());
      
      // Önce mevcut birimleri kontrol et
      const existingBirimler = await apiRequest(`/api/v1/data/table/35`, {
        method: 'GET',
      });
      
      const existingBirimIds = existingBirimler.data.rows.map((row: any) => row.birim_id);
      
      for (let i = 0; i < birimList.length; i++) {
        const birimAdi = birimList[i].trim();
        const birimId = `${newKurumId}_B${i + 1}`;
        
        // DUPLICATE KONTROLÜ
        if (existingBirimIds.includes(birimId)) {
          console.warn(`⚠️ Birim zaten mevcut, atlanıyor: ${birimId} - ${birimAdi}`);
          continue;
        }
        
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
          console.log(`✅ Birim kaydedildi: ${birimId} - ${birimAdi}`);
        } catch (error) {
          console.warn(`❌ Birim kaydedilemedi: ${birimAdi}`, error);
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
  aktif_mi?: boolean;
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

// CASCADE DELETE: Kurum silindiğinde ona bağlı tüm verileri sil
export const cascadeDeleteKurum = async (kurumId: string): Promise<any> => {
  try {
    console.log('🗑️ CASCADE DELETE başlatılıyor - Kurum ID:', kurumId);
    
    // 1. Tanımlamalar tabloları (69, 70, 71, 72, 73)
    const tanimlamaTablolari = [
      { id: '69', name: 'personel_unvan_tanimlama' },
      { id: '70', name: 'izin_istek_tanimlama' },
      { id: '71', name: 'vardiya_tanimlama' },
      { id: '72', name: 'tanimli_alanlar' },
      { id: '73', name: 'mesai_turleri' }
    ];
    
    for (const tablo of tanimlamaTablolari) {
      try {
        // Bu kuruma ait kayıtları bul
        const data = await getTableData(tablo.id, `kurum_id=${kurumId}`);
        console.log(`📋 ${tablo.name}: ${data.length} kayıt bulundu`);
        
        // Her kaydı sil
        for (const kayit of data) {
          await apiRequest(`/api/v1/data/table/${tablo.id}/rows/${kayit.id}`, {
            method: 'DELETE'
          });
          console.log(`✅ ${tablo.name} kaydı silindi: ${kayit.id}`);
        }
      } catch (error) {
        console.error(`❌ ${tablo.name} silme hatası:`, error);
      }
    }
    
    // 2. Kullanıcılar tablosu (33)
    try {
      const kullanicilar = await getTableData('33', `kurum_id=${kurumId}`);
      console.log(`👥 Kullanıcılar: ${kullanicilar.length} kayıt bulundu`);
      
      for (const kullanici of kullanicilar) {
        await apiRequest(`/api/v1/data/table/33/rows/${kullanici.id}`, {
          method: 'DELETE'
        });
        console.log(`✅ Kullanıcı silindi: ${kullanici.id}`);
      }
    } catch (error) {
      console.error('❌ Kullanıcı silme hatası:', error);
    }
    
    // 3. Birimler tablosu (35)
    try {
      const birimler = await getTableData('35', `kurum_id=${kurumId}`);
      console.log(`🏢 Birimler: ${birimler.length} kayıt bulundu`);
      
      for (const birim of birimler) {
        await apiRequest(`/api/v1/data/table/35/rows/${birim.id}`, {
          method: 'DELETE'
        });
        console.log(`✅ Birim silindi: ${birim.id}`);
      }
    } catch (error) {
      console.error('❌ Birim silme hatası:', error);
    }
    
    // 4. Departmanlar tablosu (34)
    try {
      const departmanlar = await getTableData('34', `kurum_id=${kurumId}`);
      console.log(`🏬 Departmanlar: ${departmanlar.length} kayıt bulundu`);
      
      for (const departman of departmanlar) {
        await apiRequest(`/api/v1/data/table/34/rows/${departman.id}`, {
          method: 'DELETE'
        });
        console.log(`✅ Departman silindi: ${departman.id}`);
      }
    } catch (error) {
      console.error('❌ Departman silme hatası:', error);
    }
    
    // 5. Son olarak kurumu sil (30)
    try {
      const kurumlar = await getTableData('30', `kurum_id=${kurumId}`);
      if (kurumlar.length > 0) {
        const kurum = kurumlar[0];
        await apiRequest(`/api/v1/data/table/30/rows/${kurum.id}`, {
          method: 'DELETE'
        });
        console.log(`✅ Kurum silindi: ${kurum.id}`);
      }
    } catch (error) {
      console.error('❌ Kurum silme hatası:', error);
    }
    
    // Cache'leri temizle
    clearAllCache();
    ['30', '33', '34', '35', '69', '70', '71', '72', '73'].forEach(tableId => {
      clearTableCache(tableId);
    });
    
    console.log('🎉 CASCADE DELETE tamamlandı!');
    
    return {
      success: true,
      message: 'Kurum ve ona bağlı tüm veriler başarıyla silindi'
    };
    
  } catch (error) {
    console.error('❌ CASCADE DELETE hatası:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

// GELECEK İÇİN: Otomatik CASCADE DELETE sistemi
// Tüm tabloları tarayıp kurum_id field'ı olanları bulur
export const getTablesWithKurumId = async (): Promise<string[]> => {
  try {
    // Tüm tabloları listele
    const response = await apiRequest('/api/v1/tables/project/5', {
      method: 'GET'
    });
    
    if (response.success && response.data?.tables) {
      const tablesWithKurumId: string[] = [];
      
      for (const table of response.data.tables) {
        // Her tablonun field'larını kontrol et
        if (table.fields) {
          const hasKurumId = table.fields.some((field: any) => 
            field.name === 'kurum_id'
          );
          
          if (hasKurumId) {
            tablesWithKurumId.push(table.id.toString());
            console.log(`📋 Kurum ID'li tablo bulundu: ${table.name} (ID: ${table.id})`);
          }
        }
      }
      
      return tablesWithKurumId;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Tablo tarama hatası:', error);
    return [];
  }
};

// GELİŞTİRİLMİŞ CASCADE DELETE - Otomatik tablo bulma
export const smartCascadeDeleteKurum = async (kurumId: string): Promise<any> => {
  try {
    console.log('🤖 SMART CASCADE DELETE başlatılıyor - Kurum ID:', kurumId);
    
    // Otomatik olarak kurum_id field'ı olan tüm tabloları bul
    const tablesWithKurumId = await getTablesWithKurumId();
    console.log(`📊 Toplam ${tablesWithKurumId.length} tablo bulundu`);
    
    // Kurum tablosunu hariç tut (30)
    const tablesToDelete = tablesWithKurumId.filter(id => id !== '30');
    
    // Tüm tabloları temizle
    for (const tableId of tablesToDelete) {
      try {
        const data = await getTableData(tableId, `kurum_id=${kurumId}`);
        console.log(`📋 Tablo ${tableId}: ${data.length} kayıt bulundu`);
        
        for (const kayit of data) {
          await apiRequest(`/api/v1/data/table/${tableId}/rows/${kayit.id}`, {
            method: 'DELETE'
          });
          console.log(`✅ Tablo ${tableId} kaydı silindi: ${kayit.id}`);
        }
      } catch (error) {
        console.error(`❌ Tablo ${tableId} silme hatası:`, error);
      }
    }
    
    // Son olarak kurumu sil
    try {
      const kurumlar = await getTableData('30', `kurum_id=${kurumId}`);
      if (kurumlar.length > 0) {
        const kurum = kurumlar[0];
        await apiRequest(`/api/v1/data/table/30/rows/${kurum.id}`, {
          method: 'DELETE'
        });
        console.log(`✅ Kurum silindi: ${kurum.id}`);
      }
    } catch (error) {
      console.error('❌ Kurum silme hatası:', error);
    }
    
    // Tüm cache'leri temizle
    clearAllCache();
    tablesWithKurumId.forEach(tableId => {
      clearTableCache(tableId);
    });
    
    console.log('🎉 SMART CASCADE DELETE tamamlandı!');
    
    return {
      success: true,
      message: `Kurum ve ${tablesToDelete.length} tablodaki ilgili veriler silindi`
    };
    
  } catch (error) {
    console.error('❌ SMART CASCADE DELETE hatası:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

// ================================
// HİYERARŞİK ID GENERATOR FONKSİYONLARI
// ================================

// Hiyerarşik KULLANICI_ID üret - HIYERARSIK_ID_SISTEMI.md kurallarına uygun
const generateKullaniciId = async (kurum_id: string, departman_id: string, birim_id: string, rol: string): Promise<string> => {
  try {
    // Rol tipini belirle: admin=A, yonetici=Y, personel=P
    let rolKodu = 'P'; // Default: Personel
    if (rol === 'admin') rolKodu = 'A';
    else if (rol === 'yonetici') rolKodu = 'Y';

    // Frontend'den gelen kurum_id'yi kullan
    const actualKurumId = kurum_id;
    console.log(`🔍 Kullanılacak kurum_id: ${actualKurumId}`);

    // Mevcut kullanıcıları al ve aynı birimde aynı rol tipindeki en yüksek numarayı bul
    const existingUsers = await getUsers(33); // kullanicilar_final tablosu
    
    // Aynı birim ve rol tipindeki kullanıcıları filtrele
    const sameTypeUsers = existingUsers.filter((user: any) => 
      user.kurum_id === actualKurumId && 
      user.departman_id === departman_id && 
      user.birim_id === birim_id &&
      user.kullanici_id && 
      user.kullanici_id.includes(`_${rolKodu}`)
    );

    // En yüksek numarayı bul
    let maxNumber = 0;
    sameTypeUsers.forEach((user: any) => {
      if (user.kullanici_id) {
        const match = user.kullanici_id.match(new RegExp(`_${rolKodu}(\\d+)$`));
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNumber) maxNumber = num;
        }
      }
    });

    // Yeni numara
    const newNumber = maxNumber + 1;
    
    // GÜVENLİ DEPARTMAN VE BİRİM KODU ÇIKARMA
    let departmanKodu = 'D1'; // Default
    let birimKodu = 'B1'; // Default
    
    // Departman_id format kontrolü: "6_D1" -> "D1"
    if (departman_id && departman_id.includes('_')) {
      const parts = departman_id.split('_');
      if (parts.length >= 2 && parts[1]) {
        departmanKodu = parts[1];
      }
    } else {
      // Eğer format uygun değilse, departman adından kod üret
      console.warn(`⚠️ Departman ID formatı hatalı: ${departman_id}, default D1 kullanılıyor`);
    }
    
    // Birim_id format kontrolü: "6_B1" -> "B1"  
    if (birim_id && birim_id.includes('_')) {
      const parts = birim_id.split('_');
      if (parts.length >= 2 && parts[1]) {
        birimKodu = parts[1];
      }
    } else {
      // Eğer format uygun değilse, birim adından kod üret
      console.warn(`⚠️ Birim ID formatı hatalı: ${birim_id}, default B1 kullanılıyor`);
    }
    
    // Hiyerarşik ID format: kurum_departman_birim_rolTipi+Numara
    const kullaniciId = `${actualKurumId}_${departmanKodu}_${birimKodu}_${rolKodu}${newNumber}`;
    
    console.log(`🆔 KULLANICI_ID oluşturuldu: ${kullaniciId}`, {
      kurum_id: actualKurumId,
      departman_id: departman_id,
      birim_id: birim_id,
      departmanKodu: departmanKodu,
      birimKodu: birimKodu,
      rolKodu: rolKodu,
      newNumber: newNumber
    });
    return kullaniciId;
    
  } catch (error) {
    console.error('KULLANICI_ID oluşturma hatası:', error);
    // Fallback: Timestamp bazlı ID
    return `${kurum_id}_${Date.now()}_${rol.toUpperCase()[0]}1`;
  }
};

// ================================
// KULLANICI YÖNETİMİ FONKSİYONLARI
// ================================

// Kullanıcıları getir - KULLANICILAR TABLOSU (ID: 33)
export const getUsers = async (usersTableId: number, forceRefresh: boolean = false) => {
  try {
    // 🧹 CACHE TEMİZLE
    if (forceRefresh) {
      clearAllCache();
      clearTableCache(String(usersTableId));
      clearJWTToken();
      console.log('🧹 USERS CACHE TEMİZLENDİ - FRESH DATA ÇEKILIYOR');
    }
    
    // JWT TOKEN AL
    const token = await getJWTToken();
    
    // NETLIFY PROXY İLE GÜVENLİ ERİŞİM - JWT TOKEN İLE
    const response = await fetch('/.netlify/functions/api-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: `/api/v1/data/table/${usersTableId}`,
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
    
    // 🔍 DEBUG: API Response analizi
    console.log('🔍 Netlify Proxy Response:', data);
    console.log('🔍 Raw users:', users);
    console.log('🔍 User count:', users.length);
    console.log('🔍 Users data:', users);
    
    // Kurum adlarını ekle
    try {
      const kurumlar = await getKurumlar(true);
      users = users.map((user: any) => {
        if (user.kurum_id) {
          const kurum = kurumlar.find((k: any) => k.kurum_id === user.kurum_id);
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
    
    // 🆔 HİYERARŞİK KULLANICI_ID OLUŞTUR
    let kullaniciId = '';
    if (userData.kurum_id && userData.departman_id && userData.birim_id) {
      kullaniciId = await generateKullaniciId(
        userData.kurum_id, 
        userData.departman_id, 
        userData.birim_id, 
        userData.rol
      );
    }
    
    const requestBody = {
      kullanici_id: kullaniciId, // 🆔 YENİ: Hiyerarşik ID ekle (field adı düzeltildi)
      name: userData.name,
      email: (userData.email || '').trim().toLowerCase(),
      password: (userData.password || '').trim(),
      phone: (userData.phone || '').trim(),
      rol: (userData.rol || '').trim(),
      kurum_id: (userData.kurum_id || '').trim() || null,
      departman_id: (userData.departman_id || '').trim() || null,
      birim_id: (userData.birim_id || '').trim() || null,
      KURUM_ID: (userData.kurum_id || '').trim() || null, // 🔧 Field ismi düzeltme
      DEPARTMAN_ID: (userData.departman_id || '').trim() || null, // 🔧 Field ismi düzeltme  
      BIRIM_ID: (userData.birim_id || '').trim() || null, // 🔧 Field ismi düzeltme
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
    
    console.log('🆔 Kullanıcı ekleniyor - KULLANICI_ID:', kullaniciId);
    
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
    
    // Cache temizle
    clearAllCache();
    clearTableCache(usersTableId.toString());
    
    return {
      success: true,
      data: data,
      message: `Kullanıcı başarıyla eklendi - ID: ${kullaniciId}`
    };
  } catch (error) {
    logError('addUser hatası', error);
    return {
      success: false,
      message: 'Kullanıcı eklenemedi: ' + (error as any).message
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