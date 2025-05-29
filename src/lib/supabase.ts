import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nskebkbwvkthjswxjejo.supabase.co'
const supabaseKey = '[YOUR-PASSWORD]' // Bu kısmı kendi Supabase projenizin anon key'i ile değiştirmelisiniz

export const supabase = createClient(supabaseUrl, supabaseKey)

// Veritabanı bağlantısını test etmek için örnek fonksiyon
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('your_table').select('*').limit(1)
    if (error) throw error
    console.log('Supabase bağlantısı başarılı:', data)
    return true
  } catch (error) {
    console.error('Supabase bağlantı hatası:', error)
    return false
  }
} 