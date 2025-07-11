Cursor Kullanım Kuralları (Güncel)
Bu doküman, Cursor kullanımında uyulması gereken temel kuralları tanımlar. Amaç, sade, otomatik, mobil uyumlu ve sorunsuz bir geliştirme süreci sağlamaktır.

1. Dil ve Yanıt Formatı
Tüm yanıtlar Türkçe olmalıdır.

Açıklamalar sade ve anlaşılır bir dille yazılmalıdır.

Karmaşık teknik terimlerden kaçınılmalı, gerekiyorsa açıklaması verilmelidir.

2. Localhost ve Otomasyon
Bir işlem tamamlandığında, localhost otomatik olarak yeniden başlatılabilir hale gelmelidir.

Kullanıcıdan manuel yeniden başlatma beklenmemelidir.

3. Terminal Müdahaleleri
Eğer işlem terminalden yapılmak zorundaysa:

Gerekli izinler (örneğin CORS, RLS) otomatik olarak verilmelidir.

Ardından işlem kendiliğinden tamamlanmalıdır.

Kullanıcıya terminal önerisi sunulmamalıdır.

Terminalden yapılabilecek işlemler, kullanıcıdan talep edilmeden sistem tarafından yapılmalıdır.

4. Kod Müdahalesi ve Sorumluluk
Kod içi veya terminal kaynaklı müdahaleler Cursor tarafından yapılmalıdır.

Kullanıcıdan sadece arayüz (UI) düzeyinde yardım istenmelidir.

Kullanıcıdan console.log, terminal, bash, chmod, psql gibi işlemler beklenmemelidir.

5. Arayüz Kuralları
Tüm sayfalar:

Mobil uyumlu (responsive) olmalıdır.

Hover efektleri desteklemelidir.

Küçük ekranlarda düzgün görünmelidir.

UI öğeleri sade ve sezgisel olmalı, kullanıcıyı yormamalıdır.

6. Uygulama Genel Hedefi
Uygulamanın tüm ekranları cep telefonlarında sorunsuz çalışabilir olmalıdır.

Mobil tarayıcılarda hata veya görüntü bozulması olmamalıdır.

7. Otomatik Büyük Harf Kuralı
Tüm input ve textarea alanlarında yazılan metinler otomatik olarak büyük harfe çevrilmelidir.

Ancak aşağıdaki alanlar bu kurala dahil değildir:

Email adresleri

T.C. Kimlik Numaraları

Telefon numaraları

Uygulama Yöntemi:

useCapitalization hook'u veya

CustomInput bileşeni kullanılmalıdır.

Kullanıcı küçük harf yazsa dahi, görselde ve veride büyük harf olarak görünmelidir (istisnalar hariç).

8. Kapsam Sınırı Kuralı
Cursor bir kod bloğunu işlerken ya da analiz yaparken, yalnızca kendisinden en fazla 5 üst satıra kadar bakmalıdır.

Daha yukarıya çıkıp önceki blokları, açıklamaları ya da tüm dosyayı kontrol etmemelidir.

Kodun sadece hedefe yakın kısmıyla ilgilenmelidir.

9. Kod Satırı Sayısı ve Bölme Kuralı
Cursor tarafından oluşturulan veya yönetilen her bir kod bloğu en fazla 300 satır olabilir.

Kod bloğu 200 satırı geçtiğinde, sistem bu bloğu mantıklı bir yerden ikiye bölmeye hazırlanmalıdır.

Ancak bölme işlemi yapılmadan önce kullanıcıya nasıl bölüneceği sorulmalı ve onayı alınmalıdır.

Örnek:

“Kod bloğu 300 satıra yaklaştı. Şu noktada ikiye bölmemi ister misiniz?”

Kullanıcı onayı alındıktan sonra bölme yapılmalı ve yeni bloklar açık şekilde etiketlenmelidir
(örn. Bölüm 1, Bölüm 2).

📌 Bu kurallar, Cursor ile geliştirilen projelerde minimum kullanıcı müdahalesi ile maksimum otomasyon sağlamak amacıyla oluşturulmuştur.

