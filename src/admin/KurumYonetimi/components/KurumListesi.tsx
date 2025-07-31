import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Eye, RefreshCw, Plus, UserCheck, UserX } from 'lucide-react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { 
  Kurum, 
  DepartmanBirim, 
  FilterType, 
  DeleteModalState 
} from '../types/KurumManagement.types';
import { 
  DEPARTMAN_SABLONLARI, 
  BIRIM_SABLONLARI, 
  PERSONEL_TURLERI 
} from '../data/locationData';
import { 
  filterKurumlar, 
  sortKurumlar, 
  getStatusBadgeClass, 
  getStatusText, 
  getToggleActiveText 
} from '../utils/kurumHelpers';

interface KurumListesiProps {
  kurumlar: Kurum[];
  departmanBirimler: DepartmanBirim[];
  loading: boolean;
  searchTerm: string;
  filterType: FilterType;
  selectedKurum: Kurum | null;
  showDeleteModal: DeleteModalState | null;
  newDepartmanInputs: {[kurumId: string]: string};
  newBirimInputs: {[key: string]: string};
  newPersonelInputs: {[key: string]: string};
  
  // Event handlers
  onEdit: (kurum: Kurum) => void;
  onDelete: (kurum: Kurum) => void;
  onToggleActive: (kurum: Kurum) => void;
  onSelectKurum: (kurum: Kurum | null) => void;
  onRefresh: () => void;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: FilterType) => void;
  setShowDeleteModal: (modal: DeleteModalState | null) => void;
  confirmDelete: () => void;
  
  // Departman/Birim handlers
  setNewDepartmanInputs: React.Dispatch<React.SetStateAction<{[kurumId: string]: string}>>;
  setNewBirimInputs: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  setNewPersonelInputs: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  addDepartman: (kurumId: string) => void;
  removeDepartman: (departmanId: string) => void;
  addBirim: (departmanId: string) => void;
  removeBirim: (departmanId: string, birim: string) => void;
  addPersonel: (departmanId: string) => void;
  removePersonel: (departmanId: string, personel: string) => void;
}

const KurumListesi: React.FC<KurumListesiProps> = ({
  kurumlar,
  departmanBirimler,
  loading,
  searchTerm,
  filterType,
  selectedKurum,
  showDeleteModal,
  newDepartmanInputs,
  newBirimInputs,
  newPersonelInputs,
  onEdit,
  onDelete,
  onToggleActive,
  onSelectKurum,
  onRefresh,
  setSearchTerm,
  setFilterType,
  setShowDeleteModal,
  confirmDelete,
  setNewDepartmanInputs,
  setNewBirimInputs,
  setNewPersonelInputs,
  addDepartman,
  removeDepartman,
  addBirim,
  removeBirim,
  addPersonel,
  removePersonel
}) => {
  const [expandedKurumId, setExpandedKurumId] = useState<string | null>(null);

  // Filter and sort kurumlar
  const filteredKurumlar = filterKurumlar(kurumlar, searchTerm, filterType);
  const sortedKurumlar = sortKurumlar(filteredKurumlar);

  // Get departmanlar for kurum
  const getKurumDepartmanlar = (kurumId: string) => {
    return departmanBirimler.filter(d => d.kurum_id === kurumId);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Kurumlar ({sortedKurumlar.length})
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Kurum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Kurumlar</option>
              <option value="aktif">Aktif</option>
              <option value="pasif">Pasif</option>
            </select>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-lg">Kurumlar yükleniyor...</p>
          </div>
        ) : sortedKurumlar.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🏥</div>
            <p className="text-lg">Kurum bulunamadı</p>
            <p className="text-sm">Arama kriterlerinizi değiştirin veya yeni kurum ekleyin</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedKurumlar.map(kurum => {
              const kurumDepartmanlar = getKurumDepartmanlar(kurum.id);
              const isExpanded = expandedKurumId === kurum.id;

              return (
                <div key={kurum.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏥</div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {kurum.kurum_adi}
                        </h3>
                        {kurum.kurum_turu && (
                          <div className="text-sm text-gray-600">
                            {kurum.kurum_turu}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(kurum.aktif_mi !== false)}`}>
                        {getStatusText(kurum.aktif_mi !== false)}
                      </span>

                      <button
                        onClick={() => setExpandedKurumId(isExpanded ? null : kurum.id)}
                        className="p-2 rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
                        title={isExpanded ? 'Daralt' : 'Genişlet'}
                      >
                        {isExpanded ? '👁️' : '👀'}
                      </button>

                      <button
                        onClick={() => onToggleActive(kurum)}
                        className={`p-2 rounded-lg transition-colors ${
                          kurum.aktif_mi !== false 
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={getToggleActiveText(kurum.aktif_mi !== false)}
                      >
                        {kurum.aktif_mi !== false ? '⏸️' : '▶️'}
                      </button>

                      <button
                        onClick={() => onEdit(kurum)}
                        className="p-2 rounded-lg transition-colors bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onDelete(kurum)}
                        className="p-2 rounded-lg transition-colors bg-red-100 text-red-600 hover:bg-red-200"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Kurum Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    {kurum.adres && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{kurum.adres}</span>
                      </div>
                    )}
                    {(kurum.il || kurum.ilce) && (
                      <div className="flex items-center gap-2">
                        <span>🗺️</span>
                        <span>{kurum.il} {kurum.ilce}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>🏢</span>
                      <span>{kurumDepartmanlar.length} Departman</span>
                    </div>
                  </div>

                  {/* Departmanlar ve Birimler - Veri Tabanından */}
                  {(kurum.departmanlar || kurum.birimler) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {kurum.departmanlar && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <span>📋</span>
                              <span>DEPARTMAN</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {kurum.departmanlar.split(', ').filter(d => d.trim()).map((dept, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                                  {dept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {kurum.birimler && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <span>🏢</span>
                              <span>BIRIM</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {kurum.birimler.split(', ').filter(b => b.trim()).map((birim, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                                  {birim}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Departman Özeti - Always Visible */}
                  {kurumDepartmanlar.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-2">Departmanlar</div>
                      <div className="flex flex-wrap gap-1">
                        {kurumDepartmanlar.slice(0, 4).map(dept => (
                          <span key={dept.id} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                            {dept.departman_adi}
                          </span>
                        ))}
                        {kurumDepartmanlar.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{kurumDepartmanlar.length - 4} daha
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expanded Departman Management */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <span>🏢</span>
                        Departman Yönetimi
                      </h4>

                      {/* Add New Departman */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">Yeni Departman Ekle:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreatableSelect
                            options={DEPARTMAN_SABLONLARI.map(dept => ({ value: dept, label: dept }))}
                            value={newDepartmanInputs[kurum.id] ? { value: newDepartmanInputs[kurum.id], label: newDepartmanInputs[kurum.id] } : null}
                            onChange={(selected) => setNewDepartmanInputs(prev => ({ ...prev, [kurum.id]: selected?.value || '' }))}
                            onInputChange={(inputValue) => setNewDepartmanInputs(prev => ({ ...prev, [kurum.id]: inputValue }))}
                            placeholder="Departman adı seçin veya yazın"
                            isClearable
                            classNamePrefix="react-select"
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addDepartman(kurum.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => addDepartman(kurum.id)}
                            disabled={!newDepartmanInputs[kurum.id]?.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            ➕ Ekle
                          </button>
                        </div>
                      </div>

                      {/* Departman List */}
                      <div className="space-y-4">
                        {kurumDepartmanlar.map((departman) => (
                          <div key={departman.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-800 flex items-center gap-2">
                                <span className="text-blue-600">📋</span>
                                {departman.departman_adi}
                              </h5>
                              <button
                                onClick={() => removeDepartman(departman.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Departmanı Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Birimler */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Birimler:</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <CreatableSelect
                                  options={BIRIM_SABLONLARI.map(birim => ({ value: birim, label: birim }))}
                                  value={newBirimInputs[departman.id] ? { value: newBirimInputs[departman.id], label: newBirimInputs[departman.id] } : null}
                                  onChange={(selected) => setNewBirimInputs(prev => ({ ...prev, [departman.id]: selected?.value || '' }))}
                                  onInputChange={(inputValue) => setNewBirimInputs(prev => ({ ...prev, [departman.id]: inputValue }))}
                                  placeholder="Birim adı"
                                  isClearable
                                  classNamePrefix="react-select"
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addBirim(departman.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => addBirim(departman.id)}
                                  disabled={!newBirimInputs[departman.id]?.trim()}
                                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                                >
                                  ➕
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {departman.birimler.split(', ').filter(b => b.trim()).map((birim, birimIndex) => (
                                  <span key={birimIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                    {birim}
                                    <button
                                      onClick={() => removeBirim(departman.id, birim)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      ❌
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Personel Türleri */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Personel Türleri:</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <CreatableSelect
                                  options={PERSONEL_TURLERI.map(personel => ({ value: personel, label: personel }))}
                                  value={newPersonelInputs[departman.id] ? { value: newPersonelInputs[departman.id], label: newPersonelInputs[departman.id] } : null}
                                  onChange={(selected) => setNewPersonelInputs(prev => ({ ...prev, [departman.id]: selected?.value || '' }))}
                                  onInputChange={(inputValue) => setNewPersonelInputs(prev => ({ ...prev, [departman.id]: inputValue }))}
                                  placeholder="Personel türü"
                                  isClearable
                                  classNamePrefix="react-select"
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addPersonel(departman.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => addPersonel(departman.id)}
                                  disabled={!newPersonelInputs[departman.id]?.trim()}
                                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                                >
                                  ➕
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {departman.personel_turleri.split(', ').filter(p => p.trim()).map((personel, personelIndex) => (
                                  <span key={personelIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                    {personel}
                                    <button
                                      onClick={() => removePersonel(departman.id, personel)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      ❌
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {kurumDepartmanlar.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <div className="text-4xl mb-2">🏢</div>
                          <p className="text-sm">Henüz departman eklenmemiş</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800">Kurum Silme Onayı</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Bu kurumu silmek üzeresiniz:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-800">{showDeleteModal.kurum.kurum_adi}</div>
                  <div className="text-sm text-gray-600">{showDeleteModal.kurum.kurum_turu}</div>
                </div>
                
                <p className="text-sm text-gray-600 mt-4 mb-2">
                  Onaylamak için kurum adını yazın:
                </p>
                <input
                  type="text"
                  value={showDeleteModal.confirmText}
                  onChange={(e) => setShowDeleteModal(prev => prev ? { ...prev, confirmText: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={showDeleteModal.kurum.kurum_adi}
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
                  disabled={showDeleteModal.confirmText !== showDeleteModal.kurum.kurum_adi}
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

export default KurumListesi; 