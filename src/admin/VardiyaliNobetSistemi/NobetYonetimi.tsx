import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, UserPlus, FileText, Clock, Calendar } from 'lucide-react';

const NobetYonetimi: React.FC = () => {
  const navigate = useNavigate();

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
      title: 'Sistem Tanımlamaları',
      description: 'Sistem tanımlamalarını yönet',
      icon: <Settings className="w-8 h-8 text-white" />,
      route: '/sistem-tanimlamalari',
      bgColor: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Nöbet Yönetimi</h1>
        <p className="text-gray-600 mt-2">Nöbet sistemi yönetimi ve planlaması</p>
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
    </div>
  );
};

export default NobetYonetimi;