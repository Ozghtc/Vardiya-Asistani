import React, { useState } from 'react';
import { Calendar, FileText } from 'lucide-react';
import Nobetlerim from './Nobetlerim';
import IstekTaleplerim from './IstekTaleplerim';

const PersonelPaneli: React.FC = () => {
  const [activeTab, setActiveTab] = useState('nobetlerim');

  const tabs = [
    {
      id: 'nobetlerim',
      title: 'Nöbetlerim',
      icon: <Calendar className="w-5 h-5" />,
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      id: 'istekler',
      title: 'İstek Taleplerim',
      icon: <FileText className="w-5 h-5" />,
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personel Paneli</h1>
        <p className="text-gray-600 mt-1">Nöbet ve izin işlemlerinizi yönetin</p>
      </div>

      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id ? tab.bgColor : 'bg-gray-100'
            } rounded-lg px-4 py-3 ${
              activeTab === tab.id ? 'text-white' : 'text-gray-700'
            } flex items-center gap-3 transition-all duration-300 hover:shadow-lg w-48 ${
              activeTab !== tab.id && 'hover:bg-gray-200'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.title}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'nobetlerim' ? <Nobetlerim /> : <IstekTaleplerim />}
      </div>
    </div>
  );
};

export default PersonelPaneli;