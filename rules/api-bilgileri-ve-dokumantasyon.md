# HZM API Bilgileri ve Dokümantasyon

- **Base URL:** `https://hzmbackandveritabani-production-c660.up.railway.app`
- **API Key:** `hzm_1ce98c92189d4a109cd604b22bfd86b7`
- **Project ID:** `5`
- **Table ID:** `10` (Kurumlar tablosu)

## Temel API Kullanımı

### 1. Tabloları Listele

```bash
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"
```

### 2. Tablo Oluştur

```bash
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_table",
    "description": "Test tablosu"
  }'
```

## 📋 HTTP Headers
```
Content-Type: application/json
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7
```

## 🔧 API Endpoints

### Tablo Yönetimi
- **GET** `/api/v1/tables/project/5` - Proje tablolarını listele
- **POST** `/api/v1/tables/project/5` - Yeni tablo oluştur

### Field Yönetimi  
- **POST** `/api/v1/tables/project/5/{tableId}/fields` - Tabloya field ekle
- **PUT** `/api/v1/tables/{tableId}/fields/{fieldId}` - Field güncelle
- **DELETE** `/api/v1/tables/{tableId}/fields/{fieldId}` - Field sil

### Veri Yönetimi
- **GET** `/api/v1/data/table/{tableId}` - Tablo verisini oku
- **POST** `/api/v1/data/table/{tableId}/rows` - Yeni veri ekle
- **PUT** `/api/v1/data/table/{tableId}/rows/{rowId}` - Veri güncelle
- **DELETE** `/api/v1/data/table/{tableId}/rows/{rowId}` - Veri sil
- **GET** `/api/v1/data/table/{tableId}/rows/{rowId}` - Tekil veri oku
- **POST** `/api/v1/data/table/{tableId}/bulk` - Toplu işlemler

## 📞 Hızlı Test
```bash
# Proje tablolarını listele
curl -X GET \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7"

# Yeni tablo oluştur
curl -X POST \
  "https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/tables/project/5" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7" \
  -d '{"name": "test_tablosu", "description": "Test için tablo"}'
```

---
*Vardiyali Nobet Asistani - API Bilgileri*
*Oluşturulma: 11.07.2025 08:49:15*

---

# Vardiyali Nobet Asistani - API Dokümantasyonu

## 🔐 Kimlik Doğrulama
API'miz **iki farklı kimlik doğrulama yöntemi** destekler:

### 1. API Key Authentication (Önerilen)
Tüm API isteklerinde `X-API-Key` header'ı kullanın:
**API Key:** `hzm_1ce98c92189d4a109cd604b22bfd86b7`

### 2. JWT Token Authentication  
`Authorization: Bearer <token>` header'ı ile giriş yapılmış kullanıcılar için

⚠️ **Önemli:** API Key ile sadece **kendi projenize** erişebilirsiniz (Proje ID: 5)

## 📋 Temel Bilgiler
- **Base URL:** `https://hzmbackandveritabani-production-c660.up.railway.app`
- **Proje ID:** `5`
- **Rate Limit:** 300 istek/15 dakika (admin kullanıcılar için bypass)
- **API Key Kısıtı:** Bu key sadece "Vardiyali Nobet Asistani" projesine erişim sağlar

## 🔄 Temel Workflow
1. API Key ile kimlik doğrulaması yapın
2. Proje'de tablo oluşturun
3. Tabloya field'lar ekleyin
4. Field'lara veri ekleyin
5. Veriyi okuyun/güncelleyin

## 🛠️ Field Türleri
- **string:** Metin veriler (maxLength belirlenmezse sınırsız)
- **number:** Sayısal veriler (PostgreSQL NUMERIC)
- **boolean:** true/false değerleri
- **date:** Tarih ve saat (ISO format)
- **currency:** Para birimi (JSONB format: {amount, currency, symbol})

## 📊 CRUD Operasyonları

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

**Response:**
```json
{
  "success": true,
  "data": {
    "table": {
      "id": 11,
      "name": "hastaneler",
      "projectId": 5,
      "fields": [],
      "physicalTableName": "user_data.project_5_hastaneler_1641234567890",
      "createdAt": "2025-01-11T10:30:00Z"
    }
  }
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

**Response:**
```json
{
  "success": true,
  "data": {
    "field": {
      "id": "1752214830211",
      "name": "hastane_adi",
      "type": "string",
      "columnName": "hastane_adi",
      "isRequired": true
    },
    "totalFields": 1
  }
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

**Response:**
```json
{
  "success": true,
  "data": {
    "row": {
      "id": 1,
      "hastane_adi": "Acıbadem Hastanesi",
      "il": "İstanbul",
      "aktif_mi": true,
      "kurulis_tarihi": "2010-05-15T00:00:00Z",
      "created_at": "2025-01-11T10:35:00Z",
      "updated_at": "2025-01-11T10:35:00Z"
    }
  }
}
```

### 📖 Veri Okuma
```http
GET /api/v1/data/table/{tableId}?page=1&limit=50&sort=id&order=ASC
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7
```

**Query Parameters:**
- `page=1` - Sayfa numarası (default: 1)
- `limit=50` - Sayfa başına kayıt (max: 100)
- `sort=id` - Sıralama alanı (herhangi bir field)
- `order=ASC` - Sıralama yönü (ASC/DESC)

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "hastane_adi": "Acıbadem Hastanesi",
        "il": "İstanbul",
        "aktif_mi": true,
        "created_at": "2025-01-11T10:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    },
    "table": {
      "id": 11,
      "name": "hastaneler",
      "fields": [...]
    }
  }
}
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

**Response:**
```json
{
  "success": true,
  "data": {
    "row": {
      "id": 1,
      "hastane_adi": "Acıbadem Maslak Hastanesi",
      "aktif_mi": false,
      "updated_at": "2025-01-11T11:00:00Z"
    }
  }
}
```

### 🗑️ Veri Silme
```http
DELETE /api/v1/data/table/{tableId}/rows/{rowId}
X-API-Key: hzm_1ce98c92189d4a109cd604b22bfd86b7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Row deleted successfully",
    "deletedRow": {
      "id": 1,
      "hastane_adi": "Acıbadem Maslak Hastanesi"
    }
  }
}
```

## 🌐 CORS ve Browser Kullanımı

### Desteklenen Origin'ler:
- `https://vardiyaasistani.netlify.app`
- `https://hzmfrontendveritabani.netlify.app`
- `https://hzmsoft.com`

### JavaScript/Fetch Örneği:
```javascript
// Veri okuma
const response = await fetch(
  'https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/10',
  {
    method: 'GET',
    headers: {
      'X-API-Key': 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
      'Content-Type': 'application/json'
    }
  }
);

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();
console.log(data.data.rows);

// Veri ekleme
const addResponse = await fetch(
  'https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/10/rows',
  {
    method: 'POST',
    headers: {
      'X-API-Key': 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "kurum_adi": "Yeni Hastane",
      "kurum_turu": "Özel",
      "il": "İstanbul",
      "aktif_mi": true
    })
  }
);

const result = await addResponse.json();
if (result.success) {
  console.log('Veri eklendi:', result.data.row);
} else {
  console.error('Hata:', result.error);
}
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
- **429 TOO_MANY_REQUESTS:** Rate limit aşıldı (300 req/15dk)

### Örnek Hata Response:
```json
{
  "success": false,
  "error": "Table not found",
  "code": "NOT_FOUND",
  "details": {
    "tableId": "123",
    "projectId": "5"
  }
}
```

## 🔒 Güvenlik ve Limitler

### API Key Güvenliği:
- API key'inizi **asla frontend kodunda** saklamayın
- Server-side proxy kullanın veya environment variables'da saklayın
- API key'i yalnızca HTTPS üzerinden gönderin

### Veri Limitleri:
- **String field:** maxLength belirtilmezse sınırsız (TEXT)
- **Number field:** PostgreSQL NUMERIC limitlerinde
- **Boolean field:** true/false değerleri
- **Date field:** ISO 8601 format gerekli
- **File upload:** Şu anda desteklenmiyor

### Performans Önerileri:
- Pagination kullanın (limit=50 önerilir, max=100)
- Gereksiz field'ları sorgularmayın
- Rate limit'i aşmamaya dikkat edin
- Connection pooling otomatik (max 20 connection)

## 📞 Destek İletişim
- **Email:** ozgurhzm@gmail.com
- **Proje:** Vardiyali Nobet Asistani
- **Proje ID:** 5
- **API Key:** hzm_1ce98c92189d4a10...
- **Base URL:** https://hzmbackandveritabani-production-c660.up.railway.app

## 🚀 Versiyonlama
- **Mevcut Versiyon:** v1
- **API Prefix:** /api/v1/
- **Backward Compatibility:** Garantili (major versiyon değişikliği dışında)

---
*Bu dokümantasyon 11.07.2025 tarihinde oluşturulmuştur.*
*Son güncelleme: 11.07.2025 08:49:31 - Yanıltıcı bilgiler düzeltildi* 