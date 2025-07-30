# 🔐 GÜVENLİK KURULUMU - ENVIRONMENT VARIABLES

## ⚠️ KRİTİK UYARI
API key, şifre gibi hassas bilgiler **asla** git repository'ye commit edilmemelidir!

## 📋 NETLIFY DASHBOARD KURULUMU

### 1. Netlify Dashboard'a Girin
- https://app.netlify.com adresine gidin
- Projenizi seçin: `vardiyaasistani.netlify.app`

### 2. Environment Variables Ekleyin
`Site settings > Environment variables` bölümünde şu değişkenleri ekleyin:

#### Frontend Variables (VITE_ prefix):
```
VITE_BASE_URL = https://hzmbackendveritabani-production.up.railway.app
VITE_API_KEY = hzm_1ce98c92189d4a109cd604b22bfd86b7
VITE_USER_EMAIL = ozgurhzm@gmail.com
VITE_PROJECT_PASSWORD = hzmsoft123456
VITE_PROJECT_ID = 5
```

#### Netlify Functions Variables (prefix yok):
```
API_KEY = hzm_1ce98c92189d4a109cd604b22bfd86b7
USER_EMAIL = ozgurhzm@gmail.com
PROJECT_PASSWORD = hzmsoft123456
```

### 3. Deploy'u Tetikleyin
Environment variables ekledikten sonra:
- "Deploy settings" > "Trigger deploy" > "Clear cache and deploy site"

## 🛡️ GÜVENLİK EN İYİ PRATİKLER

### ✅ YAPILMASI GEREKENLER:
- Environment variables sadece Netlify Dashboard'da ayarlayın
- API key'leri düzenli olarak yenileyin
- Farklı ortamlar için farklı değerler kullanın
- .env dosyalarını .gitignore'a ekleyin

### ❌ YAPILMAMASI GEREKENLER:
- API key'leri kod içine yazmayın
- Şifreleri git'e commit etmeyin
- Hassas bilgileri console.log ile yazdırmayın
- Production ve development için aynı key'leri kullanmayın

## 🔧 DEVELOPMENT KURULUMU

Local development için `.env` dosyası oluşturun:
```bash
# .env (GIT'E COMMIT ETMEYİN!)
VITE_BASE_URL=https://hzmbackendveritabani-production.up.railway.app
VITE_API_KEY=your_api_key_here
VITE_USER_EMAIL=your_email_here
VITE_PROJECT_PASSWORD=your_password_here
VITE_PROJECT_ID=5
```

## 📞 DESTEK
Sorularınız için: ozgurhzm@gmail.com 