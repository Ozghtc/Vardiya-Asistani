// User List Component
// Kullanıcı listesi, arama ve filtreleme

import React from 'react';
import { UserListProps } from '../types/UserManagement.types';
import { 
  filterUsers, 
  getRoleColor, 
  getRoleIcon,
  getUserPermissions,
  getPermissionColor,
  getPermissionIcon
} from '../utils/userHelpers';

const UserList: React.FC<UserListProps> = ({
  users,
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  selectedUser,
  setSelectedUser,
  kurumlar,
  departmanlar,
  birimler,
  permissions,
  onEditUser,
  onToggleActive,
  onDeleteUser,
  onShowPermissionModal
}) => {
  const filteredUsers = filterUsers(users, searchTerm, filterRole);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Kullanıcılar ({filteredUsers.length})
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Arama */}
            <div className="relative">
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </div>
            </div>

            {/* Rol Filtresi */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Roller</option>
              <option value="admin">Adminler</option>
              <option value="yonetici">Yöneticiler</option>
              <option value="personel">Personeller</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-lg">Henüz kullanıcı bulunmamaktadır</p>
            <p className="text-sm">Yukarıdaki formdan yeni kullanıcı ekleyebilirsiniz</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer ${
                  selectedUser?.id === user.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
                } ${!user.aktif_mi ? 'opacity-60' : ''}`}
                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getRoleIcon(user.rol)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                        {user.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getRoleColor(user.rol)}`}>
                        {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(user);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        user.aktif_mi 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={user.aktif_mi ? 'Aktif' : 'Pasif'}
                    >
                      {user.aktif_mi ? '✅' : '⏸️'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>{user.phone}</span>
                  </div>
                  
                  {user.kurum_id && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Kurum Bilgileri</div>
                      <div className="text-sm">
                        🏥 {kurumlar.find(k => String(k.kurum_id) === String(user.kurum_id))?.kurum_adi || 'Bilinmeyen'}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {departmanlar.find(d => d.id === user.departman_id)?.departman_adi || 'Bilinmeyen'} › {birimler.find(b => b.id === user.birim_id)?.birim_adi || 'Bilinmeyen'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Actions */}
                {selectedUser?.id === user.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditUser(user);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        ✏️ Düzenle
                      </button>
                      
                      {user.rol === 'yonetici' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            onShowPermissionModal();
                          }}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          🔐 Yetki
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteUser(user);
                        }}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Yetki Özeti */}
                    {user.rol === 'yonetici' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-2">Ek Yetkiler</div>
                        {getUserPermissions(user.id, permissions).length > 0 ? (
                          <div className="space-y-1">
                            {getUserPermissions(user.id, permissions).map(permission => (
                              <div key={permission.id} className="flex items-center justify-between text-xs">
                                <span>
                                  {departmanlar.find(d => d.id === permission.departman_id)?.departman_adi} › {birimler.find(b => b.id === permission.birim_id)?.birim_adi}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${getPermissionColor(permission.yetki_turu)}`}>
                                  {getPermissionIcon(permission.yetki_turu)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">Ek yetki yok</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList; 