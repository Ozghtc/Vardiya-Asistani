// 3-Layer API Key Configuration
export const API_CONFIG = {
  apiKey: import.meta.env.VITE_HZM_API_KEY,
  userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
  projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD,
  baseURL: import.meta.env.VITE_HZM_BASE_URL || 'https://hzmbackendveritabani-production.up.railway.app'
};

export const colorMap = {
  '#DC2626': 'Kırmızı',
  '#059669': 'Yeşil', 
  '#2563EB': 'Mavi',
  '#7C3AED': 'Mor',
  '#EA580C': 'Turuncu',
  '#CA8A04': 'Sarı',
  '#DB2777': 'Pembe',
  '#0891B2': 'Turkuaz',
  '#4B5563': 'Gri',
  '#312E81': 'Lacivert',
  '#991B1B': 'Bordo',
  '#166534': 'Koyu Yeşil',
  '#1E40AF': 'Kraliyet Mavisi',
  '#92400E': 'Kahverengi',
  '#4338CA': 'İndigo',
  '#6B21A8': 'Mor',
  '#0F766E': 'Çam Yeşili',
  '#3730A3': 'Gece Mavisi',
  '#9F1239': 'Vişne',
  '#1F2937': 'Antrasit',
  '#831843': 'Magenta',
  '#115E59': 'Okyanus',
  '#86198F': 'Fuşya',
  '#374151': 'Kömür'
} as const;

export const weekDays = [
  { value: 'Pazartesi', name: 'Pazartesi', short: 'Pzt' },
  { value: 'Salı', name: 'Salı', short: 'Sal' },
  { value: 'Çarşamba', name: 'Çarşamba', short: 'Çar' },
  { value: 'Perşembe', name: 'Perşembe', short: 'Per' },
  { value: 'Cuma', name: 'Cuma', short: 'Cum' },
  { value: 'Cumartesi', name: 'Cumartesi', short: 'Cmt' },
  { value: 'Pazar', name: 'Pazar', short: 'Paz' }
];

export const vardiyalar = [
  { name: 'GÜNDÜZ', hours: '08:00 - 16:00', duration: 8 },
  { name: 'AKŞAM', hours: '16:00 - 24:00', duration: 8 },
  { name: 'GECE', hours: '00:00 - 08:00', duration: 8 },
  { name: '24 SAAT', hours: '08:00 - 08:00', duration: 24 },
  { name: 'SABAH', hours: '08:00 - 13:00', duration: 5 },
  { name: 'ÖĞLE', hours: '13:00 - 18:00', duration: 5 },
  { name: 'GEÇ', hours: '16:00 - 08:00', duration: 16 },
  { name: 'GÜNDÜZ UZUN', hours: '08:00 - 00:00', duration: 16 }
]; 