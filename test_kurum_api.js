// TEST2 KURUM EKLEME TESTİ
// Environment'tan API key al
const API_CONFIG = {
  baseURL: process.env.VITE_HZM_BASE_URL || 'https://hzmbackendveritabani-production.up.railway.app',
  apiKey: process.env.VITE_HZM_API_KEY,
  userEmail: process.env.VITE_HZM_USER_EMAIL,
  projectPassword: process.env.VITE_HZM_PROJECT_PASSWORD
};

async function testKurumEkle() {
  try {
    
    // 1. Mevcut kurumları al
    const kurumlarResponse = await fetch(`${API_CONFIG.baseURL}/api/v1/data/table/30`, {
      headers: {
        'X-API-Key': API_CONFIG.apiKey
      }
    });
    
    const kurumlarData = await kurumlarResponse.json();
    
    const existingKurumlar = kurumlarData.data?.rows || [];
    let maxKurumId = 0;
    
    existingKurumlar.forEach((kurum) => {
      const kurumId = parseInt(kurum.kurum_id || '0');
      if (kurumId > maxKurumId) {
        maxKurumId = kurumId;
      }
    });
    
    const newKurumId = String(maxKurumId + 1).padStart(2, '0');
    
    // 2. Departman ve birim ID'lerini oluştur
    const departmanlar = 'DAHILIYE, CERRAHI';
    const birimler = 'DOKTOR, HEMSIRE, TEKNISYEN';
    
    const departmanIdList = departmanlar.split(',')
      .filter(d => d.trim())
      .map((_, index) => `${newKurumId}_D${index + 1}`)
      .join(',');
    
    const birimIdList = birimler.split(',')
      .filter(b => b.trim())
      .map((_, index) => `${newKurumId}_B${index + 1}`)
      .join(',');
    
    
    // 3. Kurumu ekle
    const kurumData = {
      kurum_id: newKurumId,
      kurum_adi: 'TEST2 HASTANESI',
      adres: 'Test Adres 2',
      telefon: '0555987654',
      email: 'test2@hastane.com',
      DEPARTMAN_ID: departmanIdList,
      DEPARTMAN_ADI: departmanlar,
      BIRIM_ID: birimIdList,
      BIRIM: birimler
    };
    
    
    const response = await fetch(`${API_CONFIG.baseURL}/api/v1/data/table/30/rows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey
      },
      body: JSON.stringify(kurumData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      
      // 4. Departmanları ayrı tabloya kaydet
      const departmanList = departmanlar.split(',').filter(d => d.trim());
      for (let i = 0; i < departmanList.length; i++) {
        const departmanAdi = departmanList[i].trim();
        const departmanId = `${newKurumId}_D${i + 1}`;
        
        const deptResponse = await fetch(`${API_CONFIG.baseURL}/api/v1/data/table/34/rows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_CONFIG.apiKey
          },
          body: JSON.stringify({
            departman_id: departmanId,
            departman_adi: departmanAdi,
            kurum_id: newKurumId,
            aktif_mi: true
          })
        });
        
        const deptResult = await deptResponse.json();
      }
      
      // 5. Birimleri ayrı tabloya kaydet
      const birimList = birimler.split(',').filter(b => b.trim());
      for (let i = 0; i < birimList.length; i++) {
        const birimAdi = birimList[i].trim();
        const birimId = `${newKurumId}_B${i + 1}`;
        
        const birimResponse = await fetch(`${API_CONFIG.baseURL}/api/v1/data/table/35/rows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_CONFIG.apiKey
          },
          body: JSON.stringify({
            birim_id: birimId,
            birim_adi: birimAdi,
            kurum_id: newKurumId,
            aktif_mi: true
          })
        });
        
        const birimResult = await birimResponse.json();
      }
      
    } else {
      console.error('❌ Kurum eklenemedi:', result);
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

testKurumEkle(); 