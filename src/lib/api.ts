const API_CONFIG = {
  baseURL: 'https://hzmbackandveritabani-production-c660.up.railway.app',
  apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  projectId: '5',
  tableId: '10' // kurumlar tablosu
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
    return [];
  }
};

// Kurum ekle  
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
      body: JSON.stringify({ data: [kurumData] }),
    });
    return response;
  } catch (error) {
    console.error('Kurum eklenemedi:', error);
    throw error;
  }
};

// API Test
export const testAPI = async () => {
  try {
    const response = await apiRequest('/api/v1/tables/api-key-info');
    console.log('API Test Başarılı:', response);
    return response;
  } catch (error) {
    console.error('API Test Başarısız:', error);
    throw error;
  }
};

export default API_CONFIG; 