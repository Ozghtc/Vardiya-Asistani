# 🚫 YAPILMAYACAKLAR - Vardiya Asistanı Projesi

## ⚠️ **BU DOSYA, YAPILAN HATALARI VE BİR DAHA YAPILMAMASI GEREKENLERİ İÇERİR**

---

## 🔴 **1. API TIMEOUT DEĞİŞİKLİKLERİ**

### ❌ **YAPILMAYACAK:**
```javascript
// ASLA timeout süresini değiştirme!
const timeoutId = setTimeout(() => controller.abort(), 30000); // ❌ YAPMA
const timeoutId = setTimeout(() => controller.abort(), 15000); // ❌ YAPMA
const timeoutId = setTimeout(() => controller.abort(), 8000);  // ❌ YAPMA
```

### 🚨 **NEDEN:**
- Netlify Functions yavaş çalışıyor
- Timeout artırınca bağlantılar birikiyor
- Site tamamen çöküyor (ERR_CONNECTION_TIMED_OUT)

### ✅ **ÇÖZÜM:**
- **10 saniye timeout'ta kal**
- Değiştirme, olduğu gibi bırak

---

## 🔴 **2. RETRY MEKANİZMASI EKLEME**

### ❌ **YAPILMAYACAK:**
```javascript
// ASLA retry mekanizması ekleme!
if (retryCount < 2) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return apiRequest(path, options, retryCount + 1);
}
```

### 🚨 **NEDEN:**
- Her API çağrısı 3 kez tekrarlanıyor
- Sistem aşırı yavaşlıyor
- Netlify Functions patlıyor

### ✅ **ÇÖZÜM:**
- Retry mekanizması EKLEME
- Tek deneme yeterli

---

## 🔴 **3. UPDATEUSER FONKSİYONUNU KARMAŞIKLAŞTIRMA**

### ❌ **YAPILMAYACAK:**
```javascript
// Güncelleme için tüm kullanıcıları çekme!
const currentUsers = await getUsers(usersTableId);
const currentUser = currentUsers.find(user => user.id === userId);
```

### 🚨 **NEDEN:**
- Her güncelleme için tüm kullanıcı listesi çekiliyor
- Gereksiz API yükü
- Performans düşüyor

### ✅ **ÇÖZÜM:**
- Basit tut
- Sadece gelen veriyi güncelle

---

## 🔴 **4. ID PARSING KARMAŞIKLAŞTIRMA**

### ❌ **YAPILMAYACAK:**
```javascript
// Karmaşık ID parsing logic ekleme!
if (departman_id.includes('_D')) {
  departmanKodu = departman_id.split('_D')[1];
  departmanKodu = `D${departmanKodu}`;
} else {
  departmanKodu = 'D1'; // Fallback
}
```

### 🚨 **NEDEN:**
- ID formatları karışıyor
- Tutarsızlık oluşuyor
- Debug zorlaşıyor

### ✅ **ÇÖZÜM:**
- Basit string concatenation kullan
- Edge case'leri düşünme

---

## 🔴 **5. "KALICI ÇÖZÜM" ARAYIŞI**

### ❌ **YAPILMAYACAK:**
- "Kalıcı çözüm" diye agresif değişiklikler
- Çalışan kodu "iyileştirme" çabası
- Production'da deneme yanılma

### 🚨 **NEDEN:**
- Test ortamı yok
- Her değişiklik canlıya gidiyor
- Kullanıcılar etkileniyor

### ✅ **ÇÖZÜM:**
- Çalışıyorsa dokunma
- Minimal değişiklik yap
- "Perfect is the enemy of good"

---

## 🔴 **6. AYNI HATAYI TEKRARLAMA**

### ❌ **YAPILMAYACAK:**
- Site çöktükten sonra aynı yaklaşımı deneme
- "Bu sefer farklı olacak" düşüncesi
- Timeout/retry kombinasyonları

### 🚨 **NEDEN:**
- 3 kez aynı hata yapıldı
- Her seferinde site çöktü
- Kullanıcı güveni azaldı

### ✅ **ÇÖZÜM:**
- Hata yaptıysan dur
- Geri al
- Farklı bir yaklaşım düşün

---

## 📋 **GENEL KURALLAR:**

### 🛑 **ASLA YAPMA:**
1. **Timeout değiştirme**
2. **Retry ekleme**
3. **Çalışan kodu "optimize" etme**
4. **Production'da test yapma**
5. **Karmaşık logic ekleme**

### ✅ **HER ZAMAN YAP:**
1. **Çalışan kodda kal**
2. **Minimal değişiklik**
3. **Basit çözümler**
4. **Kullanıcıyı düşün**
5. **Test et, sonra deploy et**

---

## 🎯 **ÖĞRENİLEN DERS:**

> **"Çalışıyorsa dokunma!"**
> 
> **"Keep It Simple, Stupid (KISS)"**
> 
> **"Premature optimization is the root of all evil"**

---

## 📅 **HATA TARİHÇESİ:**

- **25.07.2025:** API timeout 30sn → Site çöktü
- **25.07.2025:** Timeout 15sn + retry → Site çöktü  
- **25.07.2025:** Timeout 8sn → Site çöktü
- **25.07.2025:** Timeout 20sn + hata handling → Site çöktü

---

**⚠️ NOT:** Bu dosyayı her büyük hata sonrası güncelle! 