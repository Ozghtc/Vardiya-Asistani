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

// Kurumları getir - YENİ DOKÜMANTASYON
export const getKurumlar = async () => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}?page=1&limit=100&sort=id&order=DESC`);
    return response.data?.rows || [];
  } catch (error) {
    console.error('Kurumlar getirilemedi:', error);
    throw error;
  }
};

// Kurum ekle - YENİ DOKÜMANTASYON  
export const addKurum = async (kurumData: {
  kurum_adi: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
}) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}/rows`, {
      method: 'POST',
      body: JSON.stringify({
        kurum_adi: kurumData.kurum_adi,
        kurum_turu: kurumData.kurum_turu || '',
        adres: kurumData.adres || '',
        il: kurumData.il || '',
        ilce: kurumData.ilce || '',
        aktif_mi: kurumData.aktif_mi !== false // default true
      }),
    });
    return response;
  } catch (error) {
    console.error('API Kurum ekleme hatası:', error);
    throw error;
  }
};

// Kurum güncelle - YENİ DOKÜMANTASYON
export const updateKurum = async (kurumId: string, kurumData: {
  kurum_adi?: string;
  kurum_turu?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  aktif_mi?: boolean;
}) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}/rows/${kurumId}`, {
      method: 'PUT',
      body: JSON.stringify(kurumData),
    });
    return response;
  } catch (error) {
    console.error('API Kurum güncelleme hatası:', error);
    throw error;
  }
};

// Kurum sil - YENİ DOKÜMANTASYON
export const deleteKurum = async (kurumId: string) => {
  try {
    const response = await apiRequest(`/api/v1/data/table/${API_CONFIG.tableId}/rows/${kurumId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('API Kurum silme hatası:', error);
    throw error;
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