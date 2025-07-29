#!/bin/bash

# Vardiyali Nobet Asistani - Veritabanı Yapısı Düzenleme
# Kurum, Departman ve Birim için ID sütunları ekleme

# Environment'tan API key al
API_KEY="${VITE_HZM_API_KEY:-hzm_1ce98c92189d4a109cd604b22bfd86b7}"
BASE_URL="${VITE_HZM_BASE_URL:-https://hzmbackendveritabani-production.up.railway.app}"
USER_EMAIL="${VITE_HZM_USER_EMAIL:-ozgurhzm@gmail.com}"
PROJECT_PASSWORD="${VITE_HZM_PROJECT_PASSWORD:-hzmsoft123456}"
PROJECT_ID="5"

echo "🔧 Veritabanı yapısı düzenleniyor..."

# 1. Kurumlar tablosuna kurum_id field'ı ekle (Tablo ID: 10)
echo "📋 1. Kurumlar tablosuna kurum_id field'ı ekleniyor..."
curl -X POST "${BASE_URL}/api/v1/tables/project/${PROJECT_ID}/10/fields" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "name": "kurum_id",
    "type": "string",
    "isRequired": true,
    "description": "Kurum benzersiz ID (örn: KURUM_001, KURUM_002)"
  }'

echo ""

# 2. Kurumlar tablosuna departman_id field'ı ekle
echo "📋 2. Kurumlar tablosuna departman_id field'ı ekleniyor..."
curl -X POST "${BASE_URL}/api/v1/tables/project/${PROJECT_ID}/10/fields" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "name": "departman_id",
    "type": "string",
    "isRequired": false,
    "description": "Departman benzersiz ID (örn: KURUM_001_ACIL, KURUM_001_DAHILIYE)"
  }'

echo ""

# 3. Kurumlar tablosuna birim_id field'ı ekle
echo "📋 3. Kurumlar tablosuna birim_id field'ı ekleniyor..."
curl -X POST "${BASE_URL}/api/v1/tables/project/${PROJECT_ID}/10/fields" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "name": "birim_id",
    "type": "string",
    "isRequired": false,
    "description": "Birim benzersiz ID (örn: KURUM_001_ACIL_HEMSIRE, KURUM_001_ACIL_DOKTOR)"
  }'

echo ""

# 4. Mevcut kurum kaydını güncelle
echo "📋 4. Mevcut kurum kaydı güncelleniyor..."

# Önce mevcut veriyi oku
echo "📖 Mevcut kurum verisi okunuyor..."
CURRENT_DATA=$(curl -s -X GET "${BASE_URL}/api/v1/data/table/10" \
  -H "X-API-Key: ${API_KEY}")

echo "Mevcut veri: $CURRENT_DATA"

# Kurum ID'sini güncelle (ID 1 olan kaydı güncelle)
curl -X PUT "${BASE_URL}/api/v1/data/table/10/rows/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "kurum_id": "KURUM_001",
    "departman_id": "KURUM_001_ACIL_SERVIS,KURUM_001_DAHILIYE,KURUM_001_CERRAHI",
    "birim_id": "KURUM_001_ACIL_HEMSIRE,KURUM_001_ACIL_DOKTOR,KURUM_001_DAHILIYE_HEMSIRE,KURUM_001_DAHILIYE_DOKTOR"
  }'

echo ""

# 5. Diğer tablolarda kurum_id referanslarını güncelle
echo "📋 5. Diğer tablolardaki kurum_id referansları güncelleniyor..."

# Kullanıcılar tablosu (ID: 13)
echo "👥 Kullanıcılar tablosu güncelleniyor..."
curl -X POST "${BASE_URL}/api/v1/data/table/13/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "action": "update",
    "where": {"kurum_id": "6"},
    "data": {"kurum_id": "KURUM_001"}
  }'

# Personel Ünvan Tanımlama (ID: 15)
echo "🏷️ Personel ünvan tanımlama tablosu güncelleniyor..."
curl -X POST "${BASE_URL}/api/v1/data/table/15/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "action": "update",
    "where": {"kurum_id": "6"},
    "data": {"kurum_id": "KURUM_001"}
  }'

# İzin İstek Tanımlama (ID: 16)
echo "📝 İzin istek tanımlama tablosu güncelleniyor..."
curl -X POST "${BASE_URL}/api/v1/data/table/16/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "action": "update",
    "where": {"kurum_id": "6"},
    "data": {"kurum_id": "KURUM_001"}
  }'

# Vardiya Tanımlama (ID: 17)
echo "⏰ Vardiya tanımlama tablosu güncelleniyor..."
curl -X POST "${BASE_URL}/api/v1/data/table/17/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "action": "update",
    "where": {"kurum_id": "6"},
    "data": {"kurum_id": "KURUM_001"}
  }'

# Tanımlı Alanlar (ID: 18)
echo "📍 Tanımlı alanlar tablosu güncelleniyor..."
curl -X POST "${BASE_URL}/api/v1/data/table/18/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "action": "update",
    "where": {"kurum_id": "6"},
    "data": {"kurum_id": "KURUM_001"}
  }'

# Personel Bilgileri (ID: 21)
echo "👨‍⚕️ Personel bilgileri tablosu güncelleniyor..."
curl -X POST "${BASE_URL}/api/v1/data/table/21/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "action": "update",
    "where": {"kurum_id": "6"},
    "data": {"kurum_id": "KURUM_001"}
  }'

# Nöbet Tanımlama (ID: 22)
echo "🌙 Nöbet tanımlama tablosu güncelleniyor..."
curl -X POST "${BASE_URL}/api/v1/data/table/22/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "action": "update",
    "where": {"kurum_id": "6"},
    "data": {"kurum_id": "KURUM_001"}
  }'

echo ""
echo "✅ Veritabanı yapısı düzenleme tamamlandı!"
echo ""
echo "📋 Yapılan değişiklikler:"
echo "1. ✅ Kurumlar tablosuna kurum_id field'ı eklendi"
echo "2. ✅ Kurumlar tablosuna departman_id field'ı eklendi"
echo "3. ✅ Kurumlar tablosuna birim_id field'ı eklendi"
echo "4. ✅ Mevcut kurum kaydı KURUM_001 olarak güncellendi"
echo "5. ✅ Tüm tablolardaki kurum_id referansları KURUM_001 olarak güncellendi"
echo ""
echo "🎯 Yeni yapı:"
echo "- Kurum ID: KURUM_001"
echo "- Departman ID'leri: KURUM_001_ACIL_SERVIS, KURUM_001_DAHILIYE, KURUM_001_CERRAHI"
echo "- Birim ID'leri: KURUM_001_ACIL_HEMSIRE, KURUM_001_ACIL_DOKTOR, vb." 