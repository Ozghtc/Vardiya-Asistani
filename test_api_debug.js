// API Connection Debug Test
// Memory'den bilgiler: API Key: hzm_1ce98c92189d4a109cd604b22bfd86b7, Base URL: https://hzmbackandveritabani-production-c660.up.railway.app

const API_CONFIG = {
  baseURL: 'https://hzmbackendveritabani-production.up.railway.app',
  apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
  userEmail: 'ozgurhzm@gmail.com',
  projectPassword: 'hzmsoft123456', // Dokümandaki şifre
  tableId: '33' // kullanicilar_final tablosu
};

async function testAPIConnection() {
  console.log('🔍 API Connection Test başlatılıyor...');
  console.log('📍 Base URL:', API_CONFIG.baseURL);
  console.log('🔑 API Key:', API_CONFIG.apiKey ? 'PRESENT' : 'MISSING');
  console.log('📧 User Email:', API_CONFIG.userEmail);
  console.log('🔐 Project Password:', API_CONFIG.projectPassword);
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/v1/data/table/${API_CONFIG.tableId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey,
        'X-User-Email': API_CONFIG.userEmail,
        'X-Project-Password': API_CONFIG.projectPassword
      }
    });
    
    console.log('📨 Response Status:', response.status);
    console.log('📨 Response OK:', response.ok);
    
    const data = await response.text();
    console.log('📨 Response Length:', data.length);
    
    if (response.ok) {
      console.log('✅ API Connection SUCCESS!');
      const jsonData = JSON.parse(data);
      console.log('📊 Data rows:', jsonData?.data?.rows?.length || 0);
    } else {
      console.log('❌ API Connection FAILED!');
      console.log('📝 Error Response:', data);
    }
    
  } catch (error) {
    console.error('🚨 Connection Error:', error.message);
  }
}

// Test'i çalıştır
testAPIConnection(); 