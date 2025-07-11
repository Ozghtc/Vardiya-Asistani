VARDIYA/
├── node_modules/
├── public/
│   └── _redirects
├── rules/
│   ├── .CursorRools
│   ├── ProgramYapisi.md
│   └── README.md
├── src/
│   ├── admin/
│   │   ├── AdminPage.tsx                  # [Ekran] Yönetici Ana Paneli (Tüm modüllere giriş)
│   │
│   │   ├── PersonelPaneli/
│   │   │   ├── PersonelPaneli.tsx         # [Ekran] Personel Paneli (Kendi nöbet/izin işlemleri)
│   │   │   ├── Nobetlerim.tsx             # [Sekme] Personel Paneli > Nöbetlerim
│   │   │   └── IstekTaleplerim.tsx        # [Sekme] Personel Paneli > İstek Taleplerim
│   │
│   │   ├── VardiyaliNobetSistemi/
│   │   │   ├── NobetYonetimi.tsx          # [Ekran] Vardiyalı Nöbet Sistemi Ana Menüsü
│   │   │
│   │   │   ├── NobetIslemleri/
│   │   │   │   ├── NobetEkrani.tsx        # [Ekran] Nöbet Takvimi ve Planlama
│   │   │   │   ├── NobetKurallari.tsx     # [Ekran] Nöbet Kuralları
│   │   │   │   ├── NobetKurallariV2.tsx   # [Ekran] Alternatif Nöbet Kuralları
│   │   │   │   ├── NobetNavigation.tsx    # [Bölüm] Nöbet İşlemleri Navigasyonu
│   │   │   │   ├── NobetOlustur.tsx       # [Ekran] Nöbet Oluşturma
│   │   │   │   ├── Raporlar.tsx           # [Ekran] Nöbet Raporları
│   │   │   │   └── VardiyaPlanla.tsx      # [Ekran] Nöbet Planlama Ana Ekranı
│   │   │
│   │   │   ├── PersonelEkle/
│   │   │   │   ├── PersonelEkle.tsx           # [Ekran] Personel Ekleme Formu (sekmeli)
│   │   │   │   ├── PersonelBilgileri.tsx      # [Sekme] Personel Bilgileri
│   │   │   │   ├── GirisBilgileri.tsx         # [Sekme] Giriş Bilgileri
│   │   │   │   ├── PersonelIstek.tsx          # [Sekme] İstek ve İzinler
│   │   │   │   └── PersonelNobetTanimlama.tsx # [Sekme] Nöbet Tanımlama
│   │   │
│   │   │   ├── PersonelListesi/
│   │   │   │   └── PersonelListesi.tsx    # [Ekran] Tüm Personellerin Listelendiği Ekran
│   │   │
│   │   │   ├── Tanimlamalar/
│   │   │   │   ├── AlanTanimlama.tsx          # [Ekran] Alan Tanımlama
│   │   │   │   ├── Tanimlamalar.tsx           # [Ekran] Tanımlamalar Ana Sekmesi
│   │   │   │   ├── TanimliAlanlar.tsx         # [Ekran] Tanımlı Alanlar Listesi
│   │   │   │   ├── TanimliVardiyalar.tsx      # [Ekran] Tanımlı Vardiyalar Listesi
│   │   │   │   ├── UnvanPersonelTanimlama.tsx # [Ekran] Ünvan ve Personel Tanımlama
│   │   │   │   ├── VardiyaTanimlama.tsx       # [Ekran] Vardiya Tanımlama
│   │   │   │   └── VardiyaliNobet.tsx         # [Ekran] Vardiyalı Nöbet Sistemi Ana Menüsü
│   │   │   └── SistemTanimlamalari.tsx        # [Ekran] (Kullanılmıyor veya eski, silinebilir)
│   │
│   │   ├── KullaniciYonetimi/
│   │   │   └── KullaniciEkle.tsx          # [Ekran] Kullanıcı Ekleme
│   │
│   │   ├── KurumYonetimi/
│   │   │   └── KurumEkle.tsx              # [Ekran] Kurum Ekleme
│
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx                 # [Bileşen] Üst Menü/Bar
│   │   │   ├── Layout.tsx                 # [Bileşen] Genel Sayfa Yerleşimi
│   │   │   └── Sidebar.tsx                # [Bileşen] Yan Menü
│   │   ├── shifts/
│   │   │   ├── QuickShiftButton.tsx       # [Bileşen] Hızlı Vardiya Ekle Butonu
│   │   │   └── ShiftItem.tsx              # [Bileşen] Vardiya Kartı/Listesi
│   │   ├── ui/
│   │   │   ├── DeleteConfirmDialog.tsx    # [Bileşen] Silme Onay Dialogu
│   │   │   └── Notification.tsx           # [Bileşen] Bildirim/Toast
│   │   └── SupabaseTest.tsx               # [Bileşen] Supabase Bağlantı Testi (geliştirici aracı)
│
│   ├── hooks/
│   │   ├── useCapitalization.ts           # [Hook] Metinleri Otomatik Büyük Harf Yapma
│   │   └── useLocalStorage.ts             # [Hook] LocalStorage ile State Yönetimi
│
│   ├── lib/
│   │   └── supabase.ts                    # [Yardımcı] Supabase Bağlantı Ayarları
│
│   ├── types/                             # [Tipler] Proje genelinde kullanılan TypeScript tipleri
│
│   ├── App.tsx                            # [Giriş] Uygulama Ana Bileşeni
│   ├── index.css                          # [Stil] Global CSS
│   ├── main.tsx                           # [Giriş] React Uygulama Başlatıcı
│   └── vite-env.d.ts                      # [Tip] Vite ortam değişkenleri tipi
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── netlify.toml
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
