# Hiyerarşik ID Sistemi - Tablo Oluşturma Dokümantasyonu

## 🎯 Sistem Yapısı

### ID Kodlama Mantığı:
```
KURUM:     01, 02, 03...
DEPARTMAN: 01_D1, 01_D2, 02_D1... (Kuruma bağlı)
BİRİM:     01_B1, 01_B2, 02_B1... (Kuruma bağlı - departmana değil!)
YÖNETİCİ:  01_D1_B1_Y1, 01_D1_B1_Y2... (Kurum+Departman+Birim+Rol)
PERSONEL:  01_D1_B1_P1, 01_D1_B1_P2... (Kurum+Departman+Birim+Rol)
```

### ⚠️ **ÖNEMLİ NOT:**
- **DEPARTMAN ve BİRİM** ayrı ayrı **KURUMA BAĞLI**
- **KULLANICILAR** hem departmana hem birime hem kuruma bağlı
- **YÖNETİCİLER** Y1, Y2, Y3... ile numaralandırılır
- **PERSONELLER** P1, P2, P3... ile numaralandırılır

## 📋 Tablo Yapıları

### 1. KURUMLAR TABLOSU
```sql
CREATE TABLE kurumlar (
  id SERIAL PRIMARY KEY,
  kurum_id VARCHAR(10) UNIQUE NOT NULL,
  kurum_adi VARCHAR(255) NOT NULL,
  adres TEXT,
  telefon VARCHAR(20),
  email VARCHAR(100),
  vergi_no VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Örnek Veriler:**
| id | kurum_id | kurum_adi | adres | telefon | email |
|----|----------|-----------|-------|---------|-------|
| 1 | 01 | Acıbadem Hastanesi | İstanbul | 02121234567 | info@acibadem.com |
| 2 | 02 | Memorial Hastanesi | Ankara | 03121234567 | info@memorial.com |
| 3 | 03 | Medipol Hastanesi | İzmir | 02321234567 | info@medipol.com |

### 2. DEPARTMANLAR TABLOSU
```sql
CREATE TABLE departmanlar (
  id SERIAL PRIMARY KEY,
  departman_id VARCHAR(20) UNIQUE NOT NULL,
  departman_adi VARCHAR(255) NOT NULL,
  kurum_id VARCHAR(10) NOT NULL,
  aciklama TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (kurum_id) REFERENCES kurumlar(kurum_id) ON DELETE CASCADE
);
```

**Örnek Veriler:**
| id | departman_id | departman_adi | kurum_id | aciklama |
|----|--------------|---------------|----------|----------|
| 1 | 01_D1 | Tıp Departmanı | 01 | Hasta tedavi hizmetleri |
| 2 | 01_D2 | İdari Departman | 01 | Yönetim ve destek hizmetleri |
| 3 | 01_D3 | Teknik Departman | 01 | Teknik destek ve bakım |
| 4 | 02_D1 | Tıp Departmanı | 02 | Hasta tedavi hizmetleri |
| 5 | 02_D2 | Mali İşler Departmanı | 02 | Finansal işlemler |

### 3. BİRİMLER TABLOSU
```sql
CREATE TABLE birimler (
  id SERIAL PRIMARY KEY,
  birim_id VARCHAR(20) UNIQUE NOT NULL,
  birim_adi VARCHAR(255) NOT NULL,
  kurum_id VARCHAR(10) NOT NULL,
  aciklama TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (kurum_id) REFERENCES kurumlar(kurum_id) ON DELETE CASCADE
);
```

**Örnek Veriler:**
| id | birim_id | birim_adi | kurum_id | aciklama |
|----|----------|-----------|----------|----------|
| 1 | 01_B1 | Hemşire | 01 | Hemşirelik hizmetleri |
| 2 | 01_B2 | Doktor | 01 | Doktorluk hizmetleri |
| 3 | 01_B3 | Teknisyen | 01 | Teknik destek |
| 4 | 02_B1 | İdari Personel | 02 | İdari işlemler |
| 5 | 02_B2 | Güvenlik | 02 | Güvenlik hizmetleri |
| 6 | 03_B1 | Temizlik | 03 | Temizlik hizmetleri |

### 4. PERSONELLER TABLOSU
```sql
CREATE TABLE personeller (
  id SERIAL PRIMARY KEY,
  personel_id VARCHAR(40) UNIQUE NOT NULL,
  adi_soyadi VARCHAR(255) NOT NULL,
  personel_tipi ENUM('YONETICI', 'PERSONEL') NOT NULL,
  birim_id VARCHAR(30) NOT NULL,
  pozisyon VARCHAR(100),
  tc_no VARCHAR(11) UNIQUE,
  telefon VARCHAR(20),
  email VARCHAR(100),
  adres TEXT,
  maas DECIMAL(10,2),
  ise_giris_tarihi DATE,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (birim_id) REFERENCES birimler(birim_id) ON DELETE CASCADE
);
```

**Örnek Veriler:**
| id | personel_id | adi_soyadi | personel_tipi | kurum_id | departman_id | birim_id | pozisyon | tc_no | telefon |
|----|-------------|------------|---------------|----------|--------------|----------|----------|-------|---------|
| 1 | 01_D1_B1_Y1 | Dr. Ali Vural | YONETICI | 01 | 01_D1 | 01_B1 | Başhekim | 12345678901 | 05551234567 |
| 2 | 01_D1_B1_P1 | Ayşe Kaya | PERSONEL | 01 | 01_D1 | 01_B1 | Hemşire | 23456789012 | 05552345678 |
| 3 | 01_D2_B2_P1 | Mehmet Yılmaz | PERSONEL | 01 | 01_D2 | 01_B2 | Doktor | 34567890123 | 05553456789 |
| 4 | 01_D1_B1_Y2 | Dr. Fatma Demir | YONETICI | 01 | 01_D1 | 01_B1 | Hemşire Başı | 45678901234 | 05554567890 |
| 5 | 02_D1_B1_Y1 | Selin Özkan | YONETICI | 02 | 02_D1 | 02_B1 | İK Müdürü | 56789012345 | 05555678901 |
| 6 | 02_D1_B1_P1 | Can Acar | PERSONEL | 02 | 02_D1 | 02_B1 | İK Uzmanı | 67890123456 | 05556789012 |

## 🔧 Tablo Oluşturma Komutları

### Terminal'den Sırasıyla:

```bash
# 1. Kurumlar tablosu oluştur
curl -X POST "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "kurumlar", "description": "Kurum bilgileri tablosu"}'

# 2. Departmanlar tablosu oluştur  
curl -X POST "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "departmanlar", "description": "Departman bilgileri tablosu"}'

# 3. Birimler tablosu oluştur
curl -X POST "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "birimler", "description": "Birim bilgileri tablosu"}'

# 4. Personeller tablosu oluştur
curl -X POST "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "personeller", "description": "Personel bilgileri tablosu"}'
```

## 📊 Field Ekleme Örnekleri

### Kurumlar Tablosu Field'ları:
```bash
# kurum_id field
curl -X POST "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/5/TABLE_ID/fields" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "kurum_id", "type": "string", "isRequired": true}'

# kurum_adi field
curl -X POST "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/5/TABLE_ID/fields" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "kurum_adi", "type": "string", "isRequired": true}'

# telefon field
curl -X POST "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/5/TABLE_ID/fields" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "telefon", "type": "string", "isRequired": false}'
```

## 🔍 Sorgu Örnekleri

### JavaScript'te ID Parse Fonksiyonu:
```javascript
function parsePersonelId(personelId) {
  const parts = personelId.split('_');
  return {
    kurumId: parts[0],                    // "01"
    departmanId: parts.slice(0,2).join('_'), // "01_D1"  
    birimId: parts.slice(0,3).join('_'),     // "01_D1_B1"
    personelTipi: parts[3][0],               // "Y" veya "P"
    personelNo: parts[3].slice(1)            // "1"
  };
}

// Kullanım
const info = parsePersonelId("01_D1_B1_P1");
console.log(info);
// { kurumId: "01", departmanId: "01_D1", birimId: "01_D1_B1", personelTipi: "P", personelNo: "1" }
```

### Filtreleme Örnekleri:
```javascript
// Belirli kurumun tüm personeli
const kurumPersoneli = personeller.filter(p => p.personel_id.startsWith("01_"));

// Belirli departmanın tüm personeli  
const departmanPersoneli = personeller.filter(p => p.personel_id.startsWith("01_D1_"));

// Belirli birimin tüm personeli
const birimPersoneli = personeller.filter(p => p.personel_id.startsWith("01_D1_B1_"));

// Sadece yöneticiler
const yoneticiler = personeller.filter(p => p.personel_id.includes("_Y"));

// Sadece personeller
const calisanlar = personeller.filter(p => p.personel_id.includes("_P"));
```

## 🎯 ID Oluşturma Algoritması

### Otomatik ID Oluşturma:
```javascript
// Yeni kurum ID'si
function generateKurumId(existingKurumlar) {
  const maxId = Math.max(...existingKurumlar.map(k => parseInt(k.kurum_id)));
  return String(maxId + 1).padStart(2, '0'); // "01", "02", "03"...
}

// Yeni departman ID'si
function generateDepartmanId(kurumId, existingDepartmanlar) {
  const kurumDepartmanlari = existingDepartmanlar.filter(d => d.kurum_id === kurumId);
  const maxDeptNo = Math.max(...kurumDepartmanlari.map(d => parseInt(d.departman_id.split('_D')[1])));
  return `${kurumId}_D${maxDeptNo + 1}`; // "01_D1", "01_D2"...
}

// Yeni birim ID'si  
function generateBirimId(departmanId, existingBirimler) {
  const departmanBirimleri = existingBirimler.filter(b => b.departman_id === departmanId);
  const maxBirimNo = Math.max(...departmanBirimleri.map(b => parseInt(b.birim_id.split('_B')[1])));
  return `${departmanId}_B${maxBirimNo + 1}`; // "01_D1_B1", "01_D1_B2"...
}

// Yeni personel ID'si
function generatePersonelId(birimId, personelTipi, existingPersoneller) {
  const birimPersonelleri = existingPersoneller.filter(p => 
    p.birim_id === birimId && p.personel_tipi === personelTipi
  );
  const maxPersonelNo = Math.max(...birimPersonelleri.map(p => 
    parseInt(p.personel_id.split('_').pop().slice(1))
  ));
  const tip = personelTipi === 'YONETICI' ? 'Y' : 'P';
  return `${birimId}_${tip}${maxPersonelNo + 1}`; // "01_D1_B1_P1", "01_D1_B1_Y1"...
}
```

## ✅ Avantajlar

1. **Benzersizlik Garantisi**: Her ID kesinlikle unique
2. **Hiyerarşi Görünürlüğü**: ID'den hemen ilişki anlaşılır
3. **Kolay Filtreleme**: String başlangıcına göre hızlı filtreleme
4. **Ölçeklenebilirlik**: Sınırsız kurum/departman/birim eklenebilir
5. **Bakım Kolaylığı**: İlişkiler ID'de gömülü olduğu için JOIN gereksiz

## 📝 Notlar

- ID'ler string olarak saklanır (VARCHAR)
- Foreign key ilişkileri CASCADE DELETE ile korunur
- Personel tipi ENUM ile kontrol edilir (YONETICI/PERSONEL)
- Tüm tablolarda created_at/updated_at timestamp'leri otomatik
- TC No unique constraint ile tekrar engellenir

## 🚀 Uygulama Stratejisi

### Cursor Kuralları Uyumlu Yaklaşım:
1. **Terminal'den Direkt Oluşturma** - Frontend kod yazmadan
2. **JWT Token ile Kimlik Doğrulama** - Güvenli API erişimi
3. **Sıralı Tablo Oluşturma** - Bağımlılık sırasına göre
4. **Otomatik Field Ekleme** - Tüm gerekli alanları toplu olarak
5. **Veri Doğrulama** - Oluşturma sonrası GET ile kontrol

## 🏷️ TANIMLAMA ID'LERİ (Personel/Yönetici Hariç)

### ID Formatı:
```
TANIMLAMALAR: {kurum_id}_D{departman_sira}_B{birim_sira}_{sıra}
```

### Örnek Veriler (Kurum: 6, Departman: D1-ACİL SERVİS, Birim: B1-HEMSİRE):

#### 1. ÜNVAN TANIMLAMA ID'LERİ:
```
6_D1_B1_1  → Başhemşire
6_D1_B1_2  → Hemşire
6_D1_B1_3  → Stajyer Hemşire
6_D1_B1_4  → Sorumlu Hemşire
6_D1_B1_5  → Klinik Hemşiresi
```

#### 2. İZİN TÜRÜ ID'LERİ:
```
6_D1_B1_1  → Yıllık İzin
6_D1_B1_2  → Hastalık İzni
6_D1_B1_3  → Doğum İzni
6_D1_B1_4  → Mazeret İzni
6_D1_B1_5  → Ücretsiz İzin
```

#### 3. VARDİYA TANIMLAMA ID'LERİ:
```
6_D1_B1_1  → Gündüz Vardiyası (08:00-16:00)
6_D1_B1_2  → Akşam Vardiyası (16:00-00:00)
6_D1_B1_3  → Gece Vardiyası (00:00-08:00)
6_D1_B1_4  → Uzun Vardiya (08:00-20:00)
6_D1_B1_5  → Kısa Vardiya (12:00-18:00)
```

#### 4. MESAİ TÜRÜ ID'LERİ:
```
6_D1_B1_1  → Tam Mesai (40 saat/hafta)
6_D1_B1_2  → Yarım Mesai (20 saat/hafta)
6_D1_B1_3  → Esnek Mesai (35 saat/hafta)
6_D1_B1_4  → Fazla Mesai (45 saat/hafta)
6_D1_B1_5  → Part-time (24 saat/hafta)
```

#### 5. ALAN TANIMLAMA ID'LERİ:
```
6_D1_B1_1  → Acil Servis Giriş
6_D1_B1_2  → Müşahede Odası
6_D1_B1_3  → Travma Ünitesi
6_D1_B1_4  → Resüsitasyon
6_D1_B1_5  → Triaj Alanı
```

### ⚠️ FARK:
- **TANIMLAMALAR**: `6_D1_B1_1` (kurum + departman kodu + birim kodu + sıra)
- **YÖNETİCİLER**: `6_D1_B1_Y1` (kurum + departman kodu + birim kodu + Y + sıra)
- **PERSONELLER**: `6_D1_B1_P1` (kurum + departman kodu + birim kodu + P + sıra)

---
*Hiyerarşik ID Sistemi Dokümantasyonu*
*Oluşturulma: 21.07.2025 23:00:00*
*Durum: HAZIR - Terminal Uygulaması Bekliyor ✅* 