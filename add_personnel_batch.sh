#!/bin/bash

API_KEY="hzm_1ce98c92189d4a109cd604b22bfd86b7"
BASE_URL="https://hzmbackandveritabani-production-c660.up.railway.app/api/v1/data/table/21/rows"

# Kurum bilgileri
KURUM_ID="18"
DEPARTMAN_ID="18_ACİL SERVİS"
BIRIM_ID="18_HEMSİRE"

echo "🚀 Personel 15'erli gruplar halinde ekleniyor..."

# Personel listesi - TC'si olanlar
declare -a personnel=(
    '{"tc_kimlik": "47512266968", "ad": "HAVVA", "soyad": "ÇALIŞKAN", "unvan_id": "1"}'
    '{"tc_kimlik": "13940349610", "ad": "HATİCE", "soyad": "ALTINTAŞ", "unvan_id": "5"}'
    '{"tc_kimlik": "18908405308", "ad": "SEDAT", "soyad": "SAYDAM", "unvan_id": "1"}'
    '{"tc_kimlik": "24845486270", "ad": "RITVAN", "soyad": "TURAN", "unvan_id": "1"}'
    '{"tc_kimlik": "23830069214", "ad": "YENER", "soyad": "ŞİŞEK", "unvan_id": "1"}'
    '{"tc_kimlik": "24049234356", "ad": "MEHMET FATİH", "soyad": "AVCI", "unvan_id": "1"}'
    '{"tc_kimlik": "22516079394", "ad": "ABDULLAH", "soyad": "ÖZÇELEBİ", "unvan_id": "1"}'
    '{"tc_kimlik": "35776638140", "ad": "DOĞAN", "soyad": "CANEŞ", "unvan_id": "1"}'
    '{"tc_kimlik": "22753258576", "ad": "OSMAN", "soyad": "ŞENGÜL", "unvan_id": "1"}'
    '{"tc_kimlik": "33583649786", "ad": "BÜNYAMİN", "soyad": "ERTÜRK", "unvan_id": "1"}'
    '{"tc_kimlik": "12559635220", "ad": "OSMAN", "soyad": "KABAN", "unvan_id": "1"}'
    '{"tc_kimlik": "41209454942", "ad": "MUSTAFA", "soyad": "SOYÇİÇEK", "unvan_id": "1"}'
    '{"tc_kimlik": "23008497474", "ad": "ELİF ÖZGÜRLER", "soyad": "DİBEKLİ", "unvan_id": "1"}'
    '{"tc_kimlik": "70303165836", "ad": "GÖZDE", "soyad": "UĞURLU", "unvan_id": "1"}'
    '{"tc_kimlik": "25474205874", "ad": "NECLA", "soyad": "CAN", "unvan_id": "1"}'
    '{"tc_kimlik": "15052342046", "ad": "GÖKHAN", "soyad": "TAŞAR", "unvan_id": "1"}'
    '{"tc_kimlik": "27433940192", "ad": "EMRE", "soyad": "GÖÇMEN", "unvan_id": "1"}'
    '{"tc_kimlik": "42407014204", "ad": "MUHAMMET VEDAT", "soyad": "HALHALLI", "unvan_id": "1"}'
    '{"tc_kimlik": "45223329538", "ad": "ALİ", "soyad": "GÜLER", "unvan_id": "1"}'
    '{"tc_kimlik": "31030020188", "ad": "VEYSEL", "soyad": "BALCI", "unvan_id": "1"}'
    '{"tc_kimlik": "11743663360", "ad": "NERİMAN", "soyad": "KILINÇ", "unvan_id": "9"}'
    '{"tc_kimlik": "32174071814", "ad": "AHMET", "soyad": "SEVİÇ", "unvan_id": "1"}'
    '{"tc_kimlik": "35914564782", "ad": "EBRU", "soyad": "BOZTOY", "unvan_id": "9"}'
    '{"tc_kimlik": "11281678420", "ad": "MERVE", "soyad": "UZUN", "unvan_id": "1"}'
    '{"tc_kimlik": "40010198328", "ad": "SEDAT", "soyad": "FIRAT", "unvan_id": "1"}'
    '{"tc_kimlik": "10346880730", "ad": "ZİVAN", "soyad": "TURAY", "unvan_id": "1"}'
    '{"tc_kimlik": "15721530644", "ad": "TUĞBA CAMGÖZ", "soyad": "ŞİMŞEK", "unvan_id": "5"}'
    '{"tc_kimlik": "37288237392", "ad": "CEYLAN", "soyad": "ATEŞ", "unvan_id": "9"}'
    '{"tc_kimlik": "31273705996", "ad": "ÖZLEM", "soyad": "KAZANCI", "unvan_id": "1"}'
    '{"tc_kimlik": "20536349046", "ad": "NESLİHAN", "soyad": "BALTACIOĞLU", "unvan_id": "1"}'
    '{"tc_kimlik": "14239580530", "ad": "FATMANUR", "soyad": "GÖÇER", "unvan_id": "1"}'
    '{"tc_kimlik": "17767422792", "ad": "ŞULE", "soyad": "BELEN", "unvan_id": "1"}'
    '{"tc_kimlik": "21799311160", "ad": "HATİCE", "soyad": "ÇETİN", "unvan_id": "1"}'
    '{"tc_kimlik": "55114013224", "ad": "KÜBRA", "soyad": "DURMAZ", "unvan_id": "1"}'
    '{"tc_kimlik": "56656318594", "ad": "MEHMET YAŞAR", "soyad": "TAŞKIRAN", "unvan_id": "1"}'
    '{"tc_kimlik": "10171670452", "ad": "BURAK", "soyad": "ÖZTÜRK", "unvan_id": "1"}'
    '{"tc_kimlik": "28135116984", "ad": "FATMA", "soyad": "BÜYÜKKURT", "unvan_id": "1"}'
    '{"tc_kimlik": "13474313422", "ad": "SERGEN YASİN", "soyad": "UMMAN", "unvan_id": "1"}'
    '{"tc_kimlik": "15625516034", "ad": "FATMA GÜL ATTİLLA", "soyad": "BİLİCİ", "unvan_id": "1"}'
    '{"tc_kimlik": "20176157346", "ad": "ŞEYMANUR", "soyad": "DEMİR", "unvan_id": "1"}'
    '{"tc_kimlik": "17539830770", "ad": "LALE", "soyad": "BOZAN", "unvan_id": "1"}'
    '{"tc_kimlik": "30869164490", "ad": "BURAK", "soyad": "KAHRAMAN", "unvan_id": "1"}'
    '{"tc_kimlik": "42315616110", "ad": "SEDA", "soyad": "ŞAKAR", "unvan_id": "1"}'
    '{"tc_kimlik": "20053385602", "ad": "EMEL", "soyad": "CİN", "unvan_id": "1"}'
    '{"tc_kimlik": "12685631530", "ad": "ÖZGE", "soyad": "EKİZ", "unvan_id": "1"}'
    '{"tc_kimlik": "23338251210", "ad": "ESRA BOZKURT", "soyad": "KINDIR", "unvan_id": "1"}'
    '{"tc_kimlik": "28099118390", "ad": "BİRSEN", "soyad": "TOPCU", "unvan_id": "1"}'
    '{"tc_kimlik": "14509570247", "ad": "NAZMİYE", "soyad": "ATAMAN", "unvan_id": "1"}'
    '{"tc_kimlik": "24253246930", "ad": "FATMA", "soyad": "YILMAZ", "unvan_id": "1"}'
    '{"tc_kimlik": "12931494070", "ad": "ALEYNA", "soyad": "AYKANAT", "unvan_id": "1"}'
    '{"tc_kimlik": "67945207550", "ad": "BARIŞ", "soyad": "TELLİ", "unvan_id": "1"}'
    '{"tc_kimlik": "10592851898", "ad": "MUHAMMET KADIR", "soyad": "TONGUT", "unvan_id": "1"}'
    '{"tc_kimlik": "12653297454", "ad": "NAZLICAN", "soyad": "ELMAS", "unvan_id": "1"}'
    '{"tc_kimlik": "10100099156", "ad": "TUĞÇE", "soyad": "DURMAZ", "unvan_id": "1"}'
    '{"tc_kimlik": "13871759854", "ad": "RIDVAN", "soyad": "AKAN", "unvan_id": "1"}'
    '{"tc_kimlik": "27269284224", "ad": "MİTHAT CAN", "soyad": "KAYA", "unvan_id": "1"}'
    '{"tc_kimlik": "11065636110", "ad": "HASAN SEFA", "soyad": "HATİBOĞLU", "unvan_id": "1"}'
    '{"tc_kimlik": "45700682866", "ad": "ESRA", "soyad": "DURNA", "unvan_id": "1"}'
    '{"tc_kimlik": "33823128606", "ad": "RUMEYSA", "soyad": "ZENGİN", "unvan_id": "1"}'
    '{"tc_kimlik": "25088429222", "ad": "RABİA EZGİ", "soyad": "ULUSOY", "unvan_id": "1"}'
    '{"tc_kimlik": "11557665554", "ad": "ÜMRAN", "soyad": "İLİŞİK", "unvan_id": "1"}'
    '{"tc_kimlik": "17938099174", "ad": "HATİCE", "soyad": "ORHAN", "unvan_id": "1"}'
    '{"tc_kimlik": "12655615270", "ad": "İLKNUR", "soyad": "GÖK", "unvan_id": "1"}'
    '{"tc_kimlik": "17594245984", "ad": "KEBİRE GÜL", "soyad": "GÜN", "unvan_id": "1"}'
    '{"tc_kimlik": "18752787308", "ad": "ZEYNEP ÇETİN", "soyad": "ÇEVİK", "unvan_id": "1"}'
)

# TC'si olmayan personel
declare -a personnel_no_tc=(
    '{"ad": "ASLI DEREM", "soyad": "DEMİRTAŞ", "unvan_id": "1"}'
    '{"ad": "AZİME", "soyad": "AKBINAR", "unvan_id": "1"}'
)

# Ünvan ID'leri:
# 1 = HEMŞİRE
# 5 = ATT  
# 9 = EBE

total_success=0
total_error=0

# 15'erli gruplar halinde işle
for ((i=0; i<${#personnel[@]}; i+=15)); do
    batch_num=$((i/15 + 1))
    end=$((i+15))
    if [ $end -gt ${#personnel[@]} ]; then
        end=${#personnel[@]}
    fi
    
    echo ""
    echo "📦 BATCH $batch_num: $((end-i)) personel işleniyor..."
    echo "=================================="
    
    success_count=0
    error_count=0
    
    # Bu batch'teki personeli işle
    for ((j=i; j<end; j++)); do
        person=${personnel[$j]}
        tc=$(echo $person | jq -r '.tc_kimlik')
        ad=$(echo $person | jq -r '.ad')
        soyad=$(echo $person | jq -r '.soyad')
        unvan_id=$(echo $person | jq -r '.unvan_id')
        
        # Ünvan adını al
        case $unvan_id in
            "1") unvan_adi="HEMŞİRE" ;;
            "5") unvan_adi="ATT" ;;
            "9") unvan_adi="EBE" ;;
            *) unvan_adi="HEMŞİRE" ;;
        esac
        
        # Personel verisi
        person_data=$(cat <<EOF
{
    "tcno": "$tc",
    "ad": "$ad",
    "soyad": "$soyad",
    "unvan": "$unvan_adi",
    "kurum_id": "$KURUM_ID",
    "departman_id": "$DEPARTMAN_ID",
    "birim_id": "$BIRIM_ID",
    "aktif_mi": true
}
EOF
)
        
        echo "➕ $ad $soyad ekleniyor..."
        
        response=$(curl -s -X POST "$BASE_URL" \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$person_data")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            echo "✅ $ad $soyad başarıyla eklendi"
            ((success_count++))
            ((total_success++))
        else
            echo "❌ $ad $soyad eklenemedi: $(echo "$response" | jq -r '.error // .message')"
            ((error_count++))
            ((total_error++))
        fi
        
        # Her personel arasında 1 saniye bekle
        sleep 1
    done
    
    echo ""
    echo "📊 BATCH $batch_num SONUÇU:"
    echo "✅ Başarılı: $success_count"
    echo "❌ Hatalı: $error_count"
    echo "=================================="
    
    # Son batch değilse 5 dakika bekle
    if [ $end -lt ${#personnel[@]} ]; then
        echo ""
        echo "⏰ 5 dakika bekleniyor..."
        sleep 300
    fi
done

# TC'si olmayan personeli ekle
echo ""
echo "📦 SON BATCH: TC'si olmayan personel..."
echo "=================================="

for person in "${personnel_no_tc[@]}"; do
    ad=$(echo $person | jq -r '.ad')
    soyad=$(echo $person | jq -r '.soyad')
    unvan_id=$(echo $person | jq -r '.unvan_id')
    
    # Ünvan adını al
    case $unvan_id in
        "1") unvan_adi="HEMŞİRE" ;;
        "5") unvan_adi="ATT" ;;
        "9") unvan_adi="EBE" ;;
        *) unvan_adi="HEMŞİRE" ;;
    esac
    
    # Personel verisi (TC olmadan)
    person_data=$(cat <<EOF
{
    "ad": "$ad",
    "soyad": "$soyad",
    "unvan": "$unvan_adi",
    "kurum_id": "$KURUM_ID",
    "departman_id": "$DEPARTMAN_ID",
    "birim_id": "$BIRIM_ID",
    "aktif_mi": true
}
EOF
)
    
    echo "➕ $ad $soyad (TC yok) ekleniyor..."
    
    response=$(curl -s -X POST "$BASE_URL" \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "$person_data")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        echo "✅ $ad $soyad başarıyla eklendi"
        ((total_success++))
    else
        echo "❌ $ad $soyad eklenemedi: $(echo "$response" | jq -r '.error // .message')"
        ((total_error++))
    fi
    
    sleep 1
done

echo ""
echo "🎉 TÜM İŞLEMLER TAMAMLANDI!"
echo "=================================="
echo "✅ Toplam Başarılı: $total_success"
echo "❌ Toplam Hatalı: $total_error"
echo "📊 Toplam: $((total_success + total_error))"
echo "==================================" 