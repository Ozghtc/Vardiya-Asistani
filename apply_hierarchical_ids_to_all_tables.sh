#!/bin/bash

# Tüm Tablolara Hiyerarşik ID Sistemi Uygulama Scripti
# Format: {kurum_id}_{departman_sira}_{birim_sira}_{tablo_id}_{kayit_sira}

API_KEY="hzm_1ce98c92189d4a109cd604b22bfd86b7"
BASE_URL="https://hzmbackandveritabani-production-c660.up.railway.app"

echo "🚀 Tüm tablolara hiyerarşik ID sistemi uygulanıyor..."

# Tablo ID'leri ve isimleri
declare -A TABLES=(
    ["10"]="kurumlar"
    ["13"]="kullanicilar" 
    ["15"]="personel_unvan_tanimlama"
    ["16"]="izin_istek_tanimlama"
    ["17"]="vardiya_tanimlama"
    ["18"]="tanimli_alanlar"
    ["19"]="test_table"
    ["21"]="personel_bilgileri"
    ["22"]="nobet_tanimlama"
    ["23"]="personel_talepleri"
    ["24"]="personel_gun_mesai_tanimlama"
    ["25"]="YeniAlanTanimlama"
)

# Kurum ID'si (Serik Devlet Hastanesi)
KURUM_ID="18"
DEPARTMAN_SIRA="1"  # ACİL SERVİS
BIRIM_SIRA="1"      # HEMSİRELİK (varsayılan)

# Her tablo için işlem yap
for TABLE_ID in "${!TABLES[@]}"; do
    TABLE_NAME="${TABLES[$TABLE_ID]}"
    echo ""
    echo "🔄 Tablo: $TABLE_NAME (ID: $TABLE_ID)"
    
    # Tablo verilerini al
    TABLE_DATA=$(curl -s -X GET "$BASE_URL/api/v1/data/table/$TABLE_ID" \
      -H "X-API-Key: $API_KEY" \
      -H "Content-Type: application/json")
    
    # Kayıt sayısını hesapla
    RECORD_COUNT=$(echo "$TABLE_DATA" | jq '.data.rows | length')
    
    if [ "$RECORD_COUNT" -eq 0 ]; then
        echo "   ⚠️  Boş tablo, atlanıyor..."
        continue
    fi
    
    echo "   📊 $RECORD_COUNT kayıt bulundu"
    
    # Tablo tipine göre field'ları belirle
    case $TABLE_NAME in
        "kurumlar")
            # Kurumlar tablosuna kurum_kodu field'ı ekle
            echo "   🏢 Kurum kodları ekleniyor..."
            ;;
        "kullanicilar")
            # Kullanıcılar zaten hiyerarşik ID'ye sahip, atla
            echo "   👤 Kullanıcılar zaten hiyerarşik ID'ye sahip, atlanıyor..."
            continue
            ;;
        "personel_bilgileri")
            # Personel bilgileri zaten güncellendi, atla
            echo "   👥 Personel bilgileri zaten güncellendi, atlanıyor..."
            continue
            ;;
        *)
            # Diğer tablolar için kurum_id, departman_id, birim_id ekle
            echo "   🔧 Hiyerarşik ID'ler ekleniyor..."
            ;;
    esac
    
    # Her kayıt için hiyerarşik ID uygula
    for i in $(seq 0 $((RECORD_COUNT-1))); do
        RECORD_ID=$(echo "$TABLE_DATA" | jq -r ".data.rows[$i].id")
        
        # Kayıt sırasını hesapla (1'den başla)
        KAYIT_SIRA=$((i+1))
        
        # Hiyerarşik ID oluştur
        HIERARCHICAL_ID="${KURUM_ID}_${DEPARTMAN_SIRA}_${BIRIM_SIRA}_${TABLE_ID}_${KAYIT_SIRA}"
        
        echo "     🔄 Kayıt ID $RECORD_ID -> Hiyerarşik ID: $HIERARCHICAL_ID"
        
        # Tablo tipine göre güncelleme yap
        case $TABLE_NAME in
            "kurumlar")
                # Kurumlar için kurum_kodu ekle
                curl -s -X PUT "$BASE_URL/api/v1/data/table/$TABLE_ID/rows/$RECORD_ID" \
                  -H "Content-Type: application/json" \
                  -H "X-API-Key: $API_KEY" \
                  -d "{
                    \"kurum_kodu\": \"$HIERARCHICAL_ID\"
                  }" > /dev/null
                ;;
            *)
                # Diğer tablolar için kurum_id, departman_id, birim_id ekle
                curl -s -X PUT "$BASE_URL/api/v1/data/table/$TABLE_ID/rows/$RECORD_ID" \
                  -H "Content-Type: application/json" \
                  -H "X-API-Key: $API_KEY" \
                  -d "{
                    \"kurum_id\": \"$KURUM_ID\",
                    \"departman_id\": \"${KURUM_ID}_D${DEPARTMAN_SIRA}_ACİL SERVİS\",
                    \"birim_id\": \"${KURUM_ID}_B${BIRIM_SIRA}_HEMSİRELİK\",
                    \"hiyerarsik_id\": \"$HIERARCHICAL_ID\"
                  }" > /dev/null
                ;;
        esac
        
        # Rate limiting
        sleep 0.1
    done
    
    echo "   ✅ $TABLE_NAME tablosu tamamlandı!"
done

echo ""
echo "🎉 Tüm tablolara hiyerarşik ID sistemi başarıyla uygulandı!"
echo ""
echo "📋 Uygulanan Sistem:"
echo "   Format: {kurum_id}_{departman_sira}_{birim_sira}_{tablo_id}_{kayit_sira}"
echo "   Örnek: 18_1_1_15_1 (Kurum 18, Departman 1, Birim 1, Tablo 15, Kayıt 1)"
echo ""
echo "🏗️ Hiyerarşi:"
echo "   - Kurum: 18 (Serik Devlet Hastanesi)"
echo "   - Departman: 1 (ACİL SERVİS)"
echo "   - Birim: 1 (HEMSİRELİK)"
echo "   - Tablo: 10-25 (Farklı tablolar)"
echo "   - Kayıt: 1-N (Tablodaki kayıt sırası)" 