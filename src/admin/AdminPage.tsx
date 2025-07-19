import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Clock, UserCircle } from 'lucide-react';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: 'Vardiyalı Nöbet Sistemi',
      description: 'Nöbet sistemi yönetimi ve planlaması',
      icon: <Clock className="w-8 h-8 text-white" />,
      route: '/admin/vardiyali-nobet',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      title: 'Personel Paneli',
      description: 'Nöbet ve izin işlemleriniz',
      icon: <UserCircle className="w-8 h-8 text-white" />,
      route: '/personel/panel',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcı ekle, düzenle ve yönet',
      icon: <Users className="w-8 h-8 text-white" />,
      route: '/kullanici-ekle',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      title: 'Kurum Yönetimi',
      description: 'Kurumları ekle ve düzenle',
      icon: <Building2 className="w-8 h-8 text-white" />,
      route: '/kurum-ekle',
      bgColor: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700'
    }
  ];

  return (
    <div>
      <div className="mb-8 bg-cyan-100 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Hoş Geldiniz</h1>
          <span className="text-lg font-semibold text-cyan-700 bg-cyan-200 px-4 py-2 rounded-lg shadow-sm animate-pulse">
            Admin Paneli
          </span>
        </div>
        <p className="text-gray-600 mt-2 md:mt-0">Vardiyalı Nöbet Asistanı kontrol paneli</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card, index) => (
          <div 
            key={index}
            onClick={() => navigate(card.route)}
            className={`${card.bgColor} ${card.hoverColor} rounded-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105`}
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
    </div>
  );
};

export default AdminPage;