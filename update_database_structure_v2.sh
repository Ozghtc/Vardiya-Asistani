#!/bin/bash

# Vardiyali Nobet Asistani - Veritabanı Yapısı Düzenleme V2
# Doğru API endpoint'leri ile

API_KEY="hzm_1ce98c92189d4a109cd604b22bfd86b7"
BASE_URL="https://hzmbackandveritabani-production-c660.up.railway.app"
PROJECT_ID="5"

echo "🔧 Veritabanı yapısı düzenleniyor (V2)..."

# Önce mevcut tabloları listeleyelim
echo "📋 Mevcut tablolar kontrol ediliyor..."
curl -X GET "${BASE_URL}/api/v1/tables/api-key-info" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}"

echo ""
echo "📋 Kurumlar tablosu (ID: 10) verisi kontrol ediliyor..."
curl -X GET "${BASE_URL}/api/v1/data/table/10" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}"

echo ""
echo "📋 Field ekleme endpoint'i test ediliyor..."

# Alternatif endpoint formatları deneyelim
echo "🔄 Alternatif format 1: /api/v1/tables/10/fields"
curl -X POST "${BASE_URL}/api/v1/tables/10/fields" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "name": "kurum_id",
    "type": "string",
    "isRequired": true,
    "description": "Kurum benzersiz ID"
  }'

echo ""
echo "🔄 Alternatif format 2: /api/v1/tables/${PROJECT_ID}/10/fields"
curl -X POST "${BASE_URL}/api/v1/tables/${PROJECT_ID}/10/fields" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "name": "kurum_id",
    "type": "string",
    "isRequired": true,
    "description": "Kurum benzersiz ID"
  }'

echo ""
echo "🔄 Veri güncelleme test ediliyor..."
curl -X PUT "${BASE_URL}/api/v1/data/table/10/rows/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "kurum_adi": "1_ŞERİK DEVLET HASTANESİ",
    "test_field": "test_value"
  }'

echo ""
echo "✅ Test tamamlandı!" 