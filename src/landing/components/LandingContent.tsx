import React from 'react';
import { Clock, Users, Calendar, Shield, ArrowRight } from 'lucide-react';
import { features } from '../data/features';

interface LandingContentProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

const LandingContent: React.FC<LandingContentProps> = ({ onShowLogin, onShowRegister }) => {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Vardiya Yönetimi
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Artık Kolay
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Yapay zeka destekli akıllı vardiya planlama sistemi ile personel yönetimini optimize edin. 
            Mobil uyumlu, bulut tabanlı ve güvenli.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShowRegister}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Ücretsiz Dene
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onShowLogin}
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Güçlü Özellikler</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Modern teknoloji ile donatılmış, kullanıcı dostu ve güvenli vardiya yönetim sistemi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Aktif Kurum</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Personel</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Aylık Vardiya</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            30 gün ücretsiz deneme ile VardiyaPro'nun gücünü keşfedin. 
            Kredi kartı bilgisi gerektirmez.
          </p>
          <button
            onClick={onShowRegister}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg"
          >
            Ücretsiz Hesap Oluştur
          </button>
        </div>
      </section>
    </>
  );
};

export default LandingContent; 