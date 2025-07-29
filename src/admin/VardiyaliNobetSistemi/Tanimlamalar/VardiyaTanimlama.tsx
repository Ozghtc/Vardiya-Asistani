import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useCapitalization } from '../../../hooks/useCapitalization';
import QuickShiftButton from '../../../components/shifts/QuickShiftButton';
import { SuccessNotification } from '../../../components/ui/Notification';
import TanimliVardiyalar from './TanimliVardiyalar';
import { apiRequest, getTableData, addTableData, deleteTableData, clearAllCache, clearTableCache } from '../../../lib/api';
import { useAuthContext } from '../../../contexts/AuthContext';

interface Shift {
  id: number;
  vardiya_adi: string;
  baslangic_saati: string;
  bitis_saati: string;
  calisma_saati: number;
  aktif_mi: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

const VardiyaTanimlama: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, handleNameChange] = useCapitalization('');
  const [startHour, setStartHour] = useState<string>('');
  const [endHour, setEndHour] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  // AuthContext'ten gerçek kullanıcı bilgilerini al
  const getCurrentUser = () => {
    if (user && user.kurum_id && user.departman_id && user.birim_id) {
      return { 
        kurum_id: user.kurum_id, 
        departman_id: user.departman_id, 
        birim_id: user.birim_id 
      };
    }
    return null;
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('Kullanıcı bilgileri yüklenemedi');
        return;
      }

      // KURAL 17: Tüm cache'leri zorla temizle - güvenlik önlemi
      clearAllCache();
      clearTableCache('71');
      
      // KURAL 17: Direkt API çağrısı - cache bypass
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/71',
          method: 'GET',
          // 3-Layer Authentication
          apiKey: import.meta.env.VITE_HZM_API_KEY,
          userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
          projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        // KURAL 17: Güvenli filtreleme - kullanıcı bilgilerine göre
        const filteredShifts = data.data.rows.filter((row: any) => 
          row.kurum_id === currentUser.kurum_id &&
          row.departman_id === currentUser.departman_id &&
          row.birim_id === currentUser.birim_id
        );
        
        const shiftData = filteredShifts.map((row: any) => ({
          id: row.id,
          vardiya_adi: row.vardiya_adi,
          baslangic_saati: row.baslangic_saati,
          bitis_saati: row.bitis_saati,
          calisma_saati: row.calisma_saati || 8,
          aktif_mi: row.aktif_mi,
          kurum_id: row.kurum_id,
          departman_id: row.departman_id,
          birim_id: row.birim_id
        }));
        setShifts(shiftData);
      } else {
        setShifts([]);
      }
    } catch (error) {
      console.error('Vardiya yükleme hatası:', error);
      // Tablo yoksa boş array set et ve bilgilendirici mesaj göster
      setShifts([]);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('404') || errorMessage.includes('401')) {
        setError('Vardiya tablosu bulunamadı. Lütfen önce tabloyu oluşturun.');
      } else {
        setError('Vardiyalar yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const safeName = name || '';
    
    if (!safeName.trim()) {
      setError('Vardiya adı gereklidir');
      return;
    }
    
    if (!startHour || !endHour) {
      setError('Başlangıç ve bitiş saatleri gereklidir');
      return;
    }

    const start = new Date(`2024-01-01 ${startHour}`);
    let end = new Date(`2024-01-01 ${endHour}`);
    if (end <= start) end = new Date(`2024-01-02 ${endHour}`);
    const toplamSaat = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);
      
      // Mevcut vardiyaları kontrol et
      const existingVardiyalar = await getTableData('71', `kurum_id=${currentUser.kurum_id}&departman_id=${currentUser.departman_id}&birim_id=${currentUser.birim_id}`);
      const vardiyaArray = Array.isArray(existingVardiyalar) ? existingVardiyalar : [];
      
      // ÇİFT KAYIT KONTROLÜ - Vardiya adı kontrolü (büyük/küçük harf duyarsız)
      const normalizedNewVardiya = safeName.trim().toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
      const isDuplicate = vardiyaArray.some((vardiya: any) => {
        const normalizedExisting = (vardiya.vardiya_adi || '').toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
        return normalizedExisting === normalizedNewVardiya;
      });
      
      if (isDuplicate) {
        setError(`"${safeName}" vardiyası zaten mevcut. Aynı vardiya adı tekrar eklenemez.`);
        return;
      }
      
      const nextSira = vardiyaArray.length + 1;
      
      // DOĞRU FORMAT: kurum_D#_B#_sira (HIYERARSIK_ID_SISTEMI.md uyumlu)
      const departmanKodu = currentUser.departman_id.split('_')[1] || 'D1'; // "6_D1" -> "D1"
      const birimKodu = currentUser.birim_id.split('_')[1] || 'B1'; // "6_B1" -> "B1"
      const vardiyaId = `${currentUser.kurum_id}_${departmanKodu}_${birimKodu}_${nextSira}`;

      const newShift = {
        vardiya_id: vardiyaId,
        vardiya_adi: safeName.trim(),
        baslangic_saati: startHour,
        bitis_saati: endHour,
        calisma_saati: Math.round(toplamSaat),
        aktif_mi: true,
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id
      };

      // YENİ TABLO ID: 71
      const response = await apiRequest('/api/v1/data/table/71/rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShift),
      });
      
      if (response.success) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('71');
        
        setError('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadShifts(); // Listeyi yenile
        
        console.log('✅ Vardiya eklendi ve liste güncellendi');
      } else {
        setError(response.error || 'Vardiya eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Vardiya ekleme hatası:', error);
      setError('Vardiya eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Bu vardiyayı silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      
      // API çağrısı geçici olarak devre dışı
      console.log('API çağrısı geçici olarak devre dışı - Vardiya silme');
      setError('API bağlantıları geçici olarak devre dışı. Tablolar oluşturulduktan sonra aktif edilecek.');
      return;

      const response = await apiRequest(`/api/v1/data/table/17/rows/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('17');
        
        loadShifts(); // Listeyi yenile
        
        console.log('✅ Vardiya silindi ve liste güncellendi');
      } else {
        setError(response.error || 'Vardiya silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Vardiya silme hatası:', error);
      setError('Vardiya silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (shiftName: string, startHour: string, endHour: string) => {
    // API çağrısı geçici olarak devre dışı
    console.log('API çağrısı geçici olarak devre dışı - Hızlı vardiya ekleme');
    setError('API bağlantıları geçici olarak devre dışı. Tablolar oluşturulduktan sonra aktif edilecek.');
    return;

    if (shifts.some(shift => shift.vardiya_adi === shiftName)) {
      setError(`${shiftName} vardiyası zaten tanımlı`);
      setTimeout(() => setError(''), 2000);
      return;
    }

    const start = new Date(`2024-01-01 ${startHour}`);
    let end = new Date(`2024-01-01 ${endHour}`);
    if (end <= start) end = new Date(`2024-01-02 ${endHour}`);
    const toplamSaat = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const user = getCurrentUser();
    if (!user) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    const newShift = {
      vardiya_adi: shiftName,
      baslangic_saati: startHour,
      bitis_saati: endHour,
      calisma_saati: Math.round(toplamSaat),
      aktif_mi: true,
      kurum_id: user.kurum_id,
      departman_id: user.departman_id,
      birim_id: user.birim_id
    };

    try {
      setLoading(true);
      const response = await apiRequest('/api/v1/data/table/71/rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShift),
      });
      
      if (response.success) {
        // Cache'i zorla temizle
        clearAllCache();
        clearTableCache('71');
        
        setError('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadShifts(); // Listeyi yenile
        
        console.log('✅ Hızlı vardiya eklendi ve liste güncellendi');
      } else {
        setError(response.error || 'Vardiya eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Vardiya ekleme hatası:', error);
      setError('Vardiya eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Yükleniyor, lütfen bekleyin...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Hızlı Vardiya Ekleme */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Hızlı Vardiya Ekleme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickShiftButton
              name="GÜNDÜZ"
              startHour="08:00"
              endHour="16:00"
              isDisabled={shifts.some(s => s.vardiya_adi.toUpperCase() === "GÜNDÜZ")}
              onAdd={handleQuickAdd}
            />
            <QuickShiftButton
              name="AKŞAM"
              startHour="16:00"
              endHour="24:00"
              isDisabled={shifts.some(s => s.vardiya_adi.toUpperCase() === "AKŞAM")}
              onAdd={handleQuickAdd}
            />
            <QuickShiftButton
              name="GECE"
              startHour="00:00"
              endHour="08:00"
              isDisabled={shifts.some(s => s.vardiya_adi.toUpperCase() === "GECE")}
              onAdd={handleQuickAdd}
            />
            <QuickShiftButton
              name="24 SAAT"
              startHour="08:00"
              endHour="08:00"
              isDisabled={shifts.some(s => s.vardiya_adi.toUpperCase() === "24 SAAT")}
              onAdd={handleQuickAdd}
            />
          </div>
        </div>

        {/* Manuel Vardiya Ekleme */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold">Manuel Vardiya Ekleme</h2>
          <div>
            <label className="block text-gray-700 mb-2">Vardiya Adı</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="GECE, SABAH, AKŞAM 1"
              className="w-full rounded-lg border-gray-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              <Clock className="inline-block w-5 h-5 mr-2 text-blue-600" />
              Vardiya Saatleri
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Başlangıç Saati:</label>
                <input
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full rounded-lg border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bitiş Saati:</label>
                <input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full rounded-lg border-gray-300"
                />
              </div>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Ekleniyor...' : 'Vardiya Ekle'}
          </button>
        </form>
      </div>

      {/* Tanımlı Vardiyalar */}
      <TanimliVardiyalar shifts={shifts} onDelete={handleDelete} />
      
      {showSuccess && (
        <SuccessNotification
          message="Vardiya başarıyla eklendi!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default VardiyaTanimlama;