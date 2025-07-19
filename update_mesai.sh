#!/bin/bash

API_KEY="hzm_1ce98c92189d4a109cd604b22bfd86b7"
BASE_URL="https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/21"

echo "🔄 Tüm personel Tam Mesai (40 saat) olarak güncelleniyor..."

# Tüm personeli al
response=$(curl -s -X GET "$BASE_URL?kurum_id=18&departman_id=18_ACİL%20SERVİS&birim_id=18_HEMSİRE" \
  -H "X-API-Key: $API_KEY" \
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
    
    update_response=$(curl -s -X PUT "$BASE_URL/rows/$id" \
        -H "X-API-Key: $API_KEY" \
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