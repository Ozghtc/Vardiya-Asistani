const API_CONFIG = {
  baseURL: 'https://hzmbackandveritabani-production-c660.up.railway.app',
  apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  projectId: '5',
  tableId: '10' // kurumlar tablosu - 6 alan ile tam
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-API-Key': API_CONFIG.apiKey,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Kurumları getir
export const getKurumlar = async () => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}`);
    return response.data || [];
  } catch (error) {
    console.error('Kurumlar getirilemedi:', error);
    // Fallback: localStorage'dan getir
    const localKurumlar = localStorage.getItem('admin_kurumlar');
    return localKurumlar ? JSON.parse(localKurumlar) : [];
  }
};

// Kurum ekle - YENİ: Tüm 6 alan desteği
export const addKurum = async (kurumData: {
  kurum_adi: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
}) => {
  try {
    // Veri formatını düzenle
    const apiData = {
      data: {
        kurum_adi: kurumData.kurum_adi,
        kurum_turu: kurumData.kurum_turu || '',
        adres: kurumData.adres || '',
        il: kurumData.il || '',
        ilce: kurumData.ilce || '',
        aktif_mi: kurumData.aktif_mi !== false // default true
      }
    };

    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}/rows`, {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
    return response;
  } catch (error) {
    console.error('API Kurum ekleme hatası:', error);
    
    // Fallback: localStorage'a kaydet
    const localKurumlar = JSON.parse(localStorage.getItem('admin_kurumlar') || '[]');
    const kurumKaydi = { 
      ...kurumData, 
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    localKurumlar.push(kurumKaydi);
    localStorage.setItem('admin_kurumlar', JSON.stringify(localKurumlar));
    
    return { 
      success: true, 
      message: 'Kurum localStorage\'a kaydedildi (API hatası)',
      fallback: true 
    };
  }
};

// Tablo bilgilerini getir
export const getTableInfo = async () => {
  try {
    const response = await apiRequest(`/api/v1/tables/project/${API_CONFIG.projectId}`);
    return response.data.tables[0]; // İlk tablo (kurumlar)
  } catch (error) {
    console.error('Tablo bilgisi alınamadı:', error);
    throw error;
  }
};

// API Test
export const testAPI = async () => {
  try {
    const response = await apiRequest('/api/v1/tables/api-key-info');
    console.log('✅ API Test Başarılı:', response);
    return response;
  } catch (error) {
    console.error('❌ API Test Başarısız:', error);
    throw error;
  }
};

export default API_CONFIG; 