## ⚠️ Hata Düzeltme Kuralları

Lütfen tüm hata düzeltmelerini **Cursor Kullanım Kuralları**'na *tam uyumlu* şekilde gerçekleştir. Aşağıdaki maddeler **zorunludur** ve ihlal edilmemelidir:

1. **Kurallara Aykırı Düzeltme Yapılamaz**  
   Hatalar sadece tanımlanmış kurallara uygun şekilde giderilmelidir. Geçici çözümler veya kural dışı müdahaleler kabul edilmez.

2. **`localStorage` Kullanımı YASAKTIR**  
   Uygulama içinde `localStorage`, `sessionStorage` veya benzeri tarayıcı tabanlı veri saklama yöntemleri **kesinlikle kullanılmamalıdır**.

3. **Kodun İçine Veri Gömme YASAKTIR**  
   Kullanıcı bilgisi, yapılandırma ayarları veya test verisi gibi herhangi bir bilgi programın içine **elle yazılamaz**. Kod içine gömülü çözümlerle hatayı "çalışıyor gibi göstermek" **yasaktır**.

4. **Gerçek ve Kalıcı Düzeltme Yapılmalıdır**  
   Hatalar simülasyon, koşul kırma (örneğin `if(true)`), veya veri manipülasyonu gibi yöntemlerle geçici olarak bastırılamaz.  
   Düzeltme, sistemin **gerçek şartlarda doğru çalışmasını** sağlamalıdır.

5. **Local Bağlantılar (localhost) Derhal Kaldırılmalıdır**  
   Düzenlenen dosyada `localhost`, `127.0.0.1`, `vite`, `npm run dev`, vb. ifadeler yer alıyorsa, bunlar **tamamen temizlenmeli** ve sistem yalnızca yayındaki (production) bağlantıya göre çalışmalıdır.  
   Yayın ortamına geçildiyse, local bağlantıların sistem içinde bulunması **yasaktır**.

> 🛑 **Unutma:** Düzeltmeler, sürdürülebilir, kontrol edilebilir ve her ortamda sorunsuz çalışacak şekilde uygulanmalıdır.
