// Test API Connection - Frontend gibi çağrı
import https from 'https';

// Environment'tan API key al
const API_KEY = process.env.VITE_HZM_API_KEY;
const USER_EMAIL = process.env.VITE_HZM_USER_EMAIL;
const PROJECT_PASSWORD = process.env.VITE_HZM_PROJECT_PASSWORD;

const makeAPICall = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      path: path,
      method: method,
      apiKey: API_KEY,
      userEmail: USER_EMAIL,
      projectPassword: PROJECT_PASSWORD,
      body: body
    });

    const options = {
      hostname: 'vardiyaasistani.netlify.app',
      path: '/.netlify/functions/api-proxy',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          resolve(result);
        } catch (e) {
          resolve({ error: 'Parse error', body: responseBody });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

const testAPI = async () => {
  
  try {
    // Kurumlar tablosunu oku
    const kurumlarResult = await makeAPICall('/api/v1/data/table/10', 'GET');

    if (kurumlarResult.success && kurumlarResult.data && kurumlarResult.data.rows) {
      
      // Mevcut kurum kaydını güncelle
      const kurum = kurumlarResult.data.rows[0];
      if (kurum) {
        const updateResult = await makeAPICall(`/api/v1/data/table/10/rows/${kurum.id}`, 'PUT', {
          kurum_adi: kurum.kurum_adi,
          kurum_turu: kurum.kurum_turu,
          adres: kurum.adres,
          il: kurum.il,
          ilce: kurum.ilce,
          aktif_mi: kurum.aktif_mi,
          departmanlar: kurum.departmanlar,
          birimler: kurum.birimler,
          // Yeni alanlar
          kurum_id: 'KURUM_001',
          departman_id_list: 'KURUM_001_ACIL_SERVIS,KURUM_001_DAHILIYE,KURUM_001_CERRAHI',
          birim_id_list: 'KURUM_001_ACIL_HEMSIRE,KURUM_001_ACIL_DOKTOR,KURUM_001_DAHILIYE_HEMSIRE'
        });
      }
    } else {
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
};

testAPI(); 