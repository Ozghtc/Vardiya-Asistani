#!/bin/bash

# Personellere Hiyerarşik ID Sistemi Uygulama Scripti
# Format: {kurum_id}_{departman_sira}_{birim_sira}_{personel_sira}

API_KEY="hzm_1ce98c92189d4a109cd604b22bfd86b7"
BASE_URL="https://hzmbackandveritabani-production-c660.up.railway.app"
TABLE_ID="21"

echo "🔄 Personellere hiyerarşik ID sistemi uygulanıyor..."

# Tüm personelleri al
PERSONNEL_DATA=$(curl -s -X GET "$BASE_URL/api/v1/data/table/$TABLE_ID" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json")

# Personel sayısını hesapla
PERSONNEL_COUNT=$(echo "$PERSONNEL_DATA" | jq '.data.rows | length')

echo "📊 Toplam $PERSONNEL_COUNT personel bulundu."

# Her personel için hiyerarşik ID uygula
for i in $(seq 0 $((PERSONNEL_COUNT-1))); do
    PERSONNEL_ID=$(echo "$PERSONNEL_DATA" | jq -r ".data.rows[$i].id")
    PERSONNEL_NAME=$(echo "$PERSONNEL_DATA" | jq -r ".data.rows[$i].ad")
    PERSONNEL_SURNAME=$(echo "$PERSONNEL_DATA" | jq -r ".data.rows[$i].soyad")
    PERSONNEL_UNVAN=$(echo "$PERSONNEL_DATA" | jq -r ".data.rows[$i].unvan")
    
    # Personel sırasını hesapla (1'den başla)
    PERSONNEL_SIRA=$((i+1))
    
    # Hiyerarşik ID oluştur
    HIERARCHICAL_ID="18_1_1_$PERSONNEL_SIRA"
    
    # Departman ve birim ID'lerini belirle
    DEPARTMAN_ID="18_D1_ACİL SERVİS"
    
    # Ünvana göre birim ID'sini belirle
    if [[ "$PERSONNEL_UNVAN" == "ATT" ]]; then
        BIRIM_ID="18_B2_DOKTORLUK"
    elif [[ "$PERSONNEL_UNVAN" == "EBE" ]]; then
        BIRIM_ID="18_B3_EBELİK"
    else
        BIRIM_ID="18_B1_HEMSİRELİK"
    fi
    
    echo "🔄 ID $PERSONNEL_ID: $PERSONNEL_NAME $PERSONNEL_SURNAME ($PERSONNEL_UNVAN) -> $HIERARCHICAL_ID"
    
    # Personel bilgilerini güncelle
    curl -s -X PUT "$BASE_URL/api/v1/data/table/$TABLE_ID/rows/$PERSONNEL_ID" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "{
        \"departman_id\": \"$DEPARTMAN_ID\",
        \"birim_id\": \"$BIRIM_ID\"
      }" > /dev/null
    
    # Kısa bekleme
    sleep 0.1
done

echo "✅ Tüm personellere hiyerarşik ID sistemi uygulandı!"
echo "📋 Özet:"
echo "   - Kurum: 18 (Serik Devlet Hastanesi)"
echo "   - Departman: 1 (ACİL SERVİS)"
echo "   - Birimler: 1 (HEMSİRELİK), 2 (DOKTORLUK), 3 (EBELİK)"
echo "   - Personel Sırası: 1'den $PERSONNEL_COUNT'a kadar" 