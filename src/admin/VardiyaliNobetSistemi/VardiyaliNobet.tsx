import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, UserPlus, FileText, Clock } from 'lucide-react';

const VardiyaliNobet: React.FC = () => {
  const navigate = useNavigate();
  const [showNoAuthModal, setShowNoAuthModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [yetkiTablo, setYetkiTablo] = useState<any[]>([]);
  const [departmanlar, setDepartmanlar] = useState<any[]>([]);
  const [birimler, setBirimler] = useState<any[]>([]);

  useEffect(() => {
    const checkYoneticiYetki = async () => {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      if (user.role === 'admin' || user.role === 'personel') {
        setCheckingAuth(false);
        return;
      }
      // Departman ve birim adlarını çek
      const [depRes, birimRes] = await Promise.all([
        supabase.from('admin_kurumlar_departmanlar').select('*'),
        supabase.from('admin_kurumlar_birimler').select('*')
      ]);
      setDepartmanlar(depRes.data || []);
      setBirimler(birimRes.data || []);
      // Yetkileri çek
      const { data: yetkiler, error } = await supabase
        .from('admin_kullanici_yonetici_yetkilendirme')
        .select('*')
        .eq('kullanici_id', user.id);
      if (error) {
        setCheckingAuth(false);
        return;
      }
      // Tabloya hazırla
      if (yetkiler && yetkiler.length > 0) {
        const tablo = yetkiler.map((y: any) => {
          const dep = depRes.data?.find((d: any) => d.id === y.departman_id);
          const birim = birimRes.data?.find((b: any) => b.id === y.birim_id);
          return {
            departman: dep?.departman_adi || y.departman_id,
            birim: birim?.birim_adi || y.birim_id,
            gorev: y.gorev
          };
        });
        setYetkiTablo(tablo);
      } else {
        setYetkiTablo([]);
      }
      const kendiYetkisiVar = yetkiler && yetkiler.some(
        (y: any) =>
          y.departman_id === user.departman_id &&
          y.birim_id === user.birim_id &&
          (y.gorev === 'GÖREBİLİR' || y.gorev === 'DÜZENLEYEBİLİR')
      );
      if (!kendiYetkisiVar) {
        setShowNoAuthModal(true);
      }
      setCheckingAuth(false);
    };
    checkYoneticiYetki();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const mainCards = [
    {
      title: 'Nöbet İşlemleri',
      description: 'Nöbet takvimi ve planlama',
      icon: <Clock className="w-8 h-8 text-white" />,
      route: '/nobet/ekran',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      title: 'Personel Ekle',
      description: 'Yeni personel kaydı oluştur',
      icon: <UserPlus className="w-8 h-8 text-white" />,
      route: '/personel-ekle',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    {
      title: 'Personel Listesi',
      description: 'Tüm personelleri görüntüle',
      icon: <Users className="w-8 h-8 text-white" />,
      route: '/personel-listesi',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      title: 'Tanımlamalar',
      description: 'Sistem tanımlamalarını yönet',
      icon: <Settings className="w-8 h-8 text-white" />,
      route: '/tanimlamalar',
      bgColor: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700'
    }
  ];

  return (
    <div>
      {/* Yetki yoksa modal */}
      {showNoAuthModal && !checkingAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-700 mb-4">Yetkiniz Bulunmamaktadır</h2>
            <p className="mb-4">Kendi departman veya biriminiz için hiçbir görüntüleme/düzenleme yetkiniz yok.<br/>Lütfen sistem yöneticinizden yetki tanımlanmasını isteyin.</p>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >Tamam</button>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vardiyalı Nöbet Sistemi</h1>
        <p className="text-gray-600 mt-2">Vardiya sistemi yönetimi ve planlaması</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainCards.map((card, index) => (
          <div 
            key={index}
            onClick={() => navigate(card.route)}
            className={`${card.bgColor} ${card.hoverColor} rounded-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-start">
              <div className="p-3 rounded-lg">
                {card.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-1 text-white opacity-90">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Yetki Tablosu */}
      {yetkiTablo.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 bg-white border border-blue-200 shadow-lg rounded-lg px-4 py-3 text-xs max-w-xs min-w-[220px] animate-fade-in">
          <div className="font-bold text-blue-900 mb-1 text-sm">Yetkileriniz</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-1 px-2 text-left font-semibold">Departman</th>
                <th className="py-1 px-2 text-left font-semibold">Birim</th>
                <th className="py-1 px-2 text-left font-semibold">Görev</th>
              </tr>
            </thead>
            <tbody>
              {yetkiTablo.map((y, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1 px-2">{y.departman}</td>
                  <td className="py-1 px-2">{y.birim}</td>
                  <td className="py-1 px-2">{y.gorev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VardiyaliNobet;