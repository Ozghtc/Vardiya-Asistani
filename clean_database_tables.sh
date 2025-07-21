#!/bin/bash

# Veritabanı Tablolarını Temizleme Scripti
# Kullanıcılar (13) ve Kurumlar (10) hariç tüm tabloları temizler

API_KEY="hzm_1ce98c92189d4a109cd604b22bfd86b7"
BASE_URL="https://hzmbackandveritabani-production-c660.up.railway.app"

echo "🧹 Veritabanı tablolarını temizleme işlemi başlatılıyor..."
echo "⚠️  Kullanıcılar (13) ve Kurumlar (10) tabloları korunacak!"
echo ""

# Temizlenecek tablolar (kullanıcılar ve kurumlar hariç)
declare -a TABLES_TO_CLEAN=(
    "15:personel_unvan_tanimlama"
    "16:izin_istek_tanimlama"
    "17:vardiya_tanimlama"
    "18:tanimli_alanlar"
    "19:test_table"
    "21:personel_bilgileri"
    "22:nobet_tanimlama"
    "23:personel_talepleri"
    "24:personel_gun_mesai_tanimlama"
    "25:YeniAlanTanimlama"
)

# Her tablo için temizleme işlemi
for table_info in "${TABLES_TO_CLEAN[@]}"; do
    IFS=':' read -r table_id table_name <<< "$table_info"
    
    echo "🔄 Tablo: $table_name (ID: $table_id)"
    
    # Tablo verilerini al
    table_data=$(curl -s -X GET "$BASE_URL/api/v1/data/table/$table_id" \
      -H "X-API-Key: $API_KEY" \
      -H "Content-Type: application/json")
    
    # Kayıt sayısını hesapla
    record_count=$(echo "$table_data" | jq '.data.rows | length')
    
    if [ "$record_count" -eq 0 ]; then
        echo "   ✅ Zaten boş, atlanıyor..."
        continue
    fi
    
    echo "   📊 $record_count kayıt bulundu, siliniyor..."
    
    # Her kaydı sil
    for i in $(seq 0 $((record_count-1))); do
        record_id=$(echo "$table_data" | jq -r ".data.rows[$i].id")
        
        echo "     🗑️  Kayıt ID $record_id siliniyor..."
        
        curl -s -X DELETE "$BASE_URL/api/v1/data/table/$table_id/rows/$record_id" \
          -H "X-API-Key: $API_KEY" > /dev/null
        
        # Rate limiting
        sleep 0.1
    done
    
    echo "   ✅ $table_name tablosu temizlendi!"
    echo ""
done

echo "🎉 Tablo temizleme işlemi tamamlandı!"
echo ""
echo "✅ Korunan Tablolar:"
echo "   - Tablo 10: kurumlar"
echo "   - Tablo 13: kullanicilar"
echo ""
echo "🧹 Temizlenen Tablolar:"
for table_info in "${TABLES_TO_CLEAN[@]}"; do
    IFS=':' read -r table_id table_name <<< "$table_info"
    echo "   - Tablo $table_id: $table_name"
done
echo ""
echo "🚀 Artık yeni sistem kurulabilir!" 