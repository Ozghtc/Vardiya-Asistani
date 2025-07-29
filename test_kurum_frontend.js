// FRONTEND KONSOL'DA ÇALIŞTIR
// TEST2 KURUM EKLEME TESTİ

async function testAddKurum() {
  
  // addKurum fonksiyonunu çağır
  const kurumData = {
    kurum_adi: 'TEST2 HASTANESI',
    adres: 'Test Adres 2',
    telefon: '0555987654',
    email: 'test2@hastane.com',
    departmanlar: 'DAHILIYE, CERRAHI',
    birimler: 'DOKTOR, HEMSIRE, TEKNISYEN'
  };
  
  
  try {
    // Bu kodu frontend konsol'da çalıştır
    const result = await addKurum(kurumData);
    
    if (result.success) {
      
      // Kurumları yeniden yükle
      const kurumlar = await getKurumlar(true);
      
      // Yeni eklenen kurumu bul
      const yeniKurum = kurumlar.find(k => k.kurum_adi === 'TEST2 HASTANESI');
      
      if (yeniKurum) {
      }
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// KONSOL'DA ÇALIŞTIR:
testAddKurum(); 