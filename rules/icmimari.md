ersonel Listesi’nde Ne Görecek?
Kullanıcı, yetkili olduğu tüm departman/birimlerin personelini görebilir.
Her personelin altında departman ve birim bilgisi görünür.
Filtreleme: Departman ve birim seçilebilir (dropdown veya sekme).
DÜZENLEYEBİLİR yetkisi varsa:
Düzenle/Sil butonları aktif.
Input’lar aktif.
GÖREBİLİR yetkisi varsa:
Sadece okuma (readonly) görünümü.
Input’lar disabled, butonlar pasif veya hiç görünmez.
2️⃣ Nöbet Planlama (Takvim) Ekranında Ne Yapabilecek?
Kullanıcı, yetkili olduğu departman/birimlerin nöbetlerini görebilir.
DÜZENLEYEBİLİR yetkisi varsa:
Nöbet ekleyebilir, değiştirebilir, silebilir.
GÖREBİLİR yetkisi varsa:
Sadece nöbetleri görüntüleyebilir, değişiklik yapamaz.
Takvimde departman/birim filtreleri olur.
Sadece yetkili olunan departman/birimler listelenir.
3️⃣ Sistem İç Mimarisi (Kodlama Açısından)
Kullanıcı profili şöyle olmalı:
Apply to icmimari.md
  interface KullaniciYetkisi {
    departman: string;
    birim: string;
    rol: 'GÖREBİLİR' | 'DÜZENLEYEBİLİR';
  }
  // Kullanıcı örneği:
  {
    id: 'u1',
    name: 'Hatice Altıntaş',
    yetkiler: [
      { departman: 'ACIL SERVIS', birim: 'HEMSIRE', rol: 'DÜZENLEYEBİLİR' },
      { departman: 'YOGUN BAKIM', birim: 'HEMSIRE', rol: 'GÖREBİLİR' },
    ]
  }
Ekranda departman/birim seçildiğinde:
Apply to icmimari.md
  const aktifYetki = currentUser.yetkiler.find(
    y => y.departman === seciliDepartman && y.birim === seciliBirim
  );
  const kullaniciDuzenleyebilirMi = aktifYetki?.rol === 'DÜZENLEYEBİLİR';
Bu kontrol ile:
Butonları göster/gizle.
Input’ları aktif/pasif yap.
API’ye gönderilen isteklerde de yetkiyi kontrol et.
4️⃣ Personel Grupları ve Görünüm
Önerilen Yol: Departman & Birim bazlı filtreleme.
Kullanıcı, sadece yetkili olduğu departman/birimleri görebilir.
Her departman/birim ayrı bir grup gibi görünür.
Kullanıcı, “ACİL SERVİS” seçerse sadece oradaki personeli görür ve düzenleyebilir.
“YOĞUN BAKIM” seçerse sadece oradaki personeli görür, düzenleyemez.
Karmaşa olmaz, çünkü kullanıcı sadece yetkili olduğu grupları görür ve her biri için yetkisi ayrı kontrol edilir.
5️⃣ Ekstra Notlar
Yetkilerde bir değişiklik olursa (ör. admin yeni yetki eklerse), kullanıcıya bildirim veya otomatik güncelleme yapılabilir.
Arayüzde yetkiler net gösterilmeli (sağ alttaki kutu gibi).
Her işlemde (hem arayüzde hem backend’de) yetki kontrolü yapılmalı.
Kısacası:
Kullanıcı, yetkili olduğu departman/birimleri filtreleyerek görür. Her biri için ayrı yetki kontrolü yapılır. Düzenleme/görüntüleme hakları buna göre belirlenir.
Bu yapı hem kullanıcı deneyimi hem de güvenlik açısından en sağlıklı ve yönetilebilir çözümdür.