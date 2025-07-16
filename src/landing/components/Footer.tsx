import React from 'react';
import { Clock, Building2, Users } from 'lucide-react';

// Bölüm 7: Footer Component
// 100 satır - KURAL 9 uyumlu

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">VardiyaPro</span>
            </div>
            <p className="text-gray-400 mb-4">
              Türkiye'nin en gelişmiş vardiya yönetim platformu
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-amber-400">AltıntaşSoft</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-400">HzmSoft İşbirliği</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Ürün</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Özellikler</li>
              <li>Fiyatlandırma</li>
              <li>Demo</li>
              <li>API</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Destek</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Yardım Merkezi</li>
              <li>İletişim</li>
              <li>Eğitimler</li>
              <li>Durum</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Şirket</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Hakkımızda</li>
              <li>Blog</li>
              <li>Kariyer</li>
              <li>Gizlilik</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 VardiyaPro. Tüm hakları saklıdır.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm mt-2">
            <span className="text-gray-500">Bir</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-amber-400">AltıntaşSoft</span>
            </div>
            <span className="text-gray-500">programıdır</span>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-green-400">HzmSoft</span>
            </div>
            <span className="text-gray-500">işbirliği ile</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 