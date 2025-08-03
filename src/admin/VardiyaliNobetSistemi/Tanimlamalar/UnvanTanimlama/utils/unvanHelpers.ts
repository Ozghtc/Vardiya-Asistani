/**
 * Türkçe karakterleri İngilizce karşılıklarına çevirir (normalization)
 */
export const normalizeText = (text: string): string => {
  return text
    .trim()
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C');
};

/**
 * İki string'i normalize ederek karşılaştırır
 */
export const isTextEqual = (text1: string, text2: string): boolean => {
  return normalizeText(text1) === normalizeText(text2);
};

/**
 * Array içinde duplicate kontrol yapar (normalize edilmiş text ile)
 */
export const isDuplicateUnvan = (
  unvanArray: any[], 
  newUnvan: string, 
  fieldName: string = 'unvan_adi'
): boolean => {
  const normalizedNew = normalizeText(newUnvan);
  return unvanArray.some((item: any) => {
    const normalizedExisting = normalizeText(item[fieldName] || '');
    return normalizedExisting === normalizedNew;
  });
};

/**
 * Array içinde mesai saati duplicate kontrol yapar
 */
export const isDuplicateMesaiSaati = (
  mesaiArray: any[], 
  newSaat: number
): boolean => {
  return mesaiArray.some((mesai: any) => {
    return parseInt(mesai.mesai_saati) === parseInt(newSaat.toString());
  });
};

/**
 * Parent ID formatını oluşturur (Sequential ID API için)
 */
export const createParentId = (
  kurum_id: string,
  departman_id: string,
  birim_id: string
): string => {
  const departmanKodu = departman_id.split('_')[1] || 'D1';
  const birimKodu = birim_id.split('_')[1] || 'B1';
  return `${kurum_id}_${departmanKodu}_${birimKodu}`;
};

/**
 * Kullanıcı bilgilerini filtreleme için karşılaştırır
 */
export const matchesUserContext = (
  item: any,
  user: { kurum_id?: string; departman_id?: string; birim_id?: string }
): boolean => {
  return (
    item.kurum_id === user.kurum_id &&
    item.departman_id === user.departman_id &&
    item.birim_id === user.birim_id
  );
}; 