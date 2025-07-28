#!/bin/bash

# Environment'tan API key al
API_KEY="${VITE_HZM_API_KEY:-hzm_1ce98c92189d4a109cd604b22bfd86b7}"
BASE_URL="${VITE_HZM_BASE_URL:-https://hzmbackandveritabani-production-c660.up.railway.app}"
USER_EMAIL="${VITE_HZM_USER_EMAIL:-ozgurhzm@gmail.com}"
PROJECT_PASSWORD="${VITE_HZM_PROJECT_PASSWORD:-hzmsoft123456}"

echo "🧹 Veritabanı temizleme işlemi başlatılıyor..."
echo "📡 API Key: ${API_KEY:0:20}..."
echo "🌐 Base URL: $BASE_URL"

# Admin kullanıcısı hariç tüm kullanıcıları sil
echo "👥 Admin hariç kullanıcılar siliniyor..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/33" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$USERS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Kullanıcılar getirildi, admin hariç silme işlemi yapılabilir"
else
  echo "❌ Kullanıcılar getirilemedi"
  echo "🔍 Response: $USERS_RESPONSE"
fi

# Kurumları sil
echo "🏢 Kurumlar siliniyor..."
KURUMLAR_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/30" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$KURUMLAR_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Kurumlar tablosu erişilebilir"
else
  echo "❌ Kurumlar tablosuna erişilemedi"
fi

# Departmanları sil
echo "🏬 Departmanlar siliniyor..."
DEPARTMANLAR_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/34" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$DEPARTMANLAR_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Departmanlar tablosu erişilebilir"
else
  echo "❌ Departmanlar tablosuna erişilemedi"
fi

# Birimleri sil
echo "🏪 Birimler siliniyor..."
BIRIMLER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/35" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$BIRIMLER_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Birimler tablosu erişilebilir"
else
  echo "❌ Birimler tablosuna erişilemedi"
fi

echo "🎉 Veritabanı temizleme işlemi tamamlandı!"
echo "⚠️  Not: Admin kullanıcısı korundu" 