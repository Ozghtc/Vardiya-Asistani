// Permission Management Component
// Yetki yönetimi modalı

import React from 'react';
import {
  PermissionManagementProps,
  Permission,
  Departman,
  Birim
} from '../types/UserManagement.types';
import {
  getUserPermissions,
  getPermissionColor,
  getPermissionIcon,
  getPermissionLabel
} from '../utils/userHelpers';

const PermissionManagement: React.FC<PermissionManagementProps> = ({
  show,
  onClose,
  selectedUser,
  permissions,
  setPermissions,
  departmanlar,
  birimler,
  permissionForm,
  setPermissionForm,
  onAddPermission,
  onDeletePermission
}) => {
  if (!show || !selectedUser) return null;

  const userPermissions = getUserPermissions(selectedUser.id, permissions);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              Yetki Yönetimi: {selectedUser.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ❌
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Yeni Yetki Ekleme */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-4">Yeni Yetki Ekle</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={permissionForm.departman_id}
                onChange={(e) => setPermissionForm(prev => ({ 
                  ...prev, 
                  departman_id: e.target.value, 
                  birim_id: '' 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Departman Seçiniz</option>
                {departmanlar
                  .filter(d => d.kurum_id === selectedUser.kurum_id)
                  .map(departman => (
                    <option key={departman.id} value={departman.id}>
                      {departman.departman_adi}
                    </option>
                  ))}
              </select>

              <select
                value={permissionForm.birim_id}
                onChange={(e) => setPermissionForm(prev => ({ 
                  ...prev, 
                  birim_id: e.target.value 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!permissionForm.departman_id}
              >
                <option value="">Birim Seçiniz</option>
                {birimler
                  .filter(b => b.kurum_id === selectedUser.kurum_id)
                  .map(birim => (
                    <option key={birim.id} value={birim.id}>
                      {birim.birim_adi}
                    </option>
                  ))}
              </select>

              <select
                value={permissionForm.yetki_turu}
                onChange={(e) => setPermissionForm(prev => ({ 
                  ...prev, 
                  yetki_turu: e.target.value as any 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="GOREBILIR">👁️ Görüntüleyebilir</option>
                <option value="DUZENLEYEBILIR">✏️ Düzenleyebilir</option>
                <option value="YONETICI">🔐 Yönetici (Tam Yetki)</option>
                <option value="SADECE_KENDI">🔒 Sadece Kendi Kayıtları</option>
              </select>
            </div>
            
            <button
              onClick={onAddPermission}
              disabled={!permissionForm.departman_id || !permissionForm.birim_id}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ➕ Yetki Ekle
            </button>
          </div>

          {/* Mevcut Yetkiler */}
          <div>
            <h4 className="font-medium text-gray-800 mb-4">Mevcut Yetkiler</h4>
            {userPermissions.length > 0 ? (
              <div className="space-y-3">
                {userPermissions.map(permission => {
                  const departman = departmanlar.find(d => d.id === permission.departman_id);
                  const birim = birimler.find(b => b.id === permission.birim_id);
                  
                  return (
                    <div key={permission.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">
                          {departman?.departman_adi || 'Bilinmeyen'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {birim?.birim_adi || 'Bilinmeyen'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getPermissionColor(permission.yetki_turu)}`}>
                          {getPermissionIcon(permission.yetki_turu)} {getPermissionLabel(permission.yetki_turu)}
                        </span>
                        <button
                          onClick={() => onDeletePermission(permission.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Bu kullanıcının ek yetkisi bulunmamaktadır
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement; 