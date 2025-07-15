// Dosyayı SistemTanimlamalari.tsx olarak yeniden adlandır
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, MapPin, UserPlus, Settings, UserCog, Database, Plus } from 'lucide-react';
import UnvanTanimlama from './UnvanTanimlama';
import IzinTanimlama from './IzinTanimlama';
import VardiyaTanimlama from './VardiyaTanimlama';
import AlanTanimlama from './AlanTanimlama';
import TanimliAlanlar from './TanimliAlanlar';
import TanimliVardiyalar from './TanimliVardiyalar';
import { useDepartmanBirim } from './DepartmanBirimContext';
import { createPersonelUnvanTable, createIzinIstekTable } from '../../../lib/api';

const SistemTanimlamalari: React.FC = () => {
  const [activeTab, setActiveTab] = useState('unvan-izin');
  const navigate = useNavigate();
  const { setDepartmanBirim } = useDepartmanBirim();

  // HZM tablo oluşturma states
  const [unvanTableCreating, setUnvanTableCreating] = useState(false);
  const [izinTableCreating, setIzinTableCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAndSetContext = async () => {
      // Önce currentUser'ı localStorage'dan al
      const userStr = localStorage.getItem('currentUser');
      let kurum_id = '', departman_id = '', birim_id = '';
      if (userStr) {
        const user = JSON.parse(userStr);
        kurum_id = user.kurum_id || '';
        departman_id = user.departman_id || '';
        birim_id = user.birim_id || '';
      }
      // Eğer currentUser'da id'ler varsa onları kullan
      if (kurum_id && departman_id && birim_id) {
        setDepartmanBirim({ kurum_id, departman_id, birim_id });
      }
    };
    fetchAndSetContext();
  }, [setDepartmanBirim]);

  // Success/Error mesajlarını otomatik kaldır
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 5000); // 5 saniye sonra kaldır
      
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // HZM Personel Ünvan Tablosu Oluştur
  const handleCreateUnvanTable = async () => {
    setUnvanTableCreating(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      console.log('🏗️ HZM Personel Ünvan tablosu oluşturuluyor...');
      const result = await createPersonelUnvanTable();
      
      if (result.success) {
        setSuccessMsg('✅ Personel Ünvan tablosu başarıyla oluşturuldu!');
        console.log('🎯 Ünvan tablosu oluşturma sonucu:', result);
      } else {
        setErrorMsg('❌ Hata: ' + result.message);
        console.error('❌ Ünvan tablosu oluşturma hatası:', result);
      }
    } catch (error) {
      console.error('❌ Ünvan tablosu oluşturma hatası:', error);
      setErrorMsg('❌ Personel Ünvan tablosu oluşturulamadı');
    } finally {
      setUnvanTableCreating(false);
    }
  };

  // HZM İzin/İstek Tablosu Oluştur
  const handleCreateIzinTable = async () => {
    setIzinTableCreating(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      console.log('🏗️ HZM İzin/İstek tablosu oluşturuluyor...');
      const result = await createIzinIstekTable();
      
      if (result.success) {
        setSuccessMsg('✅ İzin/İstek tablosu başarıyla oluşturuldu!');
        console.log('🎯 İzin/İstek tablosu oluşturma sonucu:', result);
      } else {
        setErrorMsg('❌ Hata: ' + result.message);
        console.error('❌ İzin/İstek tablosu oluşturma hatası:', result);
      }
    } catch (error) {
      console.error('❌ İzin/İstek tablosu oluşturma hatası:', error);
      setErrorMsg('❌ İzin/İstek tablosu oluşturulamadı');
    } finally {
      setIzinTableCreating(false);
    }
  };

  const tabs = [
    {
      id: 'unvan-izin',
      name: 'Ünvan/İzin Tanımlamaları',
      icon: <Users className="w-5 h-5" />, // veya başka uygun bir ikon
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <UnvanTanimlama />
          <IzinTanimlama />
        </div>
      )
    },
    {
      id: 'vardiya',
      name: 'Vardiya',
      icon: <Clock className="w-5 h-5" />, 
      component: <VardiyaTanimlama />
    },
    {
      id: 'alan',
      name: 'Alan',
      icon: <MapPin className="w-5 h-5" />, 
      component: <AlanTanimlama />
    },
    {
      id: 'tanimli-alanlar',
      name: 'Tanımlı Alanlar',
      icon: <Settings className="w-5 h-5" />, 
      component: <TanimliAlanlar />
    }
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sistem Tanımlamaları</h1>
        <div className="flex items-center gap-4">
          
          {/* HZM Veri Tabanı Tablo Oluşturma Butonları */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateUnvanTable}
              disabled={unvanTableCreating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                unvanTableCreating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {unvanTableCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Database className="w-4 h-4" />
              )}
              {unvanTableCreating ? 'Oluşturuluyor...' : 'Ünvan Tablosu'}
            </button>
            
            <button
              onClick={handleCreateIzinTable}
              disabled={izinTableCreating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                izinTableCreating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {izinTableCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {izinTableCreating ? 'Oluşturuluyor...' : 'İzin/İstek Tablosu'}
            </button>
          </div>
          <button
            onClick={() => navigate('/personel-ekle')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Personel Ekle
          </button>
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(successMsg || errorMsg) && (
        <div className="mb-6">
          {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* Sekmeli yapı */}
      <div className="bg-white border-b mb-6">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default SistemTanimlamalari;