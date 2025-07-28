#!/bin/bash

# Environment'tan API key al
API_KEY="${VITE_HZM_API_KEY:-hzm_1ce98c92189d4a109cd604b22bfd86b7}"
BASE_URL="${VITE_HZM_BASE_URL:-https://hzmbackandveritabani-production-c660.up.railway.app}"
USER_EMAIL="${VITE_HZM_USER_EMAIL:-ozgurhzm@gmail.com}"
PROJECT_PASSWORD="${VITE_HZM_PROJECT_PASSWORD:-hzmsoft123456}"
TABLE_URL="$BASE_URL/api/v1/data/table/21"

echo "🔄 Tüm personel Tam Mesai (40 saat) olarak güncelleniyor..."

# Tüm personeli al
response=$(curl -s -X GET "$TABLE_URL?kurum_id=18&departman_id=18_ACİL%20SERVİS&birim_id=18_HEMSİRE" \
  -H "X-API-Key: $API_KEY" \
  -H "X-User-Email: $USER_EMAIL" \
  -H "X-Project-Password: $PROJECT_PASSWORD" \
  -H "Content-Type: application/json")

# Personel ID'lerini al
personel_ids=$(echo "$response" | jq -r '.data.rows[].id')

success_count=0
error_count=0

for id in $personel_ids; do
    echo "🔄 Personel ID $id güncelleniyor..."
    
    # Personeli Tam Mesai olarak güncelle
    update_data='{
        "mesai_hesap": "Tam Mesai (40 saat)"
    }'
    
    update_response=$(curl -s -X PUT "$TABLE_URL/rows/$id" \
        -H "X-API-Key: $API_KEY" \
        -H "X-User-Email: $USER_EMAIL" \
        -H "X-Project-Password: $PROJECT_PASSWORD" \
        -H "Content-Type: application/json" \
        -d "$update_data")
    
    if echo "$update_response" | jq -e '.success' > /dev/null; then
        echo "✅ Personel ID $id başarıyla güncellendi"
        ((success_count++))
    else
        echo "❌ Personel ID $id güncellenemedi: $(echo "$update_response" | jq -r '.error // .message')"
        ((error_count++))
    fi
    
    # Rate limit için bekle
    sleep 1
done

echo ""
echo "🎉 GÜNCELLEME TAMAMLANDI!"
echo "✅ Başarılı: $success_count"
echo "❌ Hatalı: $error_count"
echo "📊 Toplam: $((success_count + error_count))" 