# TEST2 KURUM EKLEME TESTİ

## 📋 TEST VERILERI:
- **Kurum Adı:** TEST2 HASTANESI
- **Departmanlar:** DAHILIYE, CERRAHI
- **Birimler:** DOKTOR, HEMSIRE, TEKNISYEN

## 🔍 KONTROL EDİLECEKLER:

### 1️⃣ KURUMLAR TABLOSU (ID: 30)
**Beklenen:**
```
kurum_id: "03" (veya sonraki ID)
kurum_adi: "TEST2 HASTANESI"
DEPARTMAN_ID: "03_D1,03_D2"
DEPARTMAN_ADI: "DAHILIYE, CERRAHI"
BIRIM_ID: "03_B1,03_B2,03_B3"
BIRIM: "DOKTOR, HEMSIRE, TEKNISYEN"
```

### 2️⃣ DEPARTMANLAR TABLOSU (ID: 34)
**Beklenen:**
```
03_D1 → DAHILIYE
03_D2 → CERRAHI
```

### 3️⃣ BIRIMLER TABLOSU (ID: 35)
**Beklenen:**
```
03_B1 → DOKTOR
03_B2 → HEMSIRE
03_B3 → TEKNISYEN
```

### 4️⃣ FRONTEND PARSING
**Beklenen:**
```
departmanlar array: [{id: "03_D1", departman_adi: "DAHILIYE"}, {id: "03_D2", departman_adi: "CERRAHI"}]
birimler array: [{id: "03_B1", birim_adi: "DOKTOR"}, {id: "03_B2", birim_adi: "HEMSIRE"}, {id: "03_B3", birim_adi: "TEKNISYEN"}]
```

## ✅ TEST ADIMI:
1. Frontend'de Kurum Yönetimi → Kurum Ekle
2. Yukarıdaki bilgileri gir
3. Kaydet
4. Konsol loglarını kontrol et
5. Database'i kontrol et 