import React, { useState } from 'react';
import KurumEkleFormu from './KurumEkleFormu';
import Kurumlar from './Kurumlar';
import { Plus, List } from 'lucide-react';

const tabs = [
  {
    id: 'ekle',
    title: 'Kurum Ekle',
    icon: <Plus className="w-5 h-5" />,
    bgColor: 'bg-blue-600',
  },
  {
    id: 'liste',
    title: 'Kurumları Göster',
    icon: <List className="w-5 h-5" />,
    bgColor: 'bg-green-600',
  },
];

const KurumYonetimi = () => {
  const [activeTab, setActiveTab] = useState<'ekle' | 'liste'>('ekle');

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow p-6">
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'ekle' | 'liste')}
              className={`
                flex items-center gap-3 w-64 px-4 py-3 rounded-lg transition-all duration-300
                font-medium shadow-sm
                ${isActive ? `${tab.bgColor} text-white shadow-lg` : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}
                ${!isActive ? 'border border-gray-200' : ''}
              `}
              style={{ outline: isActive ? '2px solid #2563eb' : 'none', outlineOffset: isActive ? '2px' : '0' }}
            >
              {tab.icon}
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>
      {activeTab === 'ekle' ? <KurumEkleFormu /> : <Kurumlar />}
    </div>
  );
};

export default KurumYonetimi;