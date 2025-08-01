import { Alan, NobetGrubu, Vardiya, GenelToplam } from '../types/TanimliAlanlar.types';
import { MONTHLY_MULTIPLIERS } from '../constants/alanConstants';

// Toplam saat hesaplama
export const calculateTotalHours = (nobetler: NobetGrubu[]): number => {
  if (!nobetler || !Array.isArray(nobetler)) return 0;
  return nobetler.reduce((total, nobet) => {
    return total + (nobet.saat * nobet.gunler.length);
  }, 0);
};

// Toplam vardiya hesaplama
export const calculateTotalVardiya = (nobetler: NobetGrubu[]): number => {
  if (!nobetler || !Array.isArray(nobetler)) return 0;
  return nobetler.reduce((total, nobet) => {
    return total + nobet.gunler.length;
  }, 0);
};

// Aktif günler hesaplama
export const calculateActiveDays = (nobetler: NobetGrubu[]): number => {
  if (!nobetler || !Array.isArray(nobetler)) return 0;
  const uniqueDays = new Set();
  nobetler.forEach(nobet => {
    nobet.gunler.forEach(gun => uniqueDays.add(gun));
  });
  return uniqueDays.size;
};

// Alan için aktif günler
export const getActiveDays = (alan: Alan): number => {
  const uniqueDays = new Set<string>();
  if (alan.nobetler && alan.nobetler.length > 0) {
    alan.nobetler.forEach(nobet => {
      if (nobet.gunler && Array.isArray(nobet.gunler)) {
        nobet.gunler.forEach(gun => uniqueDays.add(gun));
      }
    });
  }
  return uniqueDays.size;
};

// Gün için vardiya bilgileri
export const getGunVardiyalari = (parsedVardiyalar: Vardiya[], gunAdi: string): Vardiya[] => {
  return parsedVardiyalar.filter(vardiya => 
    vardiya.gunler && vardiya.gunler.includes(gunAdi)
  );
};

// Gün için toplam saat
export const getGunToplamSaat = (parsedVardiyalar: Vardiya[], gunAdi: string): number => {
  const gunVardiyalari = getGunVardiyalari(parsedVardiyalar, gunAdi);
  return gunVardiyalari.reduce((toplam, vardiya) => toplam + (vardiya.duration || 0), 0);
};

// Haftalık toplam saat
export const getHaftalikToplamSaat = (parsedVardiyalar: Vardiya[], gunler: string[]): number => {
  return gunler.reduce((toplam, gunAdi) => {
    return toplam + getGunToplamSaat(parsedVardiyalar, gunAdi);
  }, 0);
};

// Haftalık toplam vardiya
export const getHaftalikToplamVardiya = (parsedVardiyalar: Vardiya[], gunler: string[]): number => {
  return gunler.reduce((toplam, gunAdi) => {
    return toplam + getGunVardiyalari(parsedVardiyalar, gunAdi).length;
  }, 0);
};

// Aylık hesaplama çarpanı
export const getMonthlyMultiplier = (activeDays: number): number => {
  if (activeDays === 5) return MONTHLY_MULTIPLIERS.FIVE_DAYS;
  if (activeDays === 6) return MONTHLY_MULTIPLIERS.SIX_DAYS;
  return MONTHLY_MULTIPLIERS.DEFAULT;
};

// Genel toplam hesaplama
export const calculateGenelToplam = (alanlar: Alan[]): GenelToplam => {
  return alanlar.reduce((acc, alan) => {
    let alanHaftalikSaat = 0;
    let alanHaftalikVardiya = 0;
    
    try {
      // Alan'ın günlük saatlerini parse et
      const gunlukSaatler = JSON.parse(alan.gunluk_saatler || '{}');
      const aktifGunler = JSON.parse(alan.aktif_gunler || '[]');
      
      // Her aktif gün için saatleri topla
      aktifGunler.forEach((gun: string) => {
        const gunSaat = gunlukSaatler[gun] || 0;
        alanHaftalikSaat += gunSaat;
        alanHaftalikVardiya += 1; // Her gün 1 vardiya
      });
    } catch (error) {
      // Alan hesaplama hatası - varsayılan değerlerle devam et
    }
    
    return {
      haftalikSaat: acc.haftalikSaat + alanHaftalikSaat,
      haftalikVardiya: acc.haftalikVardiya + alanHaftalikVardiya,
      aylikSaat: acc.aylikSaat + (alanHaftalikSaat * 4.33), // 30/7 ≈ 4.33
      aylikVardiya: acc.aylikVardiya + (alanHaftalikVardiya * 4.33)
    };
  }, {
    haftalikSaat: 0,
    haftalikVardiya: 0,
    aylikSaat: 0,
    aylikVardiya: 0
  });
};

// Sayı formatlama
export const formatNumber = (num: number): number => {
  return Math.round(num * 100) / 100;
}; 