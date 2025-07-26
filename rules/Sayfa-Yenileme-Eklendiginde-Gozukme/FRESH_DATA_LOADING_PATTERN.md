# Fresh Data Loading Pattern

📌 **Bu pattern, sayfa açıldığında cache'den değil, doğrudan API'den fresh data çekmek için kullanılır.**

---

## 🎯 **Kullanım Amacı**

- Sayfa açıldığında eski/cached veriler göstermemek
- Kullanıcıdan manuel refresh istememek
- Production ortamında gerçek zamanlı veri garantisi
- Cache sorunlarını otomatik çözmek

---

## 📋 **Pattern Yapısı**

### 1. **Component State Yönetimi**
```typescript
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(true);
```

### 2. **Fresh Data Loading Function**
```typescript
const loadData = async (forceRefresh: boolean = true) => {
  if (!dataTableId) return;
  
  console.log('🔄 FRESH DATA ÇEKILIYOR - Cache temizleniyor!');
  
  try {
    // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
    const apiData = await getData(dataTableId, forceRefresh);
    setData(apiData);
    console.log('✅ FRESH DATA YÜKLENDI:', apiData.length, 'kayıt');
  } catch (error) {
    console.error('❌ Data yüklenirken hata:', error);
  }
};
```

### 3. **Component Mount useEffect**
```typescript
// Sayfa ilk açıldığında data yükle
useEffect(() => {
  console.log('🚀 COMPONENT AÇILDI - Fresh data çekiliyor');
  if (dataTableId) {
    loadData(true);
  }
}, []); // Component mount olduğunda bir kez çalış
```

### 4. **Data ID Change useEffect**
```typescript
// Data ID değiştiğinde data yükle
useEffect(() => {
  if (dataTableId) {
    loadData(true); // Her zaman fresh data
  }
}, [dataTableId]);
```

---

## 🔧 **API Function Pattern**

### API Function Signature:
```typescript
export const getData = async (tableId: number, forceRefresh: boolean = false) => {
  try {
    // 🧹 CACHE TEMİZLE
    if (forceRefresh) {
      clearAllCache();
      clearTableCache(String(tableId));
      clearJWTToken();
      console.log('🧹 DATA CACHE TEMİZLENDİ - FRESH DATA ÇEKILIYOR');
    }
    
    const token = await getJWTToken();
    
    // API call...
    const response = await fetch(/* API endpoint */);
    const data = await response.json();
    
    return data.data?.rows || [];
  } catch (error) {
    logError('getData hatası', error);
    return [];
  }
};
```

---

## 📝 **Gerçek Kullanım Örneği**

### KullaniciYonetimPaneli.tsx'den:

```typescript
// Load users from API - HER ZAMAN FRESH DATA
const loadUsers = async (forceRefresh: boolean = true) => {
  if (!usersTableId) return;
  
  console.log('🔄 FRESH USER DATA ÇEKILIYOR - Cache temizleniyor!');
  
  try {
    // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
    const apiUsers = await getUsers(usersTableId, forceRefresh);
    setUsers(apiUsers);
    console.log('✅ FRESH USER DATA YÜKLENDI:', apiUsers.length, 'kullanıcı');
  } catch (error) {
    console.error('❌ Kullanıcılar yüklenirken hata:', error);
  }
};

// Sayfa ilk açıldığında kullanıcıları yükle
useEffect(() => {
  console.log('🚀 KULLANICI PANELİ AÇILDI - Fresh data çekiliyor');
  if (usersTableId) {
    loadUsers(true);
  }
}, []); // Component mount olduğunda bir kez çalış

// Kullanıcıları yükle - Sayfa açılınca ve tablo ID değişince
useEffect(() => {
  if (usersTableId) {
    loadUsers(true); // Her zaman fresh data
  }
}, [usersTableId]);
```

---

## ✅ **Pattern Avantajları**

### 1. **Otomatik Cache Temizleme**
- Sayfa açıldığında cache otomatik temizlenir
- Fresh data garantisi

### 2. **Kullanıcı Dostu**
- Manuel refresh gerekmez
- "Sayfayı yenileyin" demek zorunda kalmayız

### 3. **Production Ready**
- Gerçek zamanlı veri
- Cache sorunları otomatik çözülür

### 4. **Debug Friendly**
- Console log'lar ile takip edilebilir
- Hangi aşamada olduğu belli

---

## 🚨 **Önemli Notlar**

### 1. **forceRefresh Parametresi**
- **true**: Cache temizle, fresh data çek
- **false**: Cache varsa kullan

### 2. **useEffect Dependencies**
- `[]` → Component mount'ta bir kez
- `[dependency]` → Dependency değişince

### 3. **Error Handling**
- Her zaman try/catch kullan
- Error durumunda boş array döndür

### 4. **Performance**
- Fresh data çekmek daha yavaş
- Ama veri tutarlılığı için gerekli

---

## 🎯 **Kullanım Alanları**

- ✅ Kullanıcı yönetim panelleri
- ✅ Kurum yönetim sayfaları
- ✅ Veri listeleme sayfaları
- ✅ Dashboard'lar
- ✅ Raporlama sayfaları

---

## 📚 **İlgili Dosyalar**

- `src/admin/KullaniciYonetimi/KullaniciYonetimPaneli.tsx`
- `src/admin/KurumYonetimi/KurumYonetimi.tsx`
- `src/lib/api.ts`
- `src/hooks/useApiState.ts`

---

*Bu pattern, cache sorunlarını önlemek ve kullanıcı deneyimini iyileştirmek için geliştirilmiştir.* 