# Cursor Kullanım Kuralları (Güncel)

📌 **Bu kurallar, Cursor ile geliştirilen projelerde minimum kullanıcı müdahalesi ile maksimum otomasyon sağlamak amacıyla oluşturulmuştur.**

---

## 1. Dil ve Yanıt Formatı

* Tüm yanıtlar **Türkçe** olmalıdır.
* Açıklamalar sade ve anlaşılır bir dille yazılmalıdır.
* Karmaşık teknik terimlerden kaçınılmalı, gerekiyorsa açıklaması verilmelidir.

---

## 2. Production Ortamı ve Otomasyon

* Bir işlem tamamlandığında, **production ortamı otomatik olarak güncellenir** hale gelmelidir.
* Kullanıcıdan **manuel deployment beklenmemelidir.**

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

## 13. Hata Bulma ve Düzeltme Kuralı (Debug / Fix)

**Amaç:** Cursor, tespit ettiği hataları minimum kullanıcı müdahalesiyle, yapıyı bozmadan ve otomatik olarak düzeltmelidir.

### Kök Neden Analizi:
* Cursor bir hata algıladığında sadece dosya içine bakmakla kalmamalı, İlgili bileşen, API, context, prop zincirini de incelemelidir.
* Hata sadece semptom olarak değil, **kök nedenine (root cause)** kadar analiz edilmelidir.
* Düzenleme yapıldıysa, hangi satırda, ne değişikliğin yapıldığı kullanıcıya özet olarak bildirilmeli ve gerekiyorsa kod bloğu paylaşılmalıdır.

### Hata Tespit ve Raporlama:
* **a.** Hata tespit edildiğinde, hata satırı ve etkilenen dosya net şekilde kullanıcıya gösterilmelidir.
  - Örnek çıktı: `src/pages/Home.tsx dosyasında, 42. satırda hata.`

* **b.** Terminal hataları sadeleştirilerek anlamlı mesajlara dönüştürülmelidir.
  - `TypeError: Cannot read property 'name' of undefined`
  - ✅ **Açıklama:** "Veri henüz yüklenmeden kullanılmış olabilir."

### Otomatik Çözüm:
* **c.** Cursor, hatayı tespit ettiğinde kullanıcıya otomatik çözüm önerisi sunmalı veya doğrudan uygulayabilmelidir.
  - "Bu alana `?.` operatörü eklenerek hata önlenebilir."

* **d.** Düzeltme sadece hatalı kısımda yapılmalı, kodun geri kalanı değiştirilmemelidir.
  - ❌ Dosya yeniden yazılmamalı
  - ✅ Hatalı blok hedeflenmelidir.

* **e.** Düzeltme sonrası sistem otomatik olarak yeniden başlatılabilir hâle gelmelidir.
  - Kullanıcıdan `npm start`, `pnpm dev` gibi manuel müdahale istenmemelidir.

### Sistem Bütünlüğü:
* **f.** Dosya modüler ise, tüm bağlı parçalar kontrol edilmeli ve zincir hatalar engellenmelidir.

* **g.** Hatalar geçici olarak gizlenmemeli, yapısal olarak çözülmelidir.
  - ❌ `try/catch` ile bastırma
  - ✅ Veri kontrolü ve koşullu akış uygulanmalıdır.

### Hata Kategorileri:
* **h.** API hataları ayırt edilmeli, bağlantı mı yoksa veri mi bozuk net belirtilmelidir.

* **i.** Backend hataları ile frontend hataları ayrıştırılmalıdır.
  - **Backend:** veri tutarsızlığı, bağlantı hatası
  - **Frontend:** undefined, null, import, DOM

### Koruma ve Güvenlik:
* **j.** Daha önce yapılan değişiklikler dikkate alınmalı, çakışmalar engellenmelidir.

* **k.** Elle yazılmış özel bloklara Cursor dokunmamalıdır.
  - `// #manuel` gibi işaretlerle korunmuş alanlar varsa atlanmalıdır.

### Test ve Doğrulama:
* **l.** Test dosyası varsa (`test.ts`, `*.spec.ts`), hata düzeltmeden sonra otomatik test yapılmalı ve sonucu kullanıcıya gösterilmelidir.

* **m.** Düzeltme sonrası kullanıcıya değişiklik özeti sunulmalıdır.
  - "3 dosyada şu değişiklikler yapıldı."

### Geri Alma ve Güvenlik:
* **n.** Geri alma (undo) özelliği her hata düzeltmesinden sonra aktif olmalıdır.
  - Kullanıcı tek tıklamayla eski hâline dönebilmelidir.

* **o.** Hata düzeltme işlemleri hızlı değil, doğru ve zincir hatasız olmalıdır.
  - Kod çalışıyor gibi görünse bile arkada bozukluk yaratmamalıdır.



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

---

## 16. Yayın Ortamı (Production) Zorunluluğu ve Local Bağlantı Yasağı

**Uygulama artık Netlify, Railway veya benzeri bir yayına (production) kurulmuş ve API bağlantısı aktif hale gelmişse; bundan sonraki tüm işlemler yayın ortamına göre yapılmalı, Cursor hiçbir şekilde yerel (local) bağlantı, test, öneri, düzeltme yapmamalıdır.**

### ❌ Yasaklanan Tüm Davranışlar:

#### 1. Yerel test ifadesi:
Cursor aşağıdaki gibi ifadeler kullanmamalı ve kullanıcıyı bu tür yönlendirmelere teşvik etmemelidir:

* "Localde çalışıyor olabilir"
* "Yerelde test ettim, sorun görünmüyor"
* "Localden veri geldi ama canlıda bozulmuş"
* "Yerel log alarak kontrol eder misin?"

#### 2. Yerel bağlantı önerisi veya komutu:
* `localhost:3000`, `127.0.0.1`, `vite`, `npm run dev` gibi bağlantılar ve komutlar kesinlikle kullanılmamalı ve önermemelidir.

#### 3. Local kaynaklı düzeltme girişimi:
* Her türlü hata kontrolü, bileşen analizi, API testi veya veri akışı analizi yalnızca yayın ortamındaki bağlantı üzerinden yapılmalıdır.
* Sadece `https://...netlify.app`, `https://...railway.app` gibi production URL'leri kullanılmalıdır.

### 🧹 Temizlik Zorunluluğu:

Eğer sistemde hali hazırda geliştirilmiş veya açılmış olan herhangi bir sayfa, component veya modül içinde:

* `localhost`, `127.0.0.1`, `vite`, `file://` gibi yerel bağlantılar
* `console.log("localde test ettim")` gibi açıklamalar
* Geçici mock dosyalar, sahte veriler

bulunuyorsa:

**🔧 Cursor bunları tespit etmeli ve otomatik olarak temizlemelidir.**

#### Temizlik işlemi sırasında:

* Yerel bağlantılar canlı bağlantı adresiyle değiştirilmelidir.
* Geçici mock veri dosyaları veya local API bağlantıları sistemden kaldırılmalıdır.
* Gerekirse kullanıcıya şöyle bir uyarı verilebilir:

```
❗ Sayfa içinde local bağlantılar tespit edildi. 
Bunlar sistemden kaldırıldı ve canlı bağlantılarla değiştirildi.
```

### ✅ Uygulanacak Sistem Davranışı:

* Tüm testler, hata düzeltmeleri ve veri kontrolleri **yayın ortamı üzerinde** gerçekleştirilmelidir.
* Cursor, yalnızca **Netlify veya Railway üzerinden yayınlanan** API ve sayfa yapılarıyla işlem yapmalıdır.
* Yerel ortamlar artık **referans kabul edilmemelidir**.
* Production URL'leri:
  * Frontend: `https://vardiyaasistani.netlify.app`
  * Backend: `https://hzmbackendveritabani-production.up.railway.app`

### 🚨 Kritik Uyarı:

Bu kural aktif olduktan sonra, Cursor'un herhangi bir yerel geliştirme ortamı önerisi **kesinlikle yasaktır** ve sistem tamamen production odaklı çalışmalıdır.
