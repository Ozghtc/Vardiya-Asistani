// FRONTEND KONSOL'DA ÇALIŞTIR
// TEST2 KURUM EKLEME TESTİ

async function testAddKurum() {
  console.log('🔄 TEST2 HASTANESI ekleniyor...');
  
  // addKurum fonksiyonunu çağır
  const kurumData = {
    kurum_adi: 'TEST2 HASTANESI',
    adres: 'Test Adres 2',
    telefon: '0555987654',
    email: 'test2@hastane.com',
    departmanlar: 'DAHILIYE, CERRAHI',
    birimler: 'DOKTOR, HEMSIRE, TEKNISYEN'
  };
  
  console.log('📤 Kurum verisi:', kurumData);
  
  try {
    // Bu kodu frontend konsol'da çalıştır
    const result = await addKurum(kurumData);
    console.log('✅ Sonuç:', result);
    
    if (result.success) {
      console.log('🎉 TEST2 HASTANESI başarıyla eklendi!');
      console.log('🆔 Yeni Kurum ID:', result.newKurumId);
      
      // Kurumları yeniden yükle
      const kurumlar = await getKurumlar(true);
      console.log('📋 Güncel kurumlar:', kurumlar);
      
      // Yeni eklenen kurumu bul
      const yeniKurum = kurumlar.find(k => k.kurum_adi === 'TEST2 HASTANESI');
      console.log('🏥 Yeni kurum:', yeniKurum);
      
      if (yeniKurum) {
        console.log('🏷️ DEPARTMAN_ID:', yeniKurum.DEPARTMAN_ID);
        console.log('🏷️ DEPARTMAN_ADI:', yeniKurum.DEPARTMAN_ADI);
        console.log('🏷️ BIRIM_ID:', yeniKurum.BIRIM_ID);
        console.log('🏷️ BIRIM:', yeniKurum.BIRIM);
      }
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// KONSOL'DA ÇALIŞTIR:
testAddKurum(); 