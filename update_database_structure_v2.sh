#!/bin/bash

# Environment'tan API key al
API_KEY="${VITE_HZM_API_KEY:-hzm_1ce98c92189d4a109cd604b22bfd86b7}"
BASE_URL="${VITE_HZM_BASE_URL:-https://hzmbackandveritabani-production-c660.up.railway.app}"
USER_EMAIL="${VITE_HZM_USER_EMAIL:-ozgurhzm@gmail.com}"
PROJECT_PASSWORD="${VITE_HZM_PROJECT_PASSWORD:-hzmsoft123456}"

echo "🔧 Veritabanı yapısı güncelleniyor (v2)..."
echo "📡 API Key: ${API_KEY:0:20}..."
echo "🌐 Base URL: $BASE_URL"

# Tablo yapılarını güncelle
echo "📊 Tablo yapıları kontrol ediliyor..."

# Örnek: Kullanıcılar tablosunu kontrol et
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/33" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$USERS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Kullanıcılar tablosu erişilebilir"
else
  echo "❌ Kullanıcılar tablosuna erişilemedi"
  echo "🔍 Response: $USERS_RESPONSE"
fi

# Kurumlar tablosunu kontrol et
KURUMLAR_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/30" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$KURUMLAR_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Kurumlar tablosu erişilebilir"
else
  echo "❌ Kurumlar tablosuna erişilemedi"
fi

echo "🎉 Veritabanı yapısı güncelleme işlemi tamamlandı!" 