import { Alan, Vardiya, ParsedAlanData } from '../types/TanimliAlanlar.types';
import { weekDays } from '../constants/alanConstants';

// Vardiya verilerini parse et
export const parseVardiyaData = (vardiyalar: string): Vardiya[] => {
  try {
    const rawVardiyalar = JSON.parse(vardiyalar || '[]');
    // API'den gelen yapıyı dönüştür
    return rawVardiyalar.map((vardiya: any) => ({
      id: vardiya.id,
      name: vardiya.name,
      startTime: vardiya.hours ? vardiya.hours.split(' - ')[0] : '',
      endTime: vardiya.hours ? vardiya.hours.split(' - ')[1] : '',
      duration: vardiya.duration || 0,
      gunler: vardiya.days || [] // API'de 'days' olarak geliyor
    }));
  } catch (e) {
    // Vardiya parse hatası - varsayılan değerlerle devam et
    return [];
  }
};

// Alan verilerini parse et
export const parseAlanData = (alan: any): ParsedAlanData => {
  let parsedGunlukSaatler = {};
  let parsedAktifGunler: string[] = [];
  let parsedVardiyalar: Vardiya[] = [];
  
  try {
    parsedGunlukSaatler = JSON.parse(alan.gunluk_saatler || '{}');
    parsedAktifGunler = JSON.parse(alan.aktif_gunler || '[]');
    parsedVardiyalar = parseVardiyaData(alan.vardiyalar);
  } catch (e) {
    // JSON parse hatası - varsayılan değerlerle devam et
  }
  
  return {
    parsedGunlukSaatler,
    parsedAktifGunler,
    parsedVardiyalar
  };
};

// API response'unu Alan nesnesine dönüştür
export const mapApiResponseToAlan = (row: any): Alan => {
  const { parsedGunlukSaatler, parsedAktifGunler, parsedVardiyalar } = parseAlanData(row);
  
  // Computed fields'i hesapla - Haftalık toplamlar
  // Her gün için vardiya sayısını ve saatini hesapla
  const gunlukVardiyaSayilari = weekDays.map(gunAdi => {
    return parsedVardiyalar.filter((vardiya: Vardiya) => 
      vardiya.gunler && vardiya.gunler.includes(gunAdi)
    ).length;
  });
  
  const gunlukSaatler = weekDays.map(gunAdi => {
    const gunVardiyalari = parsedVardiyalar.filter((vardiya: Vardiya) => 
      vardiya.gunler && vardiya.gunler.includes(gunAdi)
    );
    return gunVardiyalari.reduce((toplam: number, vardiya: Vardiya) => toplam + (vardiya.duration || 0), 0);
  });
  
  // Haftalık toplam saat = her günün toplam saatlerinin toplamı
  const totalHours = gunlukSaatler.reduce((toplam, gunSaat) => toplam + gunSaat, 0);
  
  // Haftalık toplam vardiya sayısı
  const totalVardiya = gunlukVardiyaSayilari.reduce((toplam, sayi) => toplam + sayi, 0);
  const activeDays = parsedAktifGunler.length;
  
  return {
    id: parseInt(row.id.toString(), 10),
    alan_adi: row.alan_adi,
    aciklama: row.aciklama,
    renk: row.renk,
    gunluk_saatler: row.gunluk_saatler,
    aktif_gunler: row.aktif_gunler,
    vardiyalar: row.vardiyalar,
    kullanici_id: row.kullanici_id,
    kurum_id: row.kurum_id,
    departman_id: row.departman_id,
    birim_id: row.birim_id,
    totalHours: totalHours,
    totalVardiya: totalVardiya,
    activeDays: activeDays,
    nobetler: undefined, // NobetGrubu tipinde olduğu için undefined
    parsedVardiyalar: parsedVardiyalar
  };
};

// API response'unu normalize et
export const normalizeApiResponse = (response: any): any[] => {
  let rows = [];
  
  if (response.success && response.data && response.data.rows) {
    rows = response.data.rows;
  } else if (response.rows) {
    rows = response.rows;
  } else if (Array.isArray(response)) {
    rows = response;
  } else if (response.data && Array.isArray(response.data)) {
    rows = response.data;
  }
  
  return rows || [];
};

// Günlük vardiya gruplarını oluştur
export const createGunlukVardiyaGruplari = (gunVardiyalari: Vardiya[]) => {
  const gunVardiyaGruplari = new Map<string, {name: string, hours: string, duration: number, count: number}>();
  
  gunVardiyalari.forEach((vardiya) => {
    const key = `${vardiya.name}_${vardiya.startTime}_${vardiya.endTime}`;
    if (gunVardiyaGruplari.has(key)) {
      const grup = gunVardiyaGruplari.get(key)!;
      grup.count++;
    } else {
      gunVardiyaGruplari.set(key, {
        name: vardiya.name,
        hours: `${vardiya.startTime} - ${vardiya.endTime}`,
        duration: vardiya.duration,
        count: 1
      });
    }
  });
  
  return Array.from(gunVardiyaGruplari.values());
}; 