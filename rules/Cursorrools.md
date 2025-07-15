# Cursor Kullanım Kuralları (Güncel)

📌 **Bu kurallar, Cursor ile geliştirilen projelerde minimum kullanıcı müdahalesi ile maksimum otomasyon sağlamak amacıyla oluşturulmuştur.**

---

## 1. Dil ve Yanıt Formatı

* Tüm yanıtlar **Türkçe** olmalıdır.
* Açıklamalar sade ve anlaşılır bir dille yazılmalıdır.
* Karmaşık teknik terimlerden kaçınılmalı, gerekiyorsa açıklaması verilmelidir.

---

## 2. Localhost ve Otomasyon

* Bir işlem tamamlandığında, **localhost otomatik olarak yeniden başlatılabilir** hale gelmelidir.
* Kullanıcıdan **manuel yeniden başlatma beklenmemelidir.**

---

## 3. Terminal Müdahaleleri

* Terminalde yapılması gereken işlemler (CORS, RLS, vs.) **otomatik olarak verilmelidir.**
* Kullanıcıya terminal komutu önerisi **sunulmamalıdır.**
* `console.log`, `bash`, `chmod`, `psql` gibi terminal komutları **Cursor tarafından uygulanmalı**, kullanıcıdan beklenmemelidir.

---

## 4. Kod Müdahalesi ve Sorumluluk

* Kod içi veya terminal kaynaklı tüm müdahaleler **Cursor tarafından yapılmalıdır.**
* Kullanıcıdan yalnızca **arayüz (UI)** düzeyinde bilgi veya onay alınmalıdır.
* Kodun mantığı bozulmadan düzenleme yapılmalı, geri dönüş kontrolü Cursor tarafından sağlanmalıdır.

---

## 5. Arayüz Kuralları

* Tüm sayfalar **mobil uyumlu (responsive)** olmalıdır.
* Hover, scroll, collapse gibi tüm görsel öğeler her cihazda çalışmalıdır.
* UI öğeleri sade, sezgisel ve dokunmatik uyumlu tasarlanmalıdır.

---

## 6. Uygulama Genel Hedefi

* Uygulamanın tüm ekranları **mobil tarayıcılarda sorunsuz** çalışmalıdır.
* Kullanıcı herhangi bir hata veya görüntü bozulması ile karşılaşmamalıdır.
* Sayfalar dar ekran için yeniden boyutlanmalı ve responsive grid yapısı kullanılmalıdır.

---

## 7. Otomatik Büyük Harf Kuralı

* Tüm `input` ve `textarea` alanlarında yazılan metinler **otomatik olarak büyük harfe çevrilmelidir.**
* İstisnalar:

  * E-posta adresleri
  * T.C. Kimlik No
  * Telefon numarası
* Bunun için `useCapitalization` hook'u veya `CustomInput` bileşeni kullanılmalıdır.
* Kullanıcı küçük harf yazsa bile, form görselinde ve veri tabanına kayıtta **büyük harf** olmalıdır (istisnalar hariç).

---

## 8. Kapsam Sınırı Kuralı

* Cursor bir kod bloğunu analiz ederken **en fazla 5 satır yukarıya kadar** kontrol etmelidir.
* Daha eski satır veya dosya başı, yorum satırları veya açıklama blokları **göz ardı edilmelidir.**
* Bu, yanlış bağlantı veya eski tanım hatalarının önüne geçmek için zorunludur.

---

## 9. Kod Satırı Sayısı ve Bölme Kuralı

* Cursor tarafından oluşturulan her kod bloğu en fazla **300 satır** olabilir.
* 200 satırı geçtiğinde sistem:

  * **Uyarı mesajı** göndermeli
  * Kullanıcıdan onay alarak mantıklı yerden **bölme** işlemi yapmalıdır.
* Otomatik bölme yapılmamalı, her parça `Bölüm 1`, `Bölüm 2` şeklinde işaretlenmelidir.

---

## 10. Otomatik GitHub Push Kuralı

* Proje bir GitHub reposuna bağlıysa, her değişiklik sonrasında sistem:

  * `git add .`
  * `git commit -m "..."`
  * `git push` işlemlerini **otomatik olarak yapmalıdır.**
* Commit mesajları açık ve anlamlı olmalıdır:

  * `feat: login formu eklendi`
  * `fix: tablo ilişkisi düzenlendi`
* Öncesinde çalışma alanı temizlenmeli ve çakışma kontrolü yapılmalıdır.

---

## 11. Dosya Silme Güvenlik Kuralı

* Cursor bir dosyayı silmek istediğinde:

  * Tam dizin yolu kullanıcıya gösterilmelidir.
  * "Evet", "Sil", "Onaylıyorum" gibi doğrudan komut olmadan silme **yapılmamalıdır.**
* Silme işlemi başarılıysa detaylı bilgilendirme gösterilmelidir.

---

## 12. Kod Bölme ve Temizleme Kuralı

* Uzun dosyalar (800+ satır) parçalara ayrılmalı ve çalışabilir yapıda yeniden organize edilmelidir.
* **`src/` klasörü dışına çıkılmamalı**, sistem ikinci bir `src/` klasörü oluşturmamalıdır.
* Kod bağlantıları (import/export) **otomatik yapılandırılmalı**, test edilmeli, eski dosya silinmelidir.

---

## 13. Hata Bulma ve Düzeltme Kuralı

* Cursor bir hata algıladığında sadece dosya içine bakmakla kalmamalı, İlgili bileşen, API, context, prop zincirini de incelemelidir.
* Hata sadece semptom olarak değil, **kök nedenine (root cause)** kadar analiz edilmelidir.
* Düzenleme yapıldıysa, hangi satırda, ne değişikliğin yapıldığı kullanıcıya özet olarak bildirilmeli ve gerekiyorsa kod bloğu paylaşılmalıdır.

---

## 14. Müdahale ve Onay Kuralı

* Cursor belirgin hatalarda **doğrudan düzenleme** yapabilir.
* Ancak kullanıcı bir öneri sorusu sorduğunda (**"Bölünmeli mi?", "Silinsin mi?"** gibi):

  * Sistem **hiçbir işlem yapmamalıdır.**
  * Net onay (**evet, uygundur, yap**) almadan adım atılmamalıdır.

---

## 15. Direkt Tablo Oluşturma Kuralı (HZM Veri Tabanı)

* Kullanıcı **"tablo oluşturmamız gerekiyor"** dediğinde, Cursor **frontend'de kod yazmaz**.
* Cursor **doğrudan terminal'den HZM API'ye istek atarak** tabloyu oluşturur.
* **Hiçbir otomatik sistem, useEffect, veya frontend kodu yazılmaz.**

### Direkt Oluşturma Süreci:

* Kullanıcı tablo ihtiyacı belirttiğinde:
  1. Cursor **terminal'den curl komutu** ile HZM API'ye bağlanır
  2. **Doğrudan tablo oluşturur** (POST /api/v1/tables/project/5)
  3. **Field'ları ekler** (POST /api/v1/tables/.../fields)
  4. **Sonucu doğrular** (GET /api/v1/tables/project/5)

### Yasak Yaklaşımlar:

* ❌ Frontend'de otomatik tablo oluşturma kodu yazma
* ❌ useEffect ile sayfa yüklendiğinde kontrol etme
* ❌ createTable fonksiyonları yazma
* ❌ Mock response'lar yazma

### Doğru Yaklaşım:

* ✅ Terminal'den direkt API çağrısı
* ✅ Curl komutu ile tablo oluşturma
* ✅ Gerçek sonuç doğrulama
* ✅ Kullanıcıya net bilgi verme

### Hata Durumları:

* Tablo oluşturulamazsa, hata mesajı detaylı ve yapısal olmalıdır:

```
❌ Tablo eklenemedi
📍 Hata Türü: Yetkilendirme Hatası (401)
🔍 Açıklama: HZM API anahtarı yetersiz
✅ Çözüm: Direkt HZM panelinden kontrol edilmeli
```
