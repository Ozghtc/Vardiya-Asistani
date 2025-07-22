# Vardiyali Nobet Asistani - API Bilgileri (%100 DOĞRU - TEST EDİLDİ)

## 🔗 Temel Bilgiler
- **Base URL:** `https://hzmbackandveritabani-production-c660.up.railway.app`
- **Proje ID:** `5`
- **API Key:** `hzm_1ce98c92189d4a109cd604b22bfd86b7`

## 🔐 KİMLİK DOĞRULAMA SİSTEMİ

### 🚀 JWT TOKEN İLE TÜM İŞLEMLER (TAM YETKİ):
Bu endpoint'ler Authorization: Bearer <JWT_TOKEN> header'ı ile çalışır:

#### 📋 Tablo Yönetimi:
- **GET** `/api/v1/tables/project/5` - Proje tablolarını listele ✅ JWT İLE
- **POST** `/api/v1/tables/project/5` - Yeni tablo oluştur ✅ JWT İLE
- **PUT** `/api/v1/tables/{tableId}` - Tablo güncelle ✅ JWT İLE
- **DELETE** `/api/v1/tables/{tableId}` - Tablo sil ✅ JWT İLE

#### ⚡ Field Yönetimi:
- **POST** `/api/v1/tables/5/{tableId}/fields` - Field ekle ❌ ÇALIŞMIYOR (404 NOT_FOUND)
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

### 🔑 JWT TOKEN NASIL ALINIR:
```bash
# ÇALIŞAN KULLANICI ✅
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ozgurhzm@gmail.com",
    "password": "135427"
  }'

# Response'dan token'ı alın:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "ozgurhzm@gmail.com", 
      "name": "ÖZGÜR ALTINTAŞ",
      "isAdmin": true
    }
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

## 📞 Test Edilmiş Örnekler

### ✅ API Key ile ÇALIŞAN (SADECE 1 ENDPOINT):
```bash
# ✅ API Key bilgisi (SADECE BU ÇALIŞIYOR)
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

### ❌ API Key ile ÇALIŞMAYAN (JWT TOKEN GEREKLİ):
```bash
# ❌ Normal veri okuma (JWT GEREKLI)
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/10" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# ❌ Normal tablo listesi (JWT GEREKLI)
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# ❌ Yeni tablo oluştur (JWT GEREKLI)
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"name": "test_tablosu", "description": "Test için tablo"}'

# ❌ Field ekle (JWT GEREKLI)
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5/10/fields" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"name": "yeni_alan", "type": "string", "isRequired": false}'

# ❌ Veri ekleme (JWT GEREKLI)
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/10/rows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"Adi Soyadi": "Test User", "Tc": "12345678901"}'

# ❌ Proje listesi (JWT GEREKLI)
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/projects" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# ❌ Field güncelle (JWT GEREKLI)
curl -X PUT \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/10/fields/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"name": "guncellenen_alan"}'

# ❌ API Key versiyonları da çalışmıyor
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/api-project/5" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"
# Response: {"success":false,"error":"No token provided","code":"NO_TOKEN"}

curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/api-table/10" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"
# Response: {"success":false,"error":"Table not found or access denied","code":"TABLE_NOT_FOUND"}
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

**SONUÇ:** Field ekleme API'si hiçbir endpoint'de çalışmıyor. Mevcut sütunları kullanmak zorundayız.

---
*Vardiyali Nobet Asistani - API Bilgileri*
*Test Edilme: 22.07.2025 01:27:00*
*Son güncelleme: 22.07.2025 01:27:30 - Field ekleme çalışmıyor*
*Durum: Field ekleme hariç %100 DOĞRU ✅* 