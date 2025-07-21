// Mevcut kurum kaydını güncelle - Frontend proxy üzerinden
import https from 'https';

const updateKurum = async () => {
  const data = JSON.stringify({
    path: '/api/v1/data/table/10/rows/1',
    method: 'PUT',
    apiKey: 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
    body: {
      kurum_adi: "1_ŞERİK DEVLET HASTANESİ",
      kurum_turu: "HASTANE", 
      adres: "SERİK",
      il: "Antalya",
      ilce: "Serik",
      aktif_mi: true,
      departmanlar: "Acil Servis,Dahiliye,Cerrahi,Nöroloji",
      birimler: "Hemşire,Doktor,Tekniker,Sekreter",
      kurum_id: "KURUM_001",
      departman_id_list: "KURUM_001_ACIL_SERVIS,KURUM_001_DAHILIYE,KURUM_001_CERRAHI,KURUM_001_NOROLOJI",
      birim_id_list: "KURUM_001_ACIL_HEMSIRE,KURUM_001_ACIL_DOKTOR,KURUM_001_DAHILIYE_HEMSIRE,KURUM_001_DAHILIYE_DOKTOR,KURUM_001_CERRAHI_HEMSIRE,KURUM_001_CERRAHI_DOKTOR,KURUM_001_NOROLOJI_HEMSIRE,KURUM_001_NOROLOJI_DOKTOR"
    }
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

  return new Promise((resolve, reject) => {
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

const main = async () => {
  console.log('🔄 Kurum kaydı güncelleniyor...');
  
  try {
    const result = await updateKurum();
    console.log('✅ Sonuç:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Hata:', error);
  }
};

main(); 