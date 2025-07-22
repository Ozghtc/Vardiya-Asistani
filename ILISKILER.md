# Vardiyali Nobet Asistani - Tablo İlişkileri Dokümantasyonu

## 🔗 **MEVCUT İLİŞKİ DURUMU**

**HZM API Durumu:** İlişki kurma endpoint'leri mevcut değil ❌  
**Çözüm:** Frontend'de manuel ilişki yönetimi ✅

---

## 📊 **TABLO YAPISI VE İLİŞKİLER**

### 🏥 **ANA TABLOLAR:**

#### 1️⃣ **KURUMLAR** (ID: 30) - `kurumlar_hiyerarsik`
```
Alanlar:
- kurum_id (string, primary) - "01", "02", "03"...
- kurum_adi (string) - Kurum adı
- adres (string) - Kurum adresi
- telefon (string) - Kurum telefonu
- email (string) - Kurum e-postası
- DEPARTMAN_ID (string) - "01_D1,01_D2" (virgülle ayrılmış)
- DEPARTMAN_ADI (string) - "Acil Servis,Dahiliye" (virgülle ayrılmış)
- BIRIM_ID (string) - "01_D1_B1,01_D2_B1" (virgülle ayrılmış)
- BIRIM (string) - "Acil Hemşire,Dahiliye Hemşire" (virgülle ayrılmış)
```

#### 2️⃣ **DEPARTMANLAR** (ID: 34) - `departmanlar`
```
Alanlar:
- departman_id (string, primary) - "01_D1", "01_D2"...
- departman_adi (string) - Departman adı
- kurum_id (string, foreign key) - "01" → kurumlar.kurum_id
- aktif_mi (boolean) - Aktif/pasif durumu
```

#### 3️⃣ **BİRİMLER** (ID: 35) - `birimler`
```
Alanlar:
- birim_id (string, primary) - "01_D1_B1", "01_D2_B1"...
- birim_adi (string) - Birim adı
- kurum_id (string, foreign key) - "01" → kurumlar.kurum_id
- aktif_mi (boolean) - Aktif/pasif durumu
```

#### 4️⃣ **KULLANICILAR** (ID: 33) - `kullanicilar_final`
```
Alanlar:
- kullanici_id (string, primary) - Admin: "01", Normal: "01_D1_B1_P1"
- name (string) - Kullanıcı adı soyadı
- email (string) - E-posta adresi
- password (string) - Şifre
- phone (string) - Telefon numarası
- rol (string) - "admin", "yonetici", "personel"
- kurum_id (string, foreign key) - "01" → kurumlar.kurum_id
- departman_id (string, foreign key) - "01_D1" → departmanlar.departman_id
- birim_id (string, foreign key) - "01_D1_B1" → birimler.birim_id
- aktif_mi (boolean) - Aktif/pasif durumu
```

---

## 🔗 **İLİŞKİ ŞEMASI**

```
KURUMLAR (01)
├── DEPARTMANLAR
│   ├── 01_D1 (Acil Servis)
│   └── 01_D2 (Dahiliye)
├── BİRİMLER
│   ├── 01_D1_B1 (Acil Hemşire)
│   └── 01_D2_B1 (Dahiliye Hemşire)
└── KULLANICILAR
    ├── 01 (Admin - bağımsız)
    ├── 01_D1_B1_P1 (Personel - Acil Hemşire)
    └── 01_D2_B1_P1 (Personel - Dahiliye Hemşire)
```

---

## 🛠️ **FRONTEND'DE MANUEL İLİŞKİ YÖNETİMİ**

### 📁 **Dosya Konumları:**
- **Ana API:** `src/lib/api.ts`
- **Kurum Yönetimi:** `src/admin/KurumYonetimi/`
- **Kullanıcı Yönetimi:** `src/admin/KullaniciYonetimi/`

### 🔧 **Manuel İlişki Fonksiyonları:**

#### 1️⃣ **Kurum-Departman İlişkisi:**
```typescript
// src/lib/api.ts - addKurum fonksiyonu
const departmanIdList = departmanlar.split(',')
  .filter(d => d.trim())
  .map((_, index) => `${newKurumId}_D${index + 1}`)
  .join(',');

// Her kurum eklendiğinde otomatik departman ID'leri oluşturulur
```

#### 2️⃣ **Kurum-Birim İlişkisi:**
```typescript
// src/lib/api.ts - addKurum fonksiyonu
const birimIdList = birimler.split(',')
  .filter(b => b.trim())
  .map((_, index) => `${newKurumId}_D1_B${index + 1}`)
  .join(',');

// Her kurum eklendiğinde otomatik birim ID'leri oluşturulur
```

#### 3️⃣ **Veri Aktarım Fonksiyonları:**
```typescript
// src/lib/api.ts
export const aktarDepartmanVerileri = async () => {
  // Kurumlar tablosundan departman verilerini departmanlar tablosuna aktarır
}

export const aktarBirimVerileri = async () => {
  // Kurumlar tablosundan birim verilerini birimler tablosuna aktarır
}
```

#### 4️⃣ **İlişkisel Veri Okuma:**
```typescript
// Frontend'de JOIN işlemleri
const kurumlar = await getKurumlar();
const departmanlar = await getDepartmanlar();
const birimler = await getBirimler();

// Manuel JOIN
const kurumDepartmanlar = kurumlar.map(kurum => ({
  ...kurum,
  departmanlar: departmanlar.filter(dept => dept.kurum_id === kurum.kurum_id)
}));
```

---

## 🔄 **VERİ TUTARLILIK KONTROLLERI**

### ✅ **Ekleme Sırasında Kontroller:**
```typescript
// Departman eklerken kurum_id kontrolü
const kurum = await getKurumlar().find(k => k.kurum_id === departmanData.kurum_id);
if (!kurum) {
  throw new Error('Geçersiz kurum_id');
}

// Birim eklerken kurum_id kontrolü
const kurum = await getKurumlar().find(k => k.kurum_id === birimData.kurum_id);
if (!kurum) {
  throw new Error('Geçersiz kurum_id');
}
```

### 🗑️ **Silme Sırasında Cascade Kontroller:**
```typescript
// Kurum silinirken bağlı departman/birim kontrolü
const bagliDepartmanlar = await getDepartmanlar().filter(d => d.kurum_id === kurumId);
const bagliBirimler = await getBirimler().filter(b => b.kurum_id === kurumId);

if (bagliDepartmanlar.length > 0 || bagliBirimler.length > 0) {
  throw new Error('Bu kuruma bağlı departman/birim var, önce onları silin');
}
```

---

## 🎯 **API DÜZELİNCE YAPILACAKLAR**

### 🔧 **HZM API İlişki Endpoint'leri Geldiğinde:**

#### 1️⃣ **Foreign Key Tanımlamaları:**
```typescript
// Gelecek API endpoint'leri
POST /api/v1/tables/{tableId}/relationships
{
  "sourceField": "kurum_id",
  "targetTable": 30,
  "targetField": "kurum_id",
  "onDelete": "CASCADE",
  "onUpdate": "CASCADE"
}
```

#### 2️⃣ **Otomatik JOIN Sorguları:**
```typescript
// Gelecek API endpoint'leri
GET /api/v1/data/table/{tableId}/join?with=departmanlar,birimler
```

#### 3️⃣ **Constraint Kontrolleri:**
```typescript
// Gelecek API endpoint'leri
GET /api/v1/tables/{tableId}/constraints
POST /api/v1/tables/{tableId}/constraints
```

---

## 📋 **MEVCUT MANUEL ÇÖZÜMLER**

### ✅ **Çalışan Sistemler:**
1. **Hiyerarşik ID sistemi** - "01", "01_D1", "01_D1_B1" formatı
2. **Frontend JOIN işlemleri** - Manuel veri birleştirme
3. **Veri tutarlılık kontrolleri** - JavaScript ile validation
4. **Cache yönetimi** - İlişkili verilerde cache temizleme

### 🔄 **Otomatik İşlemler:**
1. **Kurum ekleme** → Departman/Birim ID'leri otomatik oluşturulur
2. **Veri aktarımı** → Kurumlardan departman/birim tablolarına aktarım
3. **Cache temizleme** → İlişkili tablolarda otomatik cache temizleme

---

## ⚠️ **DİKKAT EDİLECEKLER**

### 🚨 **Manuel Sistem Riskleri:**
1. **Veri tutarsızlığı** - Frontend kontrollerine bağımlılık
2. **Performance** - Çoklu API çağrıları gerekli
3. **Complexity** - Manuel JOIN işlemleri karmaşık

### 🛡️ **Güvenlik Önlemleri:**
1. **Her ekleme/güncelleme** öncesi ilişki kontrolü
2. **Cascade delete** manuel implementasyon
3. **Data validation** frontend'de zorunlu

---

## 🔮 **GELECEK PLANLAR**

### 📈 **HZM API Geliştirme Beklentileri:**
1. **Foreign Key** desteği
2. **JOIN sorguları** native API'de
3. **Constraint management** endpoint'leri
4. **Transaction** desteği
5. **Schema migration** araçları

### 🔄 **Migration Planı:**
```typescript
// API düzelince otomatik migration
const migrateToNativeRelationships = async () => {
  // 1. Mevcut manuel ilişkileri tespit et
  // 2. HZM API ile native ilişkiler oluştur
  // 3. Frontend kodunu yeni API'ye adapte et
  // 4. Manuel JOIN kodlarını kaldır
}
```

---

## 📞 **Destek ve İletişim**
- **Geliştirici:** Özgür Altıntaş
- **Email:** ozgurhzm@gmail.com
- **Proje:** Vardiyali Nobet Asistani
- **Son Güncelleme:** 22.07.2025

---

*Bu dokümantasyon HZM API'de ilişki desteği gelene kadar güncel kalacak ve sistem düzeldiğinde otomatik migration için rehber olarak kullanılacaktır.* 