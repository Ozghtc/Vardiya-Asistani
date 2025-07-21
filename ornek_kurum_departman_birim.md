# Örnek Kurum, Departman ve Birim Yapısı

## 🏥 Kurum Örnekleri

### 1. KURUM_001 - Şerik Devlet Hastanesi
- **Kurum ID**: `KURUM_001`
- **Kurum Adı**: Şerik Devlet Hastanesi
- **Kurum Türü**: DEVLET HASTANESİ
- **Konum**: Antalya / Serik

### 2. KURUM_002 - Akdeniz Üniversitesi Hastanesi
- **Kurum ID**: `KURUM_002`
- **Kurum Adı**: Akdeniz Üniversitesi Hastanesi
- **Kurum Türü**: ÜNİVERSİTE HASTANESİ
- **Konum**: Antalya / Konyaaltı

### 3. KURUM_003 - Antalya Eğitim ve Araştırma Hastanesi
- **Kurum ID**: `KURUM_003`
- **Kurum Adı**: Antalya Eğitim ve Araştırma Hastanesi
- **Kurum Türü**: EĞİTİM ARAŞTIRMA HASTANESİ
- **Konum**: Antalya / Muratpaşa

---

## 🏢 Departman ve Birim Yapısı

### KURUM_001 - Şerik Devlet Hastanesi

#### 📍 Acil Servis Departmanı
- **Departman ID**: `KURUM_001_ACIL_SERVIS`
- **Birimler**:
  - `KURUM_001_ACIL_HEMSIRE` - Acil Servis Hemşireleri
  - `KURUM_001_ACIL_DOKTOR` - Acil Servis Doktorları
  - `KURUM_001_ACIL_TEKNIKER` - Acil Servis Tekniker
  - `KURUM_001_ACIL_SEKRETER` - Acil Servis Sekreteri

#### 🫀 Dahiliye Departmanı
- **Departman ID**: `KURUM_001_DAHILIYE`
- **Birimler**:
  - `KURUM_001_DAHILIYE_HEMSIRE` - Dahiliye Hemşireleri
  - `KURUM_001_DAHILIYE_DOKTOR` - Dahiliye Doktorları
  - `KURUM_001_DAHILIYE_SEKRETER` - Dahiliye Sekreteri

#### 🔪 Cerrahi Departmanı
- **Departman ID**: `KURUM_001_CERRAHI`
- **Birimler**:
  - `KURUM_001_CERRAHI_HEMSIRE` - Cerrahi Hemşireleri
  - `KURUM_001_CERRAHI_DOKTOR` - Cerrahi Doktorları
  - `KURUM_001_CERRAHI_TEKNIKER` - Cerrahi Tekniker
  - `KURUM_001_CERRAHI_ANESTEZI` - Anestezi Teknisyeni

#### 🧠 Nöroloji Departmanı
- **Departman ID**: `KURUM_001_NOROLOJI`
- **Birimler**:
  - `KURUM_001_NOROLOJI_HEMSIRE` - Nöroloji Hemşireleri
  - `KURUM_001_NOROLOJI_DOKTOR` - Nöroloji Doktorları
  - `KURUM_001_NOROLOJI_TEKNIKER` - Nöroloji Tekniker

---

### KURUM_002 - Akdeniz Üniversitesi Hastanesi

#### 🚑 Acil Tıp Departmanı
- **Departman ID**: `KURUM_002_ACIL_TIP`
- **Birimler**:
  - `KURUM_002_ACIL_HEMSIRE` - Acil Tıp Hemşireleri
  - `KURUM_002_ACIL_DOKTOR` - Acil Tıp Doktorları
  - `KURUM_002_ACIL_PARAMEDIK` - Paramedik
  - `KURUM_002_ACIL_KOORDINATOR` - Acil Koordinatörü

#### 🫁 Göğüs Hastalıkları Departmanı
- **Departman ID**: `KURUM_002_GOGUS_HASTALIKLARI`
- **Birimler**:
  - `KURUM_002_GOGUS_HEMSIRE` - Göğüs Hastalıkları Hemşireleri
  - `KURUM_002_GOGUS_DOKTOR` - Göğüs Hastalıkları Doktorları
  - `KURUM_002_GOGUS_TEKNIKER` - Solunum Fonksiyon Tekniker

#### 🧪 Laboratuvar Departmanı
- **Departman ID**: `KURUM_002_LABORATUVAR`
- **Birimler**:
  - `KURUM_002_LAB_TEKNIKER` - Laboratuvar Tekniker
  - `KURUM_002_LAB_TEKNISYEN` - Laboratuvar Teknisyeni
  - `KURUM_002_LAB_UZMAN` - Laboratuvar Uzmanı

---

### KURUM_003 - Antalya Eğitim ve Araştırma Hastanesi

#### 👶 Pediatri Departmanı
- **Departman ID**: `KURUM_003_PEDIATRI`
- **Birimler**:
  - `KURUM_003_PEDIATRI_HEMSIRE` - Pediatri Hemşireleri
  - `KURUM_003_PEDIATRI_DOKTOR` - Pediatri Doktorları
  - `KURUM_003_PEDIATRI_OYUN_TERAPISTI` - Oyun Terapisti

#### 🤱 Kadın Doğum Departmanı
- **Departman ID**: `KURUM_003_KADIN_DOGUM`
- **Birimler**:
  - `KURUM_003_DOGUM_HEMSIRE` - Doğum Hemşireleri
  - `KURUM_003_DOGUM_DOKTOR` - Kadın Doğum Doktorları
  - `KURUM_003_DOGUM_EBE` - Ebe

#### 🧠 Psikiyatri Departmanı
- **Departman ID**: `KURUM_003_PSIKIYATRI`
- **Birimler**:
  - `KURUM_003_PSIKIYATRI_HEMSIRE` - Psikiyatri Hemşireleri
  - `KURUM_003_PSIKIYATRI_DOKTOR` - Psikiyatri Doktorları
  - `KURUM_003_PSIKIYATRI_PSIKOLOG` - Klinik Psikolog

---

## 📊 Kullanım Örnekleri

### Kullanıcı Atama Örnekleri:

```javascript
// Örnek Kullanıcı 1 - Acil Servis Hemşiresi
{
  name: "Ayşe Yılmaz",
  email: "ayse.yilmaz@gmail.com",
  rol: "personel",
  kurum_id: "KURUM_001",
  departman_id: "KURUM_001_ACIL_SERVIS", 
  birim_id: "KURUM_001_ACIL_HEMSIRE"
}

// Örnek Kullanıcı 2 - Dahiliye Doktoru
{
  name: "Dr. Mehmet Kaya",
  email: "mehmet.kaya@gmail.com", 
  rol: "yonetici",
  kurum_id: "KURUM_001",
  departman_id: "KURUM_001_DAHILIYE",
  birim_id: "KURUM_001_DAHILIYE_DOKTOR"
}

// Örnek Kullanıcı 3 - Üniversite Hastanesi Lab Tekniker
{
  name: "Fatma Demir",
  email: "fatma.demir@gmail.com",
  rol: "personel", 
  kurum_id: "KURUM_002",
  departman_id: "KURUM_002_LABORATUVAR",
  birim_id: "KURUM_002_LAB_TEKNIKER"
}
```

### Personel Atama Örnekleri:

```javascript
// Örnek Personel 1
{
  ad: "Zeynep",
  soyad: "Özkan", 
  tcno: "12345678901",
  unvan: "Hemşire",
  kurum_id: "KURUM_001",
  departman_id: "KURUM_001_ACIL_SERVIS",
  birim_id: "KURUM_001_ACIL_HEMSIRE"
}

// Örnek Personel 2  
{
  ad: "Ali",
  soyad: "Çelik",
  tcno: "98765432101", 
  unvan: "Doktor",
  kurum_id: "KURUM_002",
  departman_id: "KURUM_002_GOGUS_HASTALIKLARI",
  birim_id: "KURUM_002_GOGUS_DOKTOR"
}
```

---

## 🎯 ID Yapısının Avantajları

### ✅ Hiyerarşik Yapı
- Kurum → Departman → Birim ilişkisi net
- Üst seviyeden alt seviyeye doğru filtreleme kolay

### ✅ Genişletilebilirlik
- Yeni kurum: `KURUM_004`, `KURUM_005`...
- Yeni departman: `KURUM_001_ORTOPEDİ`
- Yeni birim: `KURUM_001_ORTOPEDİ_FİZYOTERAPİST`

### ✅ Okunabilirlik
- ID'den hangi kurum/departman/birim olduğu anlaşılıyor
- Manuel kontrol ve hata ayıklama kolay

### ✅ Veri Bütünlüğü
- Foreign key ilişkileri net
- Yanlış atama riski düşük

---

## 🔧 Teknik Notlar

- **Kurum ID Format**: `KURUM_XXX` (XXX: 001'den başlayan 3 haneli sayı)
- **Departman ID Format**: `{KURUM_ID}_{DEPARTMAN_ADI}`
- **Birim ID Format**: `{KURUM_ID}_{DEPARTMAN_KISALTMA}_{BIRIM_ADI}`
- **Karakter Dönüşümü**: Türkçe karakterler İngilizce karşılığına, boşluklar alt çizgiye dönüştürülür
- **Büyük Harf**: Tüm ID'ler büyük harfle saklanır 