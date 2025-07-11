import React, { useState } from 'react';
import { PieChart, BarChart, Download, Calendar, ChevronLeft } from 'lucide-react';
import NobetNavigation from './NobetNavigation';
import { useNavigate } from 'react-router-dom';

const Raporlar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-05');
  const [selectedReport, setSelectedReport] = useState('monthly');
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
      </div>
      <NobetNavigation />
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Nöbet Raporları</h2>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border-gray-300"
              >
                <option value="2025-05">Mayıs 2025</option>
                <option value="2025-06">Haziran 2025</option>
                <option value="2025-07">Temmuz 2025</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-4 h-4" />
                PDF İndir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-700">Toplam Nöbet</h3>
                <p className="text-2xl font-bold text-blue-900 mt-2">124</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-700">Aktif Personel</h3>
                <p className="text-2xl font-bold text-green-900 mt-2">45</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-700">Ortalama Nöbet</h3>
                <p className="text-2xl font-bold text-purple-900 mt-2">2.8</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-amber-700">İzin Günleri</h3>
                <p className="text-2xl font-bold text-amber-900 mt-2">12</p>
              </div>
            </div>

            {/* Rapor Türü Seçimi */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedReport('monthly')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    selectedReport === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aylık Rapor
                </button>
                <button
                  onClick={() => setSelectedReport('personnel')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    selectedReport === 'personnel'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Personel Raporu
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Rapor Detayları</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Hafta içi nöbetler</span>
                    <span className="font-medium">86</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Hafta sonu nöbetler</span>
                    <span className="font-medium">38</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Resmi tatil nöbetleri</span>
                    <span className="font-medium">4</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">İzin kullanan personel</span>
                    <span className="font-medium">8</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grafik Alanı */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg h-64 flex items-center justify-center">
            <BarChart className="w-12 h-12 text-gray-400" />
            <p className="ml-4 text-gray-500">Grafik görselleştirmesi burada yer alacak</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Raporlar;