# Cache Clearing After Data Operations

📌 **Bu pattern, veri ekleme/güncelleme/silme işlemlerinden sonra cache'i temizleyip fresh data çekmek için kullanılır.**

---

## 🚨 **Yaygın Sorun**

**Problem:** Veri ekleme işleminden sonra yeni veri listede görünmüyor.

**Sebep:** Cache temizlenmediği için eski veriler gösteriliyor.

**Belirtiler:**
- Kurum ekleme → Hemen görünüyor ✅
- Kullanıcı ekleme → Görünmüyor ❌
- Sayfa yenileme → Görünüyor ✅

---

## 🔍 **Sorun Analizi**

### ❌ **Yanlış Yaklaşım (Eksik Cache Temizleme):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const result = await addData(tableId, formData);
    if (result.success) {
      showToast({ type: 'success', message: 'Başarıyla eklendi!' });
      
      // ❌ SADECE RELOAD - CACHE TEMİZLENMİYOR
      await loadData(true);
      
      resetForm();
    }
  } catch (error) {
    console.error('Hata:', error);
  }
};
```

### ✅ **Doğru Yaklaşım (Tam Cache Temizleme):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const result = await addData(tableId, formData);
    if (result.success) {
      showToast({ type: 'success', message: 'Başarıyla eklendi!' });
      
      // ✅ ÖNCE CACHE TEMİZLE
      clearAllCache(); // Tüm cache'i temizle
      clearTableCache(String(tableId)); // İlgili tablo cache'ini temizle
      
      // ✅ SONRA ZORLA YENİLE
      await loadData(true); // 🚀 FORCE REFRESH!
      
      resetForm();
    }
  } catch (error) {
    console.error('Hata:', error);
  }
};
```

---

## 📋 **Standart Pattern**

### 1. **Veri Ekleme İşlemi**
```typescript
const handleAdd = async (formData: any) => {
  try {
    const result = await addData(tableId, formData);
    if (result.success) {
      // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
      clearAllCache(); // Tüm cache'i temizle
      clearTableCache(String(tableId)); // İlgili tablo cache'ini temizle
      
      // Veri listesini ZORLA yeniden yükle
      await loadData(true); // 🚀 FORCE REFRESH!
      
      showSuccessMessage('Başarıyla eklendi!');
      resetForm();
    }
  } catch (error) {
    showErrorMessage('Ekleme hatası: ' + error.message);
  }
};
```

### 2. **Veri Güncelleme İşlemi**
```typescript
const handleUpdate = async (id: string, formData: any) => {
  try {
    const result = await updateData(tableId, id, formData);
    if (result.success) {
      // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
      clearAllCache();
      clearTableCache(String(tableId));
      
      // Veri listesini ZORLA yeniden yükle
      await loadData(true);
      
      showSuccessMessage('Başarıyla güncellendi!');
      setEditingItem(null);
    }
  } catch (error) {
    showErrorMessage('Güncelleme hatası: ' + error.message);
  }
};
```

### 3. **Veri Silme İşlemi**
```typescript
const handleDelete = async (id: string) => {
  try {
    const result = await deleteData(tableId, id);
    if (result.success) {
      // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
      clearAllCache();
      clearTableCache(String(tableId));
      
      // Veri listesini ZORLA yeniden yükle
      await loadData(true);
      
      showSuccessMessage('Başarıyla silindi!');
      setSelectedItem(null);
    }
  } catch (error) {
    showErrorMessage('Silme hatası: ' + error.message);
  }
};
```

---

## 🔧 **Gerekli Import'lar**

```typescript
import { clearAllCache, clearTableCache } from '../lib/api';
```

---

## 📝 **Gerçek Kullanım Örnekleri**

### Kurum Ekleme (Çalışan Örnek):
```typescript
// src/admin/KurumYonetimi/KurumYonetimi.tsx
const response = await addKurum(kurumData);
if (response.success) {
  // 🔄 CACHE TEMİZLE VE VERİLERİ YENİLE
  clearAllCache(); // Tüm cache'i temizle
  clearTableCache('30'); // kurumlar_hiyerarsik
  clearTableCache('34'); // departmanlar
  clearTableCache('35'); // birimler
  
  // Kurum listesini ZORLA yeniden yükle
  await loadKurumlar(true); // 🚀 FORCE REFRESH! 
  
  setSuccessMsg('Kurum başarıyla kaydedildi!');
}
```

### Kullanıcı Ekleme (Düzeltilmiş Örnek):
```typescript
// src/admin/KullaniciYonetimi/KullaniciYonetimPaneli.tsx
const result = await addUser(usersTableId, formData);
if (result.success) {
  showToast({
    type: 'success',
    title: 'Kullanıcı Eklendi',
    message: `${formData.name} başarıyla sisteme eklendi.`
  });
  
  // 🧹 CACHE TEMİZLE VE FRESH DATA ÇEK
  clearAllCache(); // Tüm cache'i temizle
  clearTableCache(String(usersTableId)); // kullanicilar_final tablosu
  
  // Kullanıcı listesini ZORLA yeniden yükle
  await loadUsers(true); // 🚀 FORCE REFRESH!
  
  resetForm();
}
```

---

## ⚡ **Hızlı Kontrol Listesi**

Veri işlemi sonrası kontrol edin:

- [ ] `clearAllCache()` çağrıldı mı?
- [ ] `clearTableCache(tableId)` çağrıldı mı?
- [ ] `await loadData(true)` ile zorla yenileme yapıldı mı?
- [ ] İlgili tüm tablo cache'leri temizlendi mi?
- [ ] Success mesajı gösterildi mi?
- [ ] Form sıfırlandı mı?

---

## 🚨 **Yaygın Hatalar**

### 1. **Await Eksikliği**
```typescript
// ❌ YANLIŞ
loadData(true); // await yok!

// ✅ DOĞRU  
await loadData(true);
```

### 2. **Cache Temizleme Eksikliği**
```typescript
// ❌ YANLIŞ
await loadData(true); // Cache temizlenmedi

// ✅ DOĞRU
clearAllCache();
clearTableCache(String(tableId));
await loadData(true);
```

### 3. **İlgili Tabloları Unutma**
```typescript
// ❌ YANLIŞ - Sadece ana tablo
clearTableCache('30'); // sadece kurumlar

// ✅ DOĞRU - Tüm ilgili tablolar
clearTableCache('30'); // kurumlar
clearTableCache('34'); // departmanlar  
clearTableCache('35'); // birimler
```

### 4. **forceRefresh Parametresi Eksikliği**
```typescript
// ❌ YANLIŞ
await loadData(); // forceRefresh yok

// ✅ DOĞRU
await loadData(true); // forceRefresh=true
```

---

## 🎯 **Uygulama Alanları**

Bu pattern şu durumları çözer:

### ✅ **Çözülen Sorunlar:**
- Yeni eklenen veri görünmüyor
- Güncellenen veri eski haliyle görünüyor
- Silinen veri hala listede
- Sayfa yenileme gereksinimi
- Cache tutarsızlığı

### 📱 **Kullanım Alanları:**
- Kullanıcı yönetimi
- Kurum yönetimi
- Departman/Birim yönetimi
- Ürün/Hizmet listeleri
- Tüm CRUD işlemleri

---

## 🔄 **İlgili Dosyalar**

- `src/lib/api.ts` - Cache fonksiyonları
- `src/admin/KullaniciYonetimi/KullaniciYonetimPaneli.tsx`
- `src/admin/KurumYonetimi/KurumYonetimi.tsx`
- `FRESH_DATA_LOADING_PATTERN.md`

---

## 💡 **Pro Tips**

### 1. **Batch Cache Clearing**
```typescript
// Birden fazla tablo varsa hepsini temizle
const clearRelatedCaches = (mainTableId: string) => {
  clearAllCache();
  clearTableCache(mainTableId);
  clearTableCache('related_table_1');
  clearTableCache('related_table_2');
};
```

### 2. **Error Handling**
```typescript
try {
  await addData(tableId, formData);
  clearAllCache();
  await loadData(true);
} catch (error) {
  // Cache temizleme başarısız olsa bile hata verme
  console.warn('Cache temizleme hatası:', error);
  await loadData(true); // Yine de yenile
}
```

### 3. **Loading States**
```typescript
const [refreshing, setRefreshing] = useState(false);

const handleAdd = async (formData: any) => {
  setRefreshing(true);
  try {
    await addData(tableId, formData);
    clearAllCache();
    await loadData(true);
  } finally {
    setRefreshing(false);
  }
};
```

---

*Bu pattern, veri tutarlılığını sağlamak ve kullanıcı deneyimini iyileştirmek için kritik öneme sahiptir.* 