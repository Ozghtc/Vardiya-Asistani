import React, { useState, useEffect } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

interface PersonelBilgisi {
  id: number;
  ad: string;
  soyad: string;
  unvan: string;
  tcno: string;
  email: string;
  telefon: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}



const PersonelIstek: React.FC = () => {
  const { user } = useAuthContext();
  const [personelListesi, setPersonelListesi] = useState<PersonelBilgisi[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-07');
  const [startDate, setStartDate] = useState<string>('2025-07-01');
  const [endDate, setEndDate] = useState<string>('2025-07-31');

  // Aydan tarihleri oluştur
  const generateDatesFromMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  // Ay değiştiğinde tarihleri güncelle
  useEffect(() => {
    generateDatesFromMonth(selectedMonth);
  }, [selectedMonth]);

  // Personel listesini çek
  useEffect(() => {
    const fetchPersonelListesi = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/21',
            method: 'GET'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.rows) {
            // Kullanıcının kurum/departman/birim'ine göre filtreleme
            const filteredPersonnel = result.data.rows.filter((person: PersonelBilgisi) => 
              person.kurum_id === user.kurum_id &&
              person.departman_id === user.departman_id &&
              person.birim_id === user.birim_id &&
              person.aktif_mi
            );
            
            setPersonelListesi(filteredPersonnel);
          }
        }
      } catch (error) {
        console.error('Personel listesi yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonelListesi();
  }, [user]);

  // Ay adını Türkçe göster
  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Tarihi formatla
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
        </div>

        {/* Başlık ve Tarih Seçici */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {getMonthName(selectedMonth)} Dönemi
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Başlangıç</span>
                <span className="font-semibold">{formatDate(startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Bitiş</span>
                <span className="font-semibold">{formatDate(endDate)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ay Seçin
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Personel Tablosu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ünvan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : personelListesi.length > 0 ? (
                  personelListesi.map((personel) => (
                    <tr key={personel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {personel.ad.charAt(0)}{personel.soyad.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {personel.ad} {personel.soyad}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {personel.unvan}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Personel bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonelIstek;