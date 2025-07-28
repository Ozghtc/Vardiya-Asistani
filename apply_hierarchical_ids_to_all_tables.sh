#!/bin/bash

# Environment'tan API key al
API_KEY="${VITE_HZM_API_KEY:-hzm_1ce98c92189d4a109cd604b22bfd86b7}"
BASE_URL="${VITE_HZM_BASE_URL:-https://hzmbackandveritabani-production-c660.up.railway.app}"
USER_EMAIL="${VITE_HZM_USER_EMAIL:-ozgurhzm@gmail.com}"
PROJECT_PASSWORD="${VITE_HZM_PROJECT_PASSWORD:-hzmsoft123456}"

echo "🔧 Tüm tablolara hiyerarşik ID sistemi uygulanıyor..."
echo "📡 API Key: ${API_KEY:0:20}..."
echo "🌐 Base URL: $BASE_URL"

# Hiyerarşik ID sistemi için gerekli tabloları kontrol et
echo "📊 Hiyerarşik ID sistemi tabloları kontrol ediliyor..."

# Kurumlar tablosu
echo "🏢 Kurumlar tablosu kontrol ediliyor..."
KURUMLAR_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/30" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$KURUMLAR_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Kurumlar tablosu erişilebilir"
else
  echo "❌ Kurumlar tablosuna erişilemedi"
fi

# Departmanlar tablosu
echo "🏬 Departmanlar tablosu kontrol ediliyor..."
DEPARTMANLAR_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/34" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$DEPARTMANLAR_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Departmanlar tablosu erişilebilir"
else
  echo "❌ Departmanlar tablosuna erişilemedi"
fi

# Birimler tablosu
echo "🏪 Birimler tablosu kontrol ediliyor..."
BIRIMLER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/35" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$BIRIMLER_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Birimler tablosu erişilebilir"
else
  echo "❌ Birimler tablosuna erişilemedi"
fi

# Kullanıcılar tablosu
echo "👥 Kullanıcılar tablosu kontrol ediliyor..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/33" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$USERS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Kullanıcılar tablosu erişilebilir"
else
  echo "❌ Kullanıcılar tablosuna erişilemedi"
fi

echo "🎉 Hiyerarşik ID sistemi kontrol işlemi tamamlandı!"
echo "📋 HIYERARSIK_ID_SISTEMI.md dosyasını kontrol edin" 