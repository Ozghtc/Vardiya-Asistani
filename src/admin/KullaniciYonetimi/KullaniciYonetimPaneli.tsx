import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getKurumlar } from '../../lib/api';

// Types
interface BaseUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  rol: 'admin' | 'yonetici' | 'personel';
  aktif_mi: boolean;
  created_at: string;
}

interface User extends BaseUser {
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
}

interface Kurum {
  id: string;
  kurum_adi: string;
  kurum_turu: string;
  adres: string;
  il: string;
  ilce: string;
  aktif_mi: boolean;
  departmanlar?: string; // Virgülle ayrılmış string
  birimler?: string; // Virgülle ayrılmış string
  created_at: string;
}

interface Departman {
  id: string;
  departman_adi: string;
  kurum_id: string;
}

interface Birim {
  id: string;
  birim_adi: string;
  kurum_id: string;
  departman_id: string;
}

interface Permission {
  id: string;
  kullanici_id: string;
  departman_id: string;
  birim_id: string;
  yetki_turu: 'GOREBILIR' | 'DUZENLEYEBILIR' | 'YONETICI' | 'SADECE_KENDI';
}

const KullaniciYonetimPaneli: React.FC = () => {
  // States - Tüm veriler API'den
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [kurumlar, setKurumlar] = useState<Kurum[]>([]);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [birimler, setBirimler] = useState<Birim[]>([]);
  const [permissions, setPermissions] = useLocalStorage<Permission[]>('permissions', []);
  const [loading, setLoading] = useState(true); // Başlangıçta loading true
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    rol: 'admin' as 'admin' | 'yonetici' | 'personel',
    name: '',
    email: '',
    password: '',
    phone: '',
    kurum_id: '',
    departman_id: '',
    birim_id: ''
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'yonetici' | 'personel'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{user: User, confirmText: string} | null>(null);

  // Permission form states
  const [permissionForm, setPermissionForm] = useState({
    departman_id: '',
    birim_id: '',
    yetki_turu: 'GOREBILIR' as 'GOREBILIR' | 'DUZENLEYEBILIR' | 'YONETICI' | 'SADECE_KENDI'
  });

  // Load kurumlar from API
  useEffect(() => {
    const loadKurumlar = async () => {
      setLoading(true);
      try {
        console.log('🔄 API\'den kurumlar çekiliyor...');
        const apiKurumlar = await getKurumlar();
        console.log('📊 API\'den gelen kurumlar:', apiKurumlar);
        
        if (!apiKurumlar || apiKurumlar.length === 0) {
          console.warn('⚠️ API\'den kurum verisi gelmedi!');
          return;
        }
        
        setKurumlar(apiKurumlar);
        
        // Parse departmanlar and birimler from kurumlar
        const allDepartmanlar: Departman[] = [];
        const allBirimler: Birim[] = [];
        
        apiKurumlar.forEach((kurum: Kurum) => {
          console.log(`🏢 Kurum işleniyor: ${kurum.kurum_adi}`);
          console.log(`📋 Departmanlar: ${kurum.departmanlar}`);
          console.log(`🏭 Birimler: ${kurum.birimler}`);
          
          if (kurum.departmanlar) {
            kurum.departmanlar.split(', ').filter((d: string) => d.trim()).forEach((dept: string) => {
              allDepartmanlar.push({
                id: `${kurum.id}_${dept}`,
                departman_adi: dept,
                kurum_id: kurum.id
              });
            });
          }
          
          if (kurum.birimler) {
            kurum.birimler.split(', ').filter((b: string) => b.trim()).forEach((birim: string) => {
              allBirimler.push({
                id: `${kurum.id}_${birim}`,
                birim_adi: birim,
                kurum_id: kurum.id,
                departman_id: '' // Birimler kuruma bağlı, departmana göre filtrelenebilir
              });
            });
          }
        });
        
        console.log('📋 Toplam departman:', allDepartmanlar.length);
        console.log('🏭 Toplam birim:', allBirimler.length);
        
        setDepartmanlar(allDepartmanlar);
        setBirimler(allBirimler);
      } catch (error) {
        console.error('❌ Kurumlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadKurumlar();
  }, []);

  // Filtered data
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredDepartmanlar = departmanlar.filter(d => d.kurum_id === formData.kurum_id);
  const filteredBirimler = birimler.filter(b => b.kurum_id === formData.kurum_id);

  // Handlers
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      alert('Lütfen tüm alanları doldurunuz!');
      return;
    }

    if ((formData.rol === 'yonetici' || formData.rol === 'personel') && 
        (!formData.kurum_id || !formData.departman_id || !formData.birim_id)) {
      alert('Lütfen kurum, departman ve birim bilgilerini doldurunuz!');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      aktif_mi: true,
      created_at: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
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
  };

  const handleDeleteUser = (user: User) => {
    setShowDeleteModal({ user, confirmText: '' });
  };

  const confirmDelete = () => {
    if (showDeleteModal && showDeleteModal.confirmText === showDeleteModal.user.name) {
      setUsers(prev => prev.filter(u => u.id !== showDeleteModal.user.id));
      setPermissions(prev => prev.filter(p => p.kullanici_id !== showDeleteModal.user.id));
      setShowDeleteModal(null);
      setSelectedUser(null);
    }
  };

  const handleToggleActive = (user: User) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, aktif_mi: !u.aktif_mi } : u
    ));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      rol: user.rol,
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      kurum_id: user.kurum_id || '',
      departman_id: user.departman_id || '',
      birim_id: user.birim_id || ''
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    const updatedUser: User = {
      ...editingUser,
      ...formData
    };

    setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
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
  };

  const handleAddPermission = () => {
    if (!selectedUser || !permissionForm.departman_id || !permissionForm.birim_id) return;

    const newPermission: Permission = {
      id: Date.now().toString(),
      kullanici_id: selectedUser.id,
      departman_id: permissionForm.departman_id,
      birim_id: permissionForm.birim_id,
      yetki_turu: permissionForm.yetki_turu
    };

    setPermissions(prev => [...prev, newPermission]);
    setPermissionForm({
      departman_id: '',
      birim_id: '',
      yetki_turu: 'GOREBILIR'
    });
  };

  const handleDeletePermission = (permissionId: string) => {
    setPermissions(prev => prev.filter(p => p.id !== permissionId));
  };

  const getUserPermissions = (userId: string) => {
    return permissions.filter(p => p.kullanici_id === userId);
  };

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'yonetici': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personel': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'admin': return '🔴';
      case 'yonetici': return '🔵';
      case 'personel': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-full mx-0 mt-4 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Kurumlar yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-0 mt-4 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Toplam: {users.length} kullanıcı
          </div>
          <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            Kurumlar: {kurumlar.length}
          </div>
        </div>
      </div>

      {/* Yeni Kullanıcı Ekleme Formu */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-blue-600">➕</span>
          {editingUser ? 'Kullanıcı Güncelle' : 'Yeni Kullanıcı Ekle'}
        </h2>
        
        <form onSubmit={editingUser ? handleUpdateUser : handleFormSubmit} className="space-y-4">
          {/* Rol Seçimi */}
          <div className="flex gap-4 mb-6">
            {['admin', 'yonetici', 'personel'].map(rol => (
              <label key={rol} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={rol}
                  checked={formData.rol === rol}
                  onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value as any }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLocaleUpperCase('tr-TR') }))}
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

          {/* Kurum Bilgileri - Sadece Yönetici/Personel için */}
          {(formData.rol === 'yonetici' || formData.rol === 'personel') && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Kurum Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kurum</label>
                  <select
                    value={formData.kurum_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, kurum_id: e.target.value, departman_id: '', birim_id: '' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                    required
                  >
                    <option value="">Kurum Seçiniz</option>
                    {kurumlar.map(kurum => (
                      <option key={kurum.id} value={kurum.id}>{kurum.kurum_adi}</option>
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
                    {filteredDepartmanlar.map(departman => (
                      <option key={departman.id} value={departman.id}>{departman.departman_adi}</option>
                    ))}
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
                    {filteredBirimler.map(birim => (
                      <option key={birim.id} value={birim.id}>{birim.birim_adi}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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

      {/* Kullanıcı Listesi */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Kullanıcılar ({filteredUsers.length})</h2>
            
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
                          handleToggleActive(user);
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
                          🏥 {kurumlar.find(k => k.id === user.kurum_id)?.kurum_adi || 'Bilinmeyen'}
                        </div>
                        <div className="text-xs text-gray-500">
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
                            handleEditUser(user);
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
                              setShowPermissionModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            🔐 Yetki
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
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
                          {getUserPermissions(user.id).length > 0 ? (
                            <div className="space-y-1">
                              {getUserPermissions(user.id).map(permission => (
                                <div key={permission.id} className="flex items-center justify-between text-xs">
                                  <span>
                                    {departmanlar.find(d => d.id === permission.departman_id)?.departman_adi} › {birimler.find(b => b.id === permission.birim_id)?.birim_adi}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    permission.yetki_turu === 'YONETICI' 
                                      ? 'bg-red-100 text-red-600' 
                                      : permission.yetki_turu === 'DUZENLEYEBILIR' 
                                        ? 'bg-orange-100 text-orange-600' 
                                        : permission.yetki_turu === 'SADECE_KENDI'
                                          ? 'bg-purple-100 text-purple-600'
                                          : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    {permission.yetki_turu === 'YONETICI' ? '🔐' : 
                                     permission.yetki_turu === 'DUZENLEYEBILIR' ? '✏️' : 
                                     permission.yetki_turu === 'SADECE_KENDI' ? '🔒' : '👁️'}
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

      {/* Yetki Modalı */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Yetki Yönetimi: {selectedUser.name}
                </h3>
                <button
                  onClick={() => setShowPermissionModal(false)}
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
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, departman_id: e.target.value, birim_id: '' }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Departman Seçiniz</option>
                    {departmanlar.filter(d => d.kurum_id === selectedUser.kurum_id).map(departman => (
                      <option key={departman.id} value={departman.id}>{departman.departman_adi}</option>
                    ))}
                  </select>

                  <select
                    value={permissionForm.birim_id}
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, birim_id: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!permissionForm.departman_id}
                  >
                    <option value="">Birim Seçiniz</option>
                    {birimler.filter(b => b.kurum_id === selectedUser.kurum_id).map(birim => (
                      <option key={birim.id} value={birim.id}>{birim.birim_adi}</option>
                    ))}
                  </select>

                  <select
                    value={permissionForm.yetki_turu}
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, yetki_turu: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GOREBILIR">👁️ Görüntüleyebilir</option>
                    <option value="DUZENLEYEBILIR">✏️ Düzenleyebilir</option>
                    <option value="YONETICI">🔐 Yönetici (Tam Yetki)</option>
                    <option value="SADECE_KENDI">🔒 Sadece Kendi Kayıtları</option>
                  </select>
                </div>
                
                <button
                  onClick={handleAddPermission}
                  disabled={!permissionForm.departman_id || !permissionForm.birim_id}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ➕ Yetki Ekle
                </button>
              </div>

              {/* Mevcut Yetkiler */}
              <div>
                <h4 className="font-medium text-gray-800 mb-4">Mevcut Yetkiler</h4>
                {getUserPermissions(selectedUser.id).length > 0 ? (
                  <div className="space-y-3">
                    {getUserPermissions(selectedUser.id).map(permission => (
                      <div key={permission.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">
                            {departmanlar.find(d => d.id === permission.departman_id)?.departman_adi || 'Bilinmeyen'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {birimler.find(b => b.id === permission.birim_id)?.birim_adi || 'Bilinmeyen'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            permission.yetki_turu === 'YONETICI' 
                              ? 'bg-red-100 text-red-600' 
                              : permission.yetki_turu === 'DUZENLEYEBILIR' 
                                ? 'bg-orange-100 text-orange-600' 
                                : permission.yetki_turu === 'SADECE_KENDI'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-blue-100 text-blue-600'
                          }`}>
                            {permission.yetki_turu === 'YONETICI' ? '🔐 Yönetici' : 
                             permission.yetki_turu === 'DUZENLEYEBILIR' ? '✏️ Düzenleyebilir' : 
                             permission.yetki_turu === 'SADECE_KENDI' ? '🔒 Sadece Kendi' : '👁️ Görüntüleyebilir'}
                          </span>
                          <button
                            onClick={() => handleDeletePermission(permission.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Bu kullanıcının ek yetkisi bulunmamaktadır</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800">Kullanıcı Silme Onayı</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Bu kullanıcıyı silmek üzeresiniz:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-800">{showDeleteModal.user.name}</div>
                  <div className="text-sm text-gray-600">{showDeleteModal.user.email}</div>
                </div>
                
                <p className="text-sm text-gray-600 mt-4 mb-2">
                  Onaylamak için kullanıcı adını yazın:
                </p>
                <input
                  type="text"
                  value={showDeleteModal.confirmText}
                  onChange={(e) => setShowDeleteModal(prev => prev ? { ...prev, confirmText: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={showDeleteModal.user.name}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ❌ İptal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={showDeleteModal.confirmText !== showDeleteModal.user.name}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KullaniciYonetimPaneli; 