# Vardiyali Nobet Asistani - API Dokümantasyonu (%100 DOĞRU - TEST EDİLDİ)

## 🔗 Temel Bilgiler
- **Base URL:** `https://hzmbackandveritabani-production-c660.up.railway.app`
- **Proje ID:** `5`
- **API Key:** `hzm_1ce98c92189d4a109cd604b22bfd86b7`

## 🔐 KİMLİK DOĞRULAMA SİSTEMİ (GERÇEKLİK)

### ✅ API Key ile ÇALIŞAN Endpoint'ler (GENİŞ YETKİLER):
API Key ile **neredeyse tüm veri işlemlerini** yapabilirsiniz:

#### 📊 Tüm Veri CRUD İşlemleri:
- **GET** `/api/v1/data/table/{tableId}` - Tablo verilerini listele ✅
- **GET** `/api/v1/data/table/{tableId}/rows/{rowId}` - Tekil veri oku ✅
- **POST** `/api/v1/data/table/{tableId}/rows` - Yeni veri ekle ✅
- **PUT** `/api/v1/data/table/{tableId}/rows/{rowId}` - Veri güncelle ✅
- **DELETE** `/api/v1/data/table/{tableId}/rows/{rowId}` - Veri sil ✅
- **POST** `/api/v1/data/table/{tableId}/bulk` - Toplu veri işlemleri ✅

#### 📋 Tablo Yönetimi:
- **GET** `/api/v1/tables/project/5` - Proje tablolarını listele ✅
- **POST** `/api/v1/tables/project/5` - Yeni tablo oluştur ✅
- **GET** `/api/v1/tables/api-key-info` - API Key bilgilerini al ✅

#### ⚡ Field Yönetimi:
- **POST** `/api/v1/tables/project/5/{tableId}/fields` - Tabloya field ekle ✅

### ❌ SADECE JWT Token ile ÇALIŞAN Endpoint'ler:
Bu endpoint'ler Authorization: Bearer <token> header'ı gerektirir:

#### 🔧 Gelişmiş Tablo Yönetimi:
- **GET** `/api/v1/tables/{projectId}/{tableId}` - Tablo detayları ⚠️ JWT GEREKLI
- **PUT** `/api/v1/tables/{tableId}` - Tablo güncelle ⚠️ JWT GEREKLI
- **DELETE** `/api/v1/tables/{tableId}` - Tablo sil ⚠️ JWT GEREKLI

#### ⚙️ Gelişmiş Field Yönetimi:
- **PUT** `/api/v1/tables/{tableId}/fields/{fieldId}` - Field güncelle ⚠️ JWT GEREKLI
- **DELETE** `/api/v1/tables/{tableId}/fields/{fieldId}` - Field sil ⚠️ JWT GEREKLI

#### 📁 Proje Yönetimi:
- **GET** `/api/v1/projects` - Projeleri listele ⚠️ JWT GEREKLI
- **GET** `/api/v1/projects/{id}` - Proje detayı ⚠️ JWT GEREKLI
- **POST** `/api/v1/projects` - Yeni proje oluştur ⚠️ JWT GEREKLI
- **PUT** `/api/v1/projects/{id}` - Proje güncelle ⚠️ JWT GEREKLI
- **DELETE** `/api/v1/projects/{id}` - Proje sil ⚠️ JWT GEREKLI

#### 🏠 Admin İşlemleri:
- **Tüm** `/api/v1/admin/*` - Admin endpoint'leri ⚠️ JWT GEREKLI

## 🚀 API Key'in Gücü
API Key'iniz ile yapabilecekleriniz:
- ✅ Tüm veri CRUD işlemleri (ekleme, okuma, güncelleme, silme)
- ✅ Tablo oluşturma ve field ekleme
- ✅ Toplu veri işlemleri
- ✅ Pagination ve filtreleme
- ❌ Sadece proje yönetimi ve admin işlemleri JWT token gerektirir

## 📋 HTTP Headers

### API Key ile çalışan endpoint'ler için:
```
Content-Type: application/json
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7
```

### JWT Token gereken endpoint'ler için:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

## 📞 Test Edilmiş Örnekler (%100 ÇALIŞAN)

### ✅ API Key ile TÜM CRUD İŞLEMLERİ (TEST EDİLDİ):

#### Veri Okuma:
```bash
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"
```

#### Veri Ekleme:
```bash
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18/rows" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7" \
  -d '{
    "alan_adi": "TEST ALAN",
    "aciklama": "Test için oluşturulan alan",
    "renk": "#dc2626",
    "gunluk_mesai_saati": 40,
    "vardiya_bilgileri": "{}",
    "aktif_mi": true,
    "kurum_id": "6",
    "departman_id": "6_ACİL SERVİS",
    "birim_id": "6_HEMSİRE"
  }'
```

#### Veri Güncelleme:
```bash
curl -X PUT \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18/rows/7" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7" \
  -d '{
    "alan_adi": "GÜNCELLENMİŞ ALAN",
    "aciklama": "Bu alan güncellendi"
  }'
```

#### Veri Silme:
```bash
curl -X DELETE \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18/rows/7" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"
```

#### Tablo Oluşturma:
```bash
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7" \
  -d '{
    "name": "test_tablosu",
    "description": "Test için tablo"
  }'
```

#### Field Ekleme:
```bash
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5/10/fields" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7" \
  -d '{
    "name": "yeni_alan",
    "type": "string",
    "isRequired": false,
    "description": "Yeni alan"
  }'
```

#### Tablo Listesi:
```bash
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"
```

#### API Key Bilgisi:
```bash
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/api-key-info" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"
```

## 🔄 Temel Workflow
1. API Key ile kimlik doğrulaması yapın
2. Proje'de tablo oluşturun
3. Tabloya field'lar ekleyin
4. Field'lara veri ekleyin
5. Veriyi okuyun/güncelleyin/silin
6. Sadece gelişmiş proje yönetimi için JWT token gerekir

## 🛠️ Field Türleri
- **string:** Metin veriler (maxLength belirlenmezse sınırsız)
- **number:** Sayısal veriler (PostgreSQL NUMERIC)
- **boolean:** true/false değerleri
- **date:** Tarih ve saat (ISO format)
- **currency:** Para birimi (JSONB format: {amount, currency, symbol})

## 📊 CRUD Operasyonları (API Key ile Çalışır)

### 📋 Tablo Oluşturma
```http
POST /api/v1/tables/project/5
Content-Type: application/json
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7

{
  "name": "hastaneler",
  "description": "Hastane bilgileri tablosu"
}
```

### ⚡ Field Ekleme
```http
POST /api/v1/tables/project/5/{tableId}/fields
Content-Type: application/json
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7

{
  "name": "hastane_adi",
  "type": "string",
  "isRequired": true,
  "description": "Hastane adı"
}
```

### 💾 Veri Ekleme
```http
POST /api/v1/data/table/{tableId}/rows
Content-Type: application/json
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7

{
  "hastane_adi": "Acıbadem Hastanesi",
  "il": "İstanbul",
  "aktif_mi": true,
  "kurulis_tarihi": "2010-05-15T00:00:00Z"
}
```

### 📖 Veri Okuma
```http
GET /api/v1/data/table/{tableId}?page=1&limit=50&sort=id&order=ASC
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7
```

### ✏️ Veri Güncelleme
```http
PUT /api/v1/data/table/{tableId}/rows/{rowId}
Content-Type: application/json
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7

{
  "hastane_adi": "Acıbadem Maslak Hastanesi",
  "aktif_mi": false
}
```

### 🗑️ Veri Silme
```http
DELETE /api/v1/data/table/{tableId}/rows/{rowId}
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7
```

## 🌐 CORS ve Browser Kullanımı

### Desteklenen Origin'ler:
- `https://vardiyaasistani.netlify.app`
- `https://hzmfrontendveritabani.netlify.app`
- `https://hzmsoft.com`
- `http://localhost:5173` (development)
- `http://localhost:5174` (development)

### JavaScript/Fetch Örneği:
```javascript
// Veri okuma
const response = await fetch(
  'https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18',
  {
    method: 'GET',
    headers: {
      'X-API-Key': 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
      'Content-Type': 'application/json'
    }
  }
);

// Veri ekleme
const addResponse = await fetch(
  'https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18/rows',
  {
    method: 'POST',
    headers: {
      'X-API-Key': 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "alan_adi": "Yeni Alan",
      "aciklama": "API ile eklendi",
      "renk": "#007bff",
      "gunluk_mesai_saati": 40,
      "vardiya_bilgileri": "{}",
      "aktif_mi": true,
      "kurum_id": "6",
      "departman_id": "6_ACİL SERVİS",
      "birim_id": "6_HEMSİRE"
    })
  }
);

// Veri güncelleme
const updateResponse = await fetch(
  'https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18/rows/7',
  {
    method: 'PUT',
    headers: {
      'X-API-Key': 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "alan_adi": "Güncellenen Alan",
      "aciklama": "Bu alan güncellendi"
    })
  }
);

// Veri silme
const deleteResponse = await fetch(
  'https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/18/rows/7',
  {
    method: 'DELETE',
    headers: {
      'X-API-Key': 'hzm_1ce98c92189d4a109cd604b22bfd86b7'
    }
  }
);
```

## ⚠️ Hata Kodları ve Çözümleri

### Kimlik Doğrulama Hataları:
- **401 NO_API_KEY:** X-API-Key header'ı eksik
- **401 INVALID_API_KEY:** API key geçersiz
- **401 NO_AUTH:** Ne JWT ne de API key sağlanmış
- **403 PROJECT_ACCESS_DENIED:** Bu API key başka projeye erişmeye çalışıyor

### Veri Hataları:
- **404 NOT_FOUND:** Tablo/kayıt bulunamadı
- **400 VALIDATION_ERROR:** Geçersiz veri formatı
- **409 CONFLICT:** Aynı isimde tablo zaten var
- **400 MISSING_REQUIRED_FIELDS:** Zorunlu alanlar eksik

### Sunucu Hataları:
- **500 INTERNAL_SERVER_ERROR:** Sunucu hatası
- **503 SERVICE_UNAVAILABLE:** Servis geçici olarak kullanılamıyor
- **429 TOO_MANY_REQUESTS:** Rate limit aşıldı (100 req/15dk)

## 🔒 Güvenlik ve Limitler

### API Key Güvenliği:
- API key'inizi **asla frontend kodunda** saklamayın
- Server-side proxy kullanın veya environment variables'da saklayın
- API key'i yalnızca HTTPS üzerinden gönderin

### Rate Limiting:
- **100 istek/15 dakika** (admin kullanıcılar için bypass)
- Rate limit aşıldığında 429 hatası alırsınız
- Sayaç her 15 dakikada sıfırlanır

### Veri Limitleri:
- **String field:** maxLength belirtilmezse sınırsız (TEXT)
- **Number field:** PostgreSQL NUMERIC limitlerinde
- **Boolean field:** true/false değerleri
- **Date field:** ISO 8601 format gerekli
- **File upload:** Şu anda desteklenmiyor

## 📋 Mevcut Proje Tabloları (Proje ID: 5)

### Tablo ID'leri:
- **ID: 10** - `kurumlar` - Kurum bilgileri
- **ID: 13** - `kullanicilar` - Kullanıcı bilgileri
- **ID: 14** - `tanimlamalar` - Tanım bilgileri
- **ID: 15** - `personel_unvan_tanimlama` - Ünvan tanımları
- **ID: 16** - `izin_istek_tanimlama` - İzin türleri
- **ID: 17** - `vardiya_tanimlama` - Vardiya tanımları
- **ID: 18** - `tanimli_alanlar` - Alan tanımları
- **ID: 19** - `test_table` - Test tablosu

## 📞 Destek İletişim
- **Email:** ozgurhzm@gmail.com
- **Proje:** Vardiyali Nobet Asistani
- **Proje ID:** 5
- **API Key:** hzm_1ce98c92189d4a109cd604b22bfd86b7
- **Base URL:** https://hzmbackandveritabani-production-c660.up.railway.app

## 🚀 Versiyonlama
- **Mevcut Versiyon:** v1
- **API Prefix:** /api/v1/
- **Backward Compatibility:** Garantili (major versiyon değişikliği dışında)

---
*Bu dokümantasyon 16.07.2025 tarihinde güncellendi.*
*Son güncelleme: 16.07.2025 19:35:00 - Test sonuçlarına göre %100 doğru bilgiler*
*Durum: TEST EDİLDİ ✅ - Tüm CRUD işlemleri API Key ile çalışır* 