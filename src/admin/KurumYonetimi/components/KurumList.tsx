// Kurum List Component
// Kurum listesi, arama, filtreleme ve inline editing

import React from 'react';
import { Search, Filter, Edit, Trash2, Eye, RefreshCw, Plus, UserCheck, UserX } from 'lucide-react';
import { KurumListProps } from '../types/KurumManagement.types';
import { 
  filterKurumlar, 
  sortKurumlar, 
  getStatusBadgeClass, 
  getStatusText, 
  getToggleActiveText 
} from '../utils/kurumHelpers';

const KurumList: React.FC<KurumListProps> = ({
  kurumlar,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  onRefresh,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  editKurumId,
  setEditKurumId,
  editValues,
  setEditValues,
  operationLoading,
  onSaveEdit,
  onCancelEdit
}) => {
  // Filtrelenmiş ve sıralanmış kurumlar
  const filteredAndSortedKurumlar = sortKurumlar(
    filterKurumlar(kurumlar, searchTerm, filterType)
  );

  // Edit başlat
  const handleStartEdit = (kurum: any) => {
    setEditKurumId(kurum.id);
    setEditValues({
      kurum_adi: kurum.kurum_adi || '',
      adres: kurum.adres || '',
      telefon: kurum.telefon || '',
      email: kurum.email || ''
    });
  };

  // Edit cancel
  const handleCancelEdit = () => {
    setEditKurumId(null);
    setEditValues({ kurum_adi: '', adres: '', telefon: '', email: '' });
    onCancelEdit();
  };

  // Edit save
  const handleSaveEdit = async (kurumId: string) => {
    await onSaveEdit(kurumId);
    handleCancelEdit();
  };

  return (
    <div className="kurum-list-container bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kurum Listesi</h2>
          <p className="text-gray-600">
            Toplam: {kurumlar.length} kurum, Gösterilen: {filteredAndSortedKurumlar.length}
          </p>
        </div>
        
        {/* Actions */}
        <button
          onClick={() => onRefresh()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Kurum ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm Kurumlar</option>
            <option value="aktif">Aktif Kurumlar</option>
            <option value="pasif">Pasif Kurumlar</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Kurumlar yükleniyor...</span>
        </div>
      )}

      {/* Kurumlar */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kurum Adı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kurum Türü</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İl / İlçe</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Adres</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İletişim</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedKurumlar.map((kurum) => (
                <tr key={kurum.id} className="border-b hover:bg-gray-50">
                  {/* Kurum Adı */}
                  <td className="py-3 px-4">
                    {editKurumId === kurum.id ? (
                      <input
                        type="text"
                        value={editValues.kurum_adi}
                        onChange={(e) => setEditValues({...editValues, kurum_adi: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{kurum.kurum_adi}</span>
                    )}
                  </td>

                  {/* Kurum Türü */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{kurum.kurum_turu || '-'}</span>
                  </td>

                  {/* İl / İlçe */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {kurum.il || '-'} / {kurum.ilce || '-'}
                    </span>
                  </td>

                  {/* Adres */}
                  <td className="py-3 px-4">
                    {editKurumId === kurum.id ? (
                      <input
                        type="text"
                        value={editValues.adres}
                        onChange={(e) => setEditValues({...editValues, adres: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{kurum.adres || '-'}</span>
                    )}
                  </td>

                  {/* İletişim */}
                  <td className="py-3 px-4">
                    {editKurumId === kurum.id ? (
                      <div className="space-y-1">
                        <input
                          type="tel"
                          placeholder="Telefon"
                          value={editValues.telefon}
                          onChange={(e) => setEditValues({...editValues, telefon: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={editValues.email}
                          onChange={(e) => setEditValues({...editValues, email: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{kurum.telefon || '-'}</div>
                        <div>{kurum.email || '-'}</div>
                      </div>
                    )}
                  </td>

                  {/* Durum */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(kurum.aktif_mi ?? true)}`}>
                      {getStatusText(kurum.aktif_mi ?? true)}
                    </span>
                  </td>

                  {/* İşlemler */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {editKurumId === kurum.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(kurum.id)}
                            disabled={operationLoading === kurum.id}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            title="Kaydet"
                          >
                            {operationLoading === kurum.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800"
                            title="İptal"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(kurum)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onToggleActive(kurum)}
                            className={kurum.aktif_mi ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                            title={getToggleActiveText(kurum.aktif_mi ?? true)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(kurum)}
                            className="text-red-600 hover:text-red-800"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredAndSortedKurumlar.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kurum bulunamadı</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' 
                  ? 'Arama kriterlerinize uygun kurum bulunamadı.' 
                  : 'Henüz kurum eklenmemiş.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KurumList; 