#!/bin/bash
# Environment'tan API key al
API_KEY="${VITE_HZM_API_KEY}"
BASE_URL="${VITE_HZM_BASE_URL:-https://hzmbackendveritabani-production.up.railway.app}"
USER_EMAIL="${VITE_HZM_USER_EMAIL}"
PROJECT_PASSWORD="${VITE_HZM_PROJECT_PASSWORD}"

echo "👥 Personel ekleme işlemi başlatılıyor..."
echo "📡 API Key: ${API_KEY:0:20}..."
echo "🌐 Base URL: $BASE_URL"

# Personel tablosunu kontrol et
echo "📊 Personel tablosu kontrol ediliyor..."
PERSONNEL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/data/table/33" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD")

if echo "$PERSONNEL_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Personel tablosu erişilebilir"
  
  # Mevcut personel sayısını göster
  PERSONNEL_COUNT=$(echo "$PERSONNEL_RESPONSE" | grep -o '"rows":\[.*\]' | grep -o '\[.*\]' | grep -o ',' | wc -l)
  echo "📊 Mevcut personel sayısı: $((PERSONNEL_COUNT + 1))"
  
else
  echo "❌ Personel tablosuna erişilemedi"
  echo "🔍 Response: $PERSONNEL_RESPONSE"
fi

echo "🎉 Personel ekleme kontrol işlemi tamamlandı!"
echo "💡 Yeni personel eklemek için frontend arayüzünü kullanın" 