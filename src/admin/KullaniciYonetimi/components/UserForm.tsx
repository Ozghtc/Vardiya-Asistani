// User Form Component
// Kullanıcı ekleme ve düzenleme formu

import React from 'react';
import { UserFormProps } from '../types/UserManagement.types';
import { getRoleColor, getRoleIcon, formatUserName } from '../utils/userHelpers';

const UserForm: React.FC<UserFormProps> = ({
  formData,
  setFormData,
  editingUser,
  setEditingUser,
  kurumlar,
  usersTableId,
  onSubmit,
  onUpdate
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-blue-600">➕</span>
        {editingUser ? 'Kullanıcı Güncelle' : 'Yeni Kullanıcı Ekle'}
      </h2>
      
      {!usersTableId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⚠️</span>
            <span className="font-medium">Kullanıcı tablosu bulunamadı!</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Kullanıcı eklemek için önce admin sayfasından (Kurum Yönetimi) kullanıcı tablosunu oluşturun.
          </p>
        </div>
      )}
      
      <form onSubmit={editingUser ? onUpdate : onSubmit} className="space-y-4">
        {/* Rol Seçimi */}
        <div className="flex gap-4 mb-6">
          {['admin', 'yonetici', 'personel'].map(rol => (
            <label key={rol} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={rol}
                checked={formData.rol === rol}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  rol: e.target.value as any,
                  // Admin seçildiğinde kurum bilgilerini temizle
                  kurum_id: e.target.value === 'admin' ? '' : prev.kurum_id,
                  departman_id: e.target.value === 'admin' ? '' : prev.departman_id,
                  birim_id: e.target.value === 'admin' ? '' : prev.birim_id
                }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(rol)}`}>
                {getRoleIcon(rol)} {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </span>
            </label>
          ))}
        </div>

        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: formatUserName(e.target.value) 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                placeholder="Kullanıcı adı soyadı"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                placeholder="Güvenli şifre"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                placeholder="0532 123 45 67"
                required
              />
            </div>
          </div>
        </div>

        {/* Kurum Bilgileri - Sadece yönetici ve personel için */}
        {(formData.rol === 'yonetici' || formData.rol === 'personel') && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Kurum Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kurum</label>
                <select
                  value={formData.kurum_id}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    kurum_id: e.target.value, 
                    departman_id: '', 
                    birim_id: '' 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                  required
                >
                  <option value="">Kurum Seçiniz</option>
                  {kurumlar.map(kurum => (
                    <option key={kurum.kurum_id} value={kurum.kurum_id}>
                      {kurum.kurum_adi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
                <select
                  value={formData.departman_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, departman_id: e.target.value, birim_id: '' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                  disabled={!formData.kurum_id}
                  required
                >
                  <option value="">Departman Seçiniz</option>
                  {/* KURAL 18: Backend'den filtrelenmiş data gelecek */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birim</label>
                <select
                  value={formData.birim_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, birim_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                  disabled={!formData.kurum_id}
                  required
                >
                  <option value="">Birim Seçiniz</option>
                  {/* KURAL 18: Backend'den filtrelenmiş data gelecek */}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Form Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={!usersTableId}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingUser ? '✅ Güncelle' : '➕ Kullanıcı Ekle'}
          </button>
          
          {editingUser && (
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  rol: 'admin',
                  name: '',
                  email: '',
                  password: '',
                  phone: '',
                  kurum_id: '',
                  departman_id: '',
                  birim_id: ''
                });
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ❌ İptal
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm; 