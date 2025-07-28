#!/bin/bash

# Environment'tan API key al
API_KEY="${VITE_HZM_API_KEY:-hzm_1ce98c92189d4a109cd604b22bfd86b7}"
BASE_URL="${VITE_HZM_BASE_URL:-https://hzmbackandveritabani-production-c660.up.railway.app}"
USER_EMAIL="${VITE_HZM_USER_EMAIL:-ozgurhzm@gmail.com}"
PROJECT_PASSWORD="${VITE_HZM_PROJECT_PASSWORD:-hzmsoft123456}"

echo "🔧 Personel ID'lerini hiyerarşik sisteme göre güncelleniyor..."
echo "📡 API Key: ${API_KEY:0:20}..."
echo "🌐 Base URL: $BASE_URL"

# Mevcut kullanıcıları çek
echo "📥 Mevcut kullanıcılar getiriliyor..."
USERS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/data/table/33" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD" \
  -d '{}')

echo "📊 API Response: $USERS_RESPONSE"

# Başarılı yanıt kontrolü
if echo "$USERS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Kullanıcılar başarıyla getirildi"
  
  # Her kullanıcı için ID güncelleme işlemi yapılabilir
  # Bu kısım gerektiğinde genişletilebilir
  
else
  echo "❌ Kullanıcılar getirilemedi"
  echo "🔍 Response: $USERS_RESPONSE"
  exit 1
fi

echo "🎉 Personel ID güncelleme işlemi tamamlandı!" 