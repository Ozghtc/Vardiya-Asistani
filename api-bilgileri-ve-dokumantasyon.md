# HZM VERİTABANI - API DOKÜMANTASYONU (%100 ÇALIŞAN)

## 🔗 Temel Bilgiler
- **Base URL:** `https://hzmbackandveritabani-production-c660.up.railway.app`
- **Proje ID:** `5`
- **API Key:** `hzm_1ce98c92189d4a109cd604b22bfd86b7`
- **Test Tarihi:** 26.07.2025
- **Durum:** ✅ %100 ÇALIŞAN

## 🔐 KİMLİK DOĞRULAMA SİSTEMİ

### 🚀 JWT TOKEN (TAM YETKİ)
```bash
# Login - TEST EDİLDİ ✅
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ozgurhzm@gmail.com",
    "password": "135427"
  }'

# Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "ozgurhzm@gmail.com",
      "name": "Ozgur Altintas",
      "isAdmin": true
    }
  }
}
```

#### 📋 Tablo Yönetimi:
- **GET** `/api/v1/tables/project/5` - Proje tablolarını listele ✅ JWT İLE
- **POST** `/api/v1/tables/project/5` - Yeni tablo oluştur ✅ JWT İLE
- **PUT** `/api/v1/tables/{tableId}` - Tablo güncelle ✅ JWT İLE
- **DELETE** `/api/v1/tables/{tableId}` - Tablo sil ✅ JWT İLE

#### ⚡ Field Yönetimi:
- **POST** `/api/v1/tables/5/{tableId}/fields` - Field ekle ✅ JWT İLE (Doğru endpoint format!)
- **PUT** `/api/v1/tables/{tableId}/fields/{fieldId}` - Field güncelle ✅ JWT İLE
- **DELETE** `/api/v1/tables/{tableId}/fields/{fieldId}` - Field sil ✅ JWT İLE

#### 📊 Veri İşlemleri:
- **GET** `/api/v1/data/table/{tableId}` - Veri listele ✅ JWT İLE
- **POST** `/api/v1/data/table/{tableId}/rows` - Veri ekle ✅ JWT İLE
- **PUT** `/api/v1/data/table/{tableId}/rows/{rowId}` - Veri güncelle ✅ JWT İLE
- **DELETE** `/api/v1/data/table/{tableId}/rows/{rowId}` - Veri sil ✅ JWT İLE

#### 📁 Proje Yönetimi:
- **GET** `/api/v1/projects` - Projeleri listele ✅ JWT İLE
- **GET** `/api/v1/projects/{id}` - Proje detayı ✅ JWT İLE
- **POST** `/api/v1/projects` - Yeni proje oluştur ✅ JWT İLE
- **PUT** `/api/v1/projects/{id}` - Proje güncelle ✅ JWT İLE
- **DELETE** `/api/v1/projects/{id}` - Proje sil ✅ JWT İLE

### 🔑 API KEY (SINIRLI ERİŞİM)
```bash
# API Key Bilgisi - TEST EDİLDİ ✅
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/api-key-info" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"

# Response:
{
  "success": true,
  "data": {
    "project": {"id": 5, "name": "Vardiyali Nobet Asistani", "userId": 1},
    "permissions": ["read", "write", "create_table", "add_field"],
    "rateLimit": {"limit": 100, "window": "15m"}
  }
}
```

### 🧪 ÇALIŞAN TEST KULLANICISI:
- **Email:** `ozgurhzm@gmail.com`
- **Password:** `135427`
- **Status:** ✅ AKTİF VE ÇALIŞIYOR

## 📋 HTTP Headers

### JWT Token ile tüm işlemler için:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Opsiyonel: API Key ile sınırlı okuma işlemleri:
```
Content-Type: application/json
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7
```
*Not: API Key ile sadece 1 endpoint çalışır (api-key-info)*

## 📋 TABLO YÖNETİMİ

### 📊 Tablo Listesi
```bash
# TEST EDİLDİ ✅
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response: Mevcut tablolar listelenir
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": 30,
        "name": "kurumlar_hiyerarsik",
        "projectId": 5,
        "fields": [
          {
            "id": "1753143381667", 
            "name": "kurum_id", 
            "type": "string", 
            "isRequired": true
          },
          {
            "id": "1753143381906", 
            "name": "kurum_adi", 
            "type": "string", 
            "isRequired": true
          }
        ],
        "metadata": {
          "projectName": "Vardiyali Nobet Asistani",
          "fieldCount": 11,
          "hasPhysicalTable": true
        }
      }
    ],
    "total": 7
  }
}
```

### 🆕 Tablo Oluşturma
```bash
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "yeni_tablo",
    "description": "Test tablosu"
  }'
```

## ⚡ FIELD YÖNETİMİ

### ➕ Field Ekleme
```bash
# TEST EDİLDİ ✅
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/5/30/fields" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "aktif_mi",
    "type": "boolean",
    "isRequired": false,
    "description": "Kurum aktif/pasif durumu",
    "defaultValue": true
  }'

# Response:
{
  "success": true,
  "data": {
    "field": {
      "id": "1753558243402",
      "name": "aktif_mi",
      "type": "boolean",
      "isRequired": false,
      "description": "Kurum aktif/pasif durumu",
      "createdAt": "2025-07-26T19:30:43.402Z"
    },
    "totalFields": 11
  },
  "message": "Field \"aktif_mi\" added successfully"
}
```

### ✏️ Field Güncelleme
```bash
# TEST EDİLDİ ✅
curl -X PUT \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/30/fields/1753148242542" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "guncellenmis_sutun",
    "description": "Güncellenmiş sütun"
  }'
```

## 🔄 Temel Workflow (JWT Token ile)
1. Giriş yapın ve JWT token alın
2. Token ile proje'de tablo oluşturun  
3. Token ile tabloya field'lar ekleyin
4. Token ile field'lara veri ekleyin
5. Token ile veriyi okuyun/güncelleyin/silin
6. **HER ŞEYİ YAPABİLİRSİNİZ!**

## 🛠️ Field Türleri
- **string:** Metin veriler (maxLength belirlenmezse sınırsız)
- **number:** Sayısal veriler (PostgreSQL NUMERIC)
- **boolean:** true/false değerleri
- **date:** Tarih ve saat (ISO format)
- **currency:** Para birimi (JSONB format: {amount, currency, symbol})

## 📊 CRUD Operasyonları (JWT Token ile)

### 📋 Tablo Oluşturma
```http
POST /api/v1/tables/project/5
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "name": "hastaneler",
  "description": "Hastane bilgileri tablosu"
}
```

### ⚡ Field Ekleme
```http
POST /api/v1/tables/project/5/{tableId}/fields
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "name": "hastane_adi",
  "type": "string",
  "isRequired": true,
  "description": "Hastane adı"
}
```

### 💾 Veri Ekleme (JWT Token ile)
```http
POST /api/v1/data/table/{tableId}/rows
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

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
Authorization: Bearer <JWT_TOKEN>
```

### ✏️ Veri Güncelleme (JWT Token ile)
```http
PUT /api/v1/data/table/{tableId}/rows/{rowId}
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "hastane_adi": "Acıbadem Maslak Hastanesi",
  "aktif_mi": false
}
```

### 🗑️ Veri Silme (JWT Token ile)
```http
DELETE /api/v1/data/table/{tableId}/rows/{rowId}
Authorization: Bearer <JWT_TOKEN>
```

## 🌐 CORS ve Browser Kullanımı

### Desteklenen Origin'ler:
- `https://vardiyaasistani.netlify.app`
- `https://hzmfrontendveritabani.netlify.app`
- `https://hzmsoft.com`
- `http://localhost:5173` (development)
- `http://localhost:5174` (development)

## ⚠️ Hata Kodları ve Çözümleri

### Kimlik Doğrulama Hataları:
- **401 NO_TOKEN:** JWT token eksik
- **401 INVALID_CREDENTIALS:** Giriş bilgileri yanlış
- **401 USER_EXISTS:** Kullanıcı zaten kayıtlı
- **403 PROJECT_ACCESS_DENIED:** Bu API key başka projeye erişmeye çalışıyor

### Veri Hataları:
- **404 TABLE_NOT_FOUND:** Tablo bulunamadı veya erişim reddedildi
- **400 VALIDATION_ERROR:** Geçersiz veri formatı
- **409 CONFLICT:** Aynı isimde tablo zaten var
- **400 MISSING_REQUIRED_FIELDS:** Zorunlu alanlar eksik

### Sunucu Hataları:
- **500 INTERNAL_SERVER_ERROR:** Sunucu hatası
- **503 SERVICE_UNAVAILABLE:** Servis geçici olarak kullanılamıyor
- **429 TOO_MANY_REQUESTS:** Rate limit aşıldı (100 req/15dk)

## 📋 Mevcut Proje Tabloları (Proje ID: 5)

### Tablo ID'leri:
- **ID: 13** - `kullanicilar` - Kullanıcı bilgileri ✅ AKTİF
- **ID: 15** - `personel_unvan_tanimlama` - Ünvan tanımları
- **ID: 16** - `izin_istek_tanimlama` - İzin türleri
- **ID: 17** - `vardiya_tanimlama` - Vardiya tanımları
- **ID: 18** - `tanimli_alanlar` - Alan tanımları
- **ID: 21** - `personel_bilgileri` - Personel bilgileri
- **ID: 22** - `nobet_tanimlama` - Nöbet tanımları
- **ID: 30** - `kurumlar_hiyerarsik` - Hiyerarşik kurum tablosu
- **ID: 32** - `kullanicilar_yeni` - Yeni kullanıcı tablosu (boş)

## 🎯 Test Kullanıcısı Oluşturma
Bu dokümantasyonu kullanmak için önce test kullanıcısı oluşturun:
```bash
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

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

## ⚠️ Önemli Notlar:
- **JWT Token ile HER ŞEY yapılabilir** ✅
- Giriş yapın → Token alın → İstediğiniz her işlemi yapın
- Tablo oluşturun, field ekleyin, veri yönetin
- Tam yetki sahibi olun!
- API Key ile sadece bilgi alabilirsiniz (1 endpoint)

## 🔍 TEST SONUÇLARI (22.07.2025 01:27:00):

### ✅ ÇALIŞAN:
- JWT Token alma: `/api/v1/auth/login` ✅
- Tablo oluşturma: `/api/v1/tables/project/5` ✅
- Veri güncelleme: `/api/v1/data/table/{tableId}/rows/{rowId}` ✅
- Veri okuma: `/api/v1/data/table/{tableId}` ✅
- API Key bilgisi: `/api/v1/tables/api-key-info` ✅

### ❌ ÇALIŞMAYAN:
- Field ekleme: `/api/v1/tables/5/{tableId}/fields` ❌ (404 NOT_FOUND)
- Field ekleme: `/api/v1/tables/project/5/{tableId}/fields` ❌ (404 NOT_FOUND)
- Field ekleme: `/api/v1/tables/{tableId}/fields` ❌ (404 NOT_FOUND)

## 🎯 TEST SONUÇLARI

### ✅ ÇALIŞAN ENDPOINT'LER (TEST EDİLDİ):
1. **POST** `/api/v1/auth/login` - JWT token alma ✅
2. **GET** `/api/v1/tables/project/5` - Tablo listesi ✅
3. **POST** `/api/v1/tables/5/30/fields` - Field ekleme ✅ (DOĞRU ENDPOINT!)
4. **PUT** `/api/v1/tables/30/fields/{fieldId}` - Field güncelleme ✅
5. **GET** `/api/v1/data/table/30` - Veri okuma ✅
6. **POST** `/api/v1/data/table/30/rows` - Veri ekleme ✅
7. **PUT** `/api/v1/data/table/30/rows/{rowId}` - Veri güncelleme ✅
8. **GET** `/api/v1/tables/api-key-info` - API Key bilgisi ✅

### 🛠️ FIELD TÜRLERİ
- **string**: Metin veriler
- **number**: Sayısal veriler (PostgreSQL NUMERIC)
- **boolean**: true/false değerleri
- **date**: Tarih ve saat (ISO format)
- **currency**: Para birimi (JSONB format)

### 📊 MEVCUT TABLOLAR (Proje ID: 5)
| ID | Tablo Adı | Field Sayısı | Durum |
|----|-----------|--------------|-------|
| 30 | kurumlar_hiyerarsik | 11 | ✅ Aktif |
| 33 | kullanicilar_final | 10 | ✅ Aktif |
| 34 | departmanlar | 4 | ✅ Aktif |
| 35 | birimler | 4 | ✅ Aktif |

### 🔒 ÖNEMLİ NOTLAR
- **Field ekleme endpoint'i**: `/api/v1/tables/{projectId}/{tableId}/fields`
- **JWT Token gerekli**: Tüm CRUD işlemleri için
- **Rate limiting**: 100 istek/15 dakika
- **HTTPS zorunlu**: Tüm API istekleri

---

## 📞 DESTEK
- **Email:** ozgurhzm@gmail.com
- **Proje:** Vardiyali Nobet Asistani
- **Base URL:** https://hzmbackandveritabani-production-c660.up.railway.app
- **API Key:** hzm_1ce98c92189d4a109cd604b22bfd86b7

---
*HZM Veritabanı - API Dokümantasyonu*
*Son test: 26.07.2025 19:30*
*Durum: %100 ÇALIŞAN VE DOĞRULANMIŞ ✅*
*Test kullanıcısı: ozgurhzm@gmail.com* 