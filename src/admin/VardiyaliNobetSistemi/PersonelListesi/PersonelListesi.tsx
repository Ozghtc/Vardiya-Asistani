import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MoreVertical, Mail, Phone, Building2, ArrowRight, Clock, Calendar, User2, Users, FileText, X, Check } from 'lucide-react';
import DeleteConfirmDialog from '../../../components/ui/DeleteConfirmDialog';
import { useAuthContext } from '../../../contexts/AuthContext';
import PersonelIstek from '../PersonelEkle/PersonelIstek';

interface Personnel {
  id: number;
  tcno: string;
  ad: string;
  soyad: string;
  unvan: string;
  email: string;
  telefon: string;
  giris_email?: string;
  kullanici_sayfasi_aktif?: boolean;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

interface TanimliAlan {
    id: number;
  alan_adi: string;
  alan_kodu: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
  renk?: string; // Veri tabanından gelen renk bilgisi
}

interface NobetTanimlamaPopup {
  isOpen: boolean;
  personel: Personnel | null;
}

interface NobetKombinasyonu {
  gunler: string[];
  alanlar: number[];
  alanAdlari: string[];
}

interface KayitliNobetTanimlamasi {
    id: number;
  personel_id: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  gunler: string;
  alanlar: string;
  alan_adlari: string;
  aktif_mi: boolean;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

const PersonelListesi: React.FC = () => {
  const [activeTab, setActiveTab] = useState('liste');
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; personId?: number}>({
    isOpen: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nobetTanimlamaPopup, setNobetTanimlamaPopup] = useState<NobetTanimlamaPopup>({
    isOpen: false,
    personel: null
  });
  const [tanimliAlanlar, setTanimliAlanlar] = useState<TanimliAlan[]>([]);
  const [selectedGunler, setSelectedGunler] = useState<string[]>([]);
  const [selectedAlanlar, setSelectedAlanlar] = useState<number[]>([]);
  const [tumunuSec, setTumunuSec] = useState(false);
  const [tanimliAlanlarLoading, setTanimliAlanlarLoading] = useState(false);
  const [nobetKombinasyonlari, setNobetKombinasyonlari] = useState<NobetKombinasyonu[]>([]);
  const [kayitliNobetTanimlama, setKayitliNobetTanimlama] = useState<KayitliNobetTanimlamasi[]>([]);
  const [kayitliNobetLoading, setKayitliNobetLoading] = useState(false);
  const [nobetFilter, setNobetFilter] = useState<'tum' | 'tanimli' | 'tanimsiz'>('tum');
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const loadPersonnel = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
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
          const filteredPersonnel = result.data.rows.filter((person: Personnel) => 
            person.kurum_id === user.kurum_id &&
            person.departman_id === user.departman_id &&
            person.birim_id === user.birim_id
          );
          
          setPersonnel(filteredPersonnel);
        } else {
          setError('Personel verileri yüklenemedi');
        }
      } else {
        setError('API çağrısı başarısız');
      }
    } catch (error) {
      console.error('Personel yükleme hatası:', error);
      setError('Personel verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadTanimliAlanlar = async () => {
    if (!user) return;
    
    try {
      setTanimliAlanlarLoading(true);
      
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/18',
          method: 'GET'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rows) {
          // Kullanıcının kurum/departman/birim'ine göre filtreleme
          const filteredAlanlar = result.data.rows.filter((alan: TanimliAlan) => 
            alan.kurum_id === user.kurum_id &&
            alan.departman_id === user.departman_id &&
            alan.birim_id === user.birim_id &&
            alan.aktif_mi
          );
          
          setTanimliAlanlar(filteredAlanlar);
        }
      }
    } catch (error) {
      console.error('Tanımlı alanlar yükleme hatası:', error);
    } finally {
      setTanimliAlanlarLoading(false);
    }
  };

  const loadKayitliNobetTanimlama = async () => {
    if (!user) return;
    
    try {
      setKayitliNobetLoading(true);
      
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/22',
          method: 'GET'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rows) {
          console.log('Nöbet tanımlamaları yüklendi:', result.data.rows);
          console.log('Kullanıcı bilgileri:', user);
          
          // Kullanıcının kurum/departman/birim'ine göre filtreleme
          const filteredNobetler = result.data.rows.filter((nobet: KayitliNobetTanimlamasi) => 
            nobet.kurum_id === user.kurum_id &&
            nobet.departman_id === user.departman_id &&
            nobet.birim_id === user.birim_id &&
            nobet.aktif_mi
          );
          
          console.log('Filtrelenmiş nöbet tanımlamaları:', filteredNobetler);
          setKayitliNobetTanimlama(filteredNobetler);
        }
      }
    } catch (error) {
      console.error('Kayıtlı nöbet tanımlamaları yükleme hatası:', error);
    } finally {
      setKayitliNobetLoading(false);
    }
  };

  useEffect(() => {
    loadPersonnel();
    loadTanimliAlanlar();
    loadKayitliNobetTanimlama();
  }, [user]);

  const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];



  // Alan rengi fonksiyonu
  const getAlanRengi = (alanAdi: string) => {
    const renkler: { [key: string]: string } = {
      'CERRAHİ': 'bg-red-100 text-red-800 border-red-200',
      'AŞI': 'bg-green-100 text-green-800 border-green-200',
      'YEŞİL ALAN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'ENJEKSİYON': 'bg-blue-100 text-blue-800 border-blue-200',
      'TRİYAJ': 'bg-purple-100 text-purple-800 border-purple-200',
      'GÖZLEM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'MÜDAHALE': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    
    // Alan adında anahtar kelime arama
    for (const [kelime, renk] of Object.entries(renkler)) {
      if (alanAdi.toUpperCase().includes(kelime)) {
        return renk;
      }
    }
    
    // Varsayılan renk
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Veri tabanından alan rengini bulma fonksiyonu
  const getAlanRengiFromDB = (alanAdi: string) => {
    const alan = tanimliAlanlar.find(a => a.alan_adi === alanAdi);
    if (alan && alan.renk) {
      return alan.renk;
    }
    return null;
  };

  // Sadece yazı rengi için alan fonksiyonu
  const getAlanYaziRengi = (alanAdi: string) => {
    // Önce veri tabanından renk bilgisini dene
    const dbRenk = getAlanRengiFromDB(alanAdi);
    if (dbRenk) {
      // Hex renk kodunu CSS style olarak döndür
      return `#${dbRenk.replace('#', '')}`;
    }
    
    // Veri tabanında renk yoksa varsayılan renkleri kullan
    const renkler: { [key: string]: string } = {
      'CERRAHİ': '#DC2626',
      'AŞI': '#059669',
      'YEŞİL ALAN': '#059669',
      'ENJEKSİYON': '#2563EB',
      'TRİYAJ': '#7C3AED',
      'GÖZLEM': '#EAB308',
      'MÜDAHALE': '#EA580C'
    };
    
    // Alan adında anahtar kelime arama
    for (const [kelime, renk] of Object.entries(renkler)) {
      if (alanAdi.toUpperCase().includes(kelime)) {
        return renk;
      }
    }
    
    // Varsayılan renk
    return '#6B7280';
  };

  // Gün kısaltma fonksiyonu
  const getGunKisaltma = (gun: string) => {
    const kisaltmalar: { [key: string]: string } = {
      'Pazartesi': 'Pzt',
      'Salı': 'Sal',
      'Çarşamba': 'Çar',
      'Perşembe': 'Per',
      'Cuma': 'Cum',
      'Cumartesi': 'Cmt',
      'Pazar': 'Paz'
    };
    return kisaltmalar[gun] || gun;
  };

  // Günler render fonksiyonu - gün bazlı gruplama
  const renderGunler = (gunlerArray: string[], alanlarArray: string[]) => {
    const tumGunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    // Atanmış günleri göster
    const atanmisGunler = tumGunler.filter(gun => gunlerArray.includes(gun));
    
    if (atanmisGunler.length === 0) {
      return <span className="text-xs text-red-600">Hiç gün atanmamış</span>;
    }
    
    // Alanları kısalt ve renklendir
    const alanlarMetni = alanlarArray.slice(0, 3).map((alan, idx) => (
      <span key={idx}>
        <span style={{ color: getAlanYaziRengi(alan) }} className="font-medium">
          {alan}
        </span>
        {idx < Math.min(alanlarArray.length, 3) - 1 && <span className="text-gray-400">-</span>}
      </span>
    ));
    
    return (
      <span className="text-xs">
        {atanmisGunler.map((gun, index) => (
          <span key={gun}>
            <span className="font-medium text-gray-700">
              {getGunKisaltma(gun)}
            </span>
            <span className="text-gray-500"> (</span>
            {alanlarMetni}
            {alanlarArray.length > 3 && <span className="text-gray-400">...</span>}
            <span className="text-gray-500">)</span>
            {index < atanmisGunler.length - 1 && <span className="text-gray-400">, </span>}
          </span>
        ))}
      </span>
    );
  };

  // Alanlar render fonksiyonu
  const renderAlanlar = (alanlarArray: string[]) => {
    return (
      <span className="text-xs">
        {alanlarArray.map((alan, index) => (
          <span key={index}>
            <span 
              className="font-medium"
              style={{ color: getAlanYaziRengi(alan) }}
            >
              {alan}
            </span>
            {index < alanlarArray.length - 1 && <span className="text-gray-500">, </span>}
          </span>
        ))}
      </span>
    );
  };

  const getPersonelNobetTanimlama = (personelId: number) => {
    return kayitliNobetTanimlama.filter(nobet => parseInt(nobet.personel_id) === personelId);
  };

  const getFilteredPersonnel = () => {
    return personnel.filter(person => {
      const personelNobetler = getPersonelNobetTanimlama(person.id);
      const hasNobet = personelNobetler.length > 0;
      
      switch (nobetFilter) {
        case 'tanimli':
          return hasNobet;
        case 'tanimsiz':
          return !hasNobet;
        case 'tum':
        default:
          return true;
      }
    });
  };

  const getPersonelIstatistikleri = () => {
    const toplamPersonel = personnel.length;
    const nobetTanimliPersonel = personnel.filter(person => getPersonelNobetTanimlama(person.id).length > 0).length;
    const nobetTanimsizPersonel = toplamPersonel - nobetTanimliPersonel;
    const toplamNobetTanimlama = kayitliNobetTanimlama.length;
    
    return {
      toplamPersonel,
      nobetTanimliPersonel,
      nobetTanimsizPersonel,
      toplamNobetTanimlama
    };
  };

  const handleNobetTanimlamaOpen = (personel: Personnel) => {
    setNobetTanimlamaPopup({
      isOpen: true,
      personel: personel
    });
    
    // Tüm günleri otomatik seç
    setSelectedGunler([...gunler]);
    
    // Tüm alanları otomatik seç
    const tumAlanIds = tanimliAlanlar.map(alan => alan.id);
    setSelectedAlanlar(tumAlanIds);
    setTumunuSec(true);
    
    setNobetKombinasyonlari([]);
  };

  const handleNobetTanimlamaClose = () => {
    setNobetTanimlamaPopup({
      isOpen: false,
      personel: null
    });
    setSelectedGunler([]);
    setSelectedAlanlar([]);
    setTumunuSec(false);
    setNobetKombinasyonlari([]);
  };

  const handleGunToggle = (gun: string) => {
    setSelectedGunler(prev => 
      prev.includes(gun) 
        ? prev.filter(g => g !== gun)
        : [...prev, gun]
    );
  };

  const isKombinasyonVarMi = (gunler: string[], alanlar: number[]) => {
    return nobetKombinasyonlari.some(kombinasyon => {
      const ayniGunler = gunler.every(gun => kombinasyon.gunler.includes(gun)) && 
                         kombinasyon.gunler.every(gun => gunler.includes(gun));
      const ayniAlanlar = alanlar.every(alan => kombinasyon.alanlar.includes(alan)) && 
                          kombinasyon.alanlar.every(alan => alanlar.includes(alan));
      return ayniGunler && ayniAlanlar;
    });
  };

  const isGunDisabled = (gun: string) => {
    // Bu gün daha önce herhangi bir alanla eklenmiş mi?
    return nobetKombinasyonlari.some(kombinasyon => 
      kombinasyon.gunler.includes(gun)
    );
  };

  const isAlanDisabled = (alanId: number) => {
    // Bu alan daha önce herhangi bir günle eklenmiş mi?
    return nobetKombinasyonlari.some(kombinasyon => 
      kombinasyon.alanlar.includes(alanId)
    );
  };

  const handleAlanToggle = (alanId: number) => {
    setSelectedAlanlar(prev => {
      const newSelected = prev.includes(alanId) 
        ? prev.filter(id => id !== alanId)
        : [...prev, alanId];
      
      // Tümünü seç durumunu güncelle
      setTumunuSec(newSelected.length === tanimliAlanlar.length);
      
      return newSelected;
    });
  };

  const handleTumunuSecToggle = () => {
    const newTumunuSec = !tumunuSec;
    setTumunuSec(newTumunuSec);
    
    if (newTumunuSec) {
      setSelectedAlanlar(tanimliAlanlar.map(alan => alan.id));
    } else {
      setSelectedAlanlar([]);
    }
  };

  const handleNobetEkle = () => {
    if (selectedGunler.length === 0 || selectedAlanlar.length === 0) return;
    
    // Seçili alanların isimlerini al
    const alanAdlari = selectedAlanlar.map(alanId => {
      const alan = tanimliAlanlar.find(a => a.id === alanId);
      return alan ? alan.alan_adi : '';
    }).filter(Boolean);
    
    // Yeni kombinasyonu ekle
    const yeniKombinasyon: NobetKombinasyonu = {
      gunler: [...selectedGunler],
      alanlar: [...selectedAlanlar],
      alanAdlari: alanAdlari
    };
    
    setNobetKombinasyonlari(prev => [...prev, yeniKombinasyon]);
    
    // Seçimleri sıfırla
    setSelectedGunler([]);
    setSelectedAlanlar([]);
    setTumunuSec(false);
  };

  const handleNobetKaydet = async () => {
    if (!nobetTanimlamaPopup.personel || nobetKombinasyonlari.length === 0) return;
    
    try {
      // Her kombinasyon için ayrı kayıt oluştur
      const kayitPromises = nobetKombinasyonlari.map(kombinasyon => 
        fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/22/rows',
            method: 'POST',
            body: {
              personel_id: nobetTanimlamaPopup.personel!.id,
              kurum_id: nobetTanimlamaPopup.personel!.kurum_id,
              departman_id: nobetTanimlamaPopup.personel!.departman_id,
              birim_id: nobetTanimlamaPopup.personel!.birim_id,
              gunler: JSON.stringify(kombinasyon.gunler),
              alanlar: JSON.stringify(kombinasyon.alanlar),
              alan_adlari: JSON.stringify(kombinasyon.alanAdlari),
              aktif_mi: true,
              olusturma_tarihi: new Date().toISOString(),
              guncelleme_tarihi: new Date().toISOString()
            }
          })
        })
      );
      
      const results = await Promise.all(kayitPromises);
      
      // Tüm kayıtlar başarılı mı kontrol et
      const allSuccess = results.every(response => response.ok);
      
      if (allSuccess) {
        // Kayıtlı nöbet tanımlamalarını yeniden yükle
        await loadKayitliNobetTanimlama();
    
        // Popup'ı kapat
        handleNobetTanimlamaClose();
        
        alert('Nöbet tanımlamaları başarıyla kaydedildi!');
      } else {
        alert('Kayıt sırasında bir hata oluştu!');
      }
    } catch (error) {
      console.error('Nöbet tanımlama kaydetme hatası:', error);
      alert('Kayıt sırasında bir hata oluştu!');
    }
  };

  const handleKombinasyonSil = (index: number) => {
    setNobetKombinasyonlari(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/api/v1/data/table/21/rows/${id}`,
          method: 'DELETE'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPersonnel(prev => prev.filter(p => p.id !== id));
    setSelectedPerson(null);
        } else {
          alert('Personel silinirken bir hata oluştu');
        }
      } else {
        alert('Personel silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Personel silme hatası:', error);
      alert('Personel silinirken bir hata oluştu');
    }
  };

  const tabs = [
    { 
      id: 'liste', 
      name: 'Personel Listesi', 
      icon: <Users className="w-5 h-5" />,
      description: 'Personel listesi ve yönetimi'
    },
    { 
      id: 'nobet', 
      name: 'Nöbet Tanımlama', 
      icon: <Calendar className="w-5 h-5" />,
      description: 'Personel nöbet tanımlamaları'
    },
    { 
      id: 'istek', 
      name: 'İstek ve İzinler', 
      icon: <FileText className="w-5 h-5" />,
      description: 'Özel istekler ve izin talepleri'
    }
  ];

  const renderPersonelListesi = () => {
    const filteredPersonnel = getFilteredPersonnel();
    const istatistikler = getPersonelIstatistikleri();

  return (
    <div className="space-y-6">
        {/* Filtre Butonları ve İstatistikler */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Personel Filtreleri</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setNobetFilter('tum')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  nobetFilter === 'tum'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tüm Personel ({istatistikler.toplamPersonel})
              </button>
              <button
                onClick={() => setNobetFilter('tanimli')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  nobetFilter === 'tanimli'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nöbet Tanımlı ({istatistikler.nobetTanimliPersonel})
              </button>
              <button
                onClick={() => setNobetFilter('tanimsiz')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  nobetFilter === 'tanimsiz'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nöbet Tanımsız ({istatistikler.nobetTanimsizPersonel})
              </button>
            </div>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Toplam Personel</p>
                  <p className="text-2xl font-bold text-blue-900">{istatistikler.toplamPersonel}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Nöbet Tanımlı</p>
                  <p className="text-2xl font-bold text-green-900">{istatistikler.nobetTanimliPersonel}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Nöbet Tanımsız</p>
                  <p className="text-2xl font-bold text-red-900">{istatistikler.nobetTanimsizPersonel}</p>
                </div>
                <User2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Toplam Tanımlama</p>
                  <p className="text-2xl font-bold text-purple-900">{istatistikler.toplamNobetTanimlama}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Personel Tablosu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {filteredPersonnel.length} personel görüntüleniyor
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TC Kimlik No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ünvan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersonnel.map((person) => {
                  const personelNobetler = getPersonelNobetTanimlama(person.id);
                  
                  return (
                    <React.Fragment key={person.id}>
                      {/* Ana personel satırı */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {person.ad} {person.soyad}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{person.tcno}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {person.unvan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            person.aktif_mi 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {person.aktif_mi ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleNobetTanimlamaOpen(person)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <Calendar className="w-4 h-4" />
                            Nöbet Tanımla
                          </button>
                        </td>
                      </tr>

                      {/* Kayıtlı nöbet tanımlamaları */}
                      {personelNobetler.map((nobet) => {
                        try {
                          const gunlerArray = JSON.parse(nobet.gunler);
                          const alanlarArray = JSON.parse(nobet.alan_adlari);
                          
                          return (
                            <React.Fragment key={nobet.id}>
                              {/* Günler satırı */}
                              <tr className="bg-blue-50">
                                <td className="px-6 py-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span className="font-medium">Günler:</span>
                                  </div>
                                </td>
                                <td className="px-6 py-2 text-xs text-gray-700" colSpan={4}>
                                  {renderGunler(gunlerArray, alanlarArray)}
                                </td>
                              </tr>
                              
                              {/* Alanlar satırı */}
                              <tr className="bg-green-50">
                                <td className="px-6 py-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    <span className="font-medium">Alanlar:</span>
                                  </div>
                                </td>
                                <td className="px-6 py-2 text-xs text-gray-700" colSpan={4}>
                                  {renderAlanlar(alanlarArray)}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        } catch (error) {
                          console.error('JSON parse hatası:', error, nobet);
                          return null;
                        }
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {filteredPersonnel.length === 0 && (
              <div className="text-center py-12">
                <User2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {nobetFilter === 'tum' && 'Henüz personel kaydı bulunmuyor'}
                  {nobetFilter === 'tanimli' && 'Nöbet tanımlı personel bulunmuyor'}
                  {nobetFilter === 'tanimsiz' && 'Nöbet tanımsız personel bulunmuyor'}
                </p>
                {nobetFilter === 'tum' && (
        <button
          onClick={() => navigate('/personel-ekle')}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
                    <span>İlk Personeli Ekle</span>
        </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNobetTanimlama = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500">Personel listesi yükleniyor...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadPersonnel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Yeniden Dene
          </button>
        </div>
      );
    }

    const filteredPersonnel = getFilteredPersonnel();
    const istatistikler = getPersonelIstatistikleri();

    return (
      <div className="space-y-6">
        {/* Rapor Özeti */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Nöbet Tanımlama Raporu
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{istatistikler.toplamPersonel}</div>
              <div className="text-sm text-gray-600">Toplam Personel</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{istatistikler.nobetTanimliPersonel}</div>
              <div className="text-sm text-gray-600">Nöbet Tanımlı</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{istatistikler.nobetTanimsizPersonel}</div>
              <div className="text-sm text-gray-600">Nöbet Tanımsız</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{istatistikler.toplamNobetTanimlama}</div>
              <div className="text-sm text-gray-600">Toplam Tanımlama</div>
            </div>
          </div>
        </div>

        {/* Filtre Butonları */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Personel Listesi</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtrele:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setNobetFilter('tum')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    nobetFilter === 'tum'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Tüm Personel ({istatistikler.toplamPersonel})
                </button>
                <button
                  onClick={() => setNobetFilter('tanimli')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    nobetFilter === 'tanimli'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Nöbet Tanımlı ({istatistikler.nobetTanimliPersonel})
                </button>
                <button
                  onClick={() => setNobetFilter('tanimsiz')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    nobetFilter === 'tanimsiz'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Nöbet Tanımsız ({istatistikler.nobetTanimsizPersonel})
                </button>
              </div>
            </div>
          </div>
      </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {filteredPersonnel.length} personel görüntüleniyor
              {nobetFilter === 'tanimli' && ' (nöbet tanımlı)'}
              {nobetFilter === 'tanimsiz' && ' (nöbet tanımsız)'}
            </p>
          </div>
          
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Ad Soyad</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">TC Kimlik No</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Ünvan</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Durum</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {filteredPersonnel.map((person) => {
                  const personelNobetler = getPersonelNobetTanimlama(person.id);
                  
                  return (
                    <React.Fragment key={person.id}>
                      {/* Ana personel satırı */}
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{person.ad} {person.soyad}</div>
                        </td>
                      <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{person.tcno}</div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-sm text-blue-600">{person.unvan}</div>
                      </td>
                      <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            person.aktif_mi 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {person.aktif_mi ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleNobetTanimlamaOpen(person)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            Nöbet Tanımla
                          </button>
                        </td>
                      </tr>
                      
                      {/* Kayıtlı nöbet tanımlamaları */}
                      {personelNobetler.map((nobet) => {
                        try {
                          const gunlerArray = JSON.parse(nobet.gunler);
                          const alanlarArray = JSON.parse(nobet.alan_adlari);
                          
                          return (
                            <React.Fragment key={nobet.id}>
                              {/* Günler satırı */}
                              <tr className="bg-blue-50">
                                <td className="px-6 py-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span className="font-medium">Günler:</span>
                                  </div>
                                </td>
                                <td className="px-6 py-2 text-xs text-gray-700" colSpan={2}>
                                  {renderGunler(gunlerArray, alanlarArray)}
                                </td>
                                <td className="px-6 py-2"></td>
                                <td className="px-6 py-2"></td>
                              </tr>
                              
                              {/* Alanlar satırı */}
                              <tr className="bg-green-50">
                                <td className="px-6 py-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    <span className="font-medium">Alanlar:</span>
                        </div>
                      </td>
                                <td className="px-6 py-2 text-xs text-gray-700" colSpan={2}>
                                  {renderAlanlar(alanlarArray)}
                                </td>
                                <td className="px-6 py-2"></td>
                                <td className="px-6 py-2"></td>
                    </tr>
                            </React.Fragment>
                          );
                        } catch (error) {
                          console.error('JSON parse hatası:', error, nobet);
                          return null;
                        }
                      })}
                    </React.Fragment>
                  );
                })}
                </tbody>
              </table>

            {filteredPersonnel.length === 0 && (
                <div className="text-center py-12">
                  <User2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {nobetFilter === 'tum' && 'Henüz personel kaydı bulunmuyor'}
                  {nobetFilter === 'tanimli' && 'Nöbet tanımlı personel bulunmuyor'}
                  {nobetFilter === 'tanimsiz' && 'Nöbet tanımsız personel bulunmuyor'}
                </p>
                {nobetFilter === 'tum' && (
                  <button
                    onClick={() => navigate('/personel-ekle')}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>İlk Personeli Ekle</span>
                  </button>
                )}
                </div>
              )}
            </div>
          </div>
      </div>
    );
  };

  const renderNobetTanimlamaPopup = () => {
    if (!nobetTanimlamaPopup.isOpen || !nobetTanimlamaPopup.personel) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {nobetTanimlamaPopup.personel.ad} {nobetTanimlamaPopup.personel.soyad} - Nöbet Tanımlama
            </h3>
            <button
              onClick={handleNobetTanimlamaClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Üst Kısım - Günler */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4">Günler</h4>
              <div className="grid grid-cols-7 gap-2">
                {gunler.map((gun) => {
                  const isDisabled = isGunDisabled(gun);
                  return (
                    <div
                      key={gun}
                      className={`p-3 rounded-lg border transition-colors ${
                        isDisabled
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          : selectedGunler.includes(gun)
                          ? 'bg-blue-50 border-blue-300 text-blue-700 cursor-pointer'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer'
                      }`}
                      onClick={() => !isDisabled && handleGunToggle(gun)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{gun}</span>
                        <input
                          type="checkbox"
                          checked={selectedGunler.includes(gun)}
                          onChange={() => handleGunToggle(gun)}
                          disabled={isDisabled}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
                </div>

            {/* Alt Kısım - Tanımlı Alanlar */}
                <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-800">Tanımlı Alanlar</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tumunuSec}
                    onChange={handleTumunuSecToggle}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Tümünü Seç</span>
                </div>
              </div>

              {tanimliAlanlarLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-500">Tanımlı alanlar yükleniyor...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tanimliAlanlar.map((alan) => {
                    const isDisabled = isAlanDisabled(alan.id);
                    return (
                      <div
                        key={alan.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isDisabled
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            : selectedAlanlar.includes(alan.id)
                            ? 'bg-blue-50 border-blue-300 text-blue-700 cursor-pointer'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer'
                        }`}
                        onClick={() => !isDisabled && handleAlanToggle(alan.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{alan.alan_adi}</span>
                          <input
                            type="checkbox"
                            checked={selectedAlanlar.includes(alan.id)}
                            onChange={() => handleAlanToggle(alan.id)}
                            disabled={isDisabled}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!tanimliAlanlarLoading && tanimliAlanlar.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tanımlı alan bulunmuyor
                </div>
              )}
            </div>

            {/* Ekle Butonu */}
            <div className="flex justify-center">
              <button
                onClick={handleNobetEkle}
                disabled={selectedGunler.length === 0 || selectedAlanlar.length === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedGunler.length === 0 || selectedAlanlar.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                Listeye Ekle
              </button>
            </div>

            {/* Eklenen Kombinasyonlar */}
            {nobetKombinasyonlari.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Eklenecek Nöbet Tanımlamaları</h4>
                <div className="space-y-3">
                  {nobetKombinasyonlari.map((kombinasyon, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Günler:</span>
                            <span className="text-sm text-gray-600">{kombinasyon.gunler.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Alanlar:</span>
                            <span className="text-sm text-gray-600">{kombinasyon.alanAdlari.join(', ')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleKombinasyonSil(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleNobetTanimlamaClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleNobetKaydet}
              disabled={nobetKombinasyonlari.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                nobetKombinasyonlari.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Check className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'liste':
        return renderPersonelListesi();
      case 'nobet':
        return renderNobetTanimlama();
      case 'istek':
        return <PersonelIstek />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personel Yönetimi</h2>
        <button
          onClick={() => navigate('/personel-ekle')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Personel</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:block">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Nöbet Tanımlama Popup */}
      {renderNobetTanimlamaPopup()}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={() => deleteDialog.personId && handleDelete(deleteDialog.personId)}
        title="Personel Silme"
        message="Bu personeli silmek istediğinizden emin misiniz?"
      />
    </div>
  );
};

export default PersonelListesi;