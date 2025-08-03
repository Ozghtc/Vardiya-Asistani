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
  { value: 'pazartesi', label: 'Pazartesi' },
  { value: 'sali', label: 'Salı' },
  { value: 'carsamba', label: 'Çarşamba' },
  { value: 'persembe', label: 'Perşembe' },
  { value: 'cuma', label: 'Cuma' },
  { value: 'cumartesi', label: 'Cumartesi' },
  { value: 'pazar', label: 'Pazar' }
];

export const vardiyalar = [
  { name: '08:00-16:00', start: '08:00', end: '16:00' },
  { name: '16:00-00:00', start: '16:00', end: '00:00' },
  { name: '00:00-08:00', start: '00:00', end: '08:00' }
];

export const API_CONFIG = {
  apiKey: import.meta.env.VITE_HZM_API_KEY,
  userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
  projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD,
  baseURL: import.meta.env.VITE_HZM_BASE_URL || 'https://hzmbackendveritabani-production.up.railway.app'
}; 