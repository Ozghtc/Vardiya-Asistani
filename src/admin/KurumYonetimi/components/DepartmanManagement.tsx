// Departman Management Component
// Departman ve birim yönetimi için UI component

import React from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Building } from 'lucide-react';
import { DepartmanManagementProps } from '../types/KurumManagement.types';
import { parseDepartmanlar, parseBirimler } from '../utils/kurumHelpers';

const DepartmanManagement: React.FC<DepartmanManagementProps> = ({
  selectedKurum,
  departmanBirimler,
  onUpdate,
  editingDepartman,
  setEditingDepartman,
  newDepartmanInputs,
  setNewDepartmanInputs,
  newBirimInputs,
  setNewBirimInputs,
  newPersonelInputs,
  setNewPersonelInputs
}) => {
  
  // Seçili kurum yok ise gösterme
  if (!selectedKurum) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kurum Seçin</h3>
          <p className="text-gray-600">
            Departman ve birim yönetimi için önce bir kurum seçiniz.
          </p>
        </div>
      </div>
    );
  }

  // Departmanları parse et
  const departmanlar = parseDepartmanlar(selectedKurum.departmanlar || '');
  const birimler = parseBirimler(selectedKurum.birimler || '');

  // Yeni departman ekleme
  const handleAddDepartman = () => {
    const kurumId = selectedKurum.id;
    const newDepartman = newDepartmanInputs[kurumId]?.trim();
    
    if (!newDepartman) return;

    // Mevcut departmanlar listesine ekle
    const updatedDepartmanlar = [...departmanlar, newDepartman];
    
    // TODO: API call to update kurum with new departman
    console.log('Adding departman:', newDepartman, 'to kurum:', kurumId);
    
    // Input'u temizle
    setNewDepartmanInputs((prev: {[kurumId: string]: string}) => ({
      ...prev,
      [kurumId]: ''
    }));
    
    onUpdate();
  };

  // Departman silme
  const handleRemoveDepartman = (index: number) => {
    const updatedDepartmanlar = departmanlar.filter((_, i) => i !== index);
    
    // TODO: API call to update kurum
    console.log('Removing departman at index:', index);
    
    onUpdate();
  };

  // Yeni birim ekleme
  const handleAddBirim = () => {
    const kurumId = selectedKurum.id;
    const newBirim = newBirimInputs[kurumId]?.trim();
    
    if (!newBirim) return;

    // Mevcut birimler listesine ekle
    const updatedBirimler = [...birimler, newBirim];
    
    // TODO: API call to update kurum with new birim
    console.log('Adding birim:', newBirim, 'to kurum:', kurumId);
    
    // Input'u temizle
    setNewBirimInputs(prev => ({
      ...prev,
      [kurumId]: ''
    }));
    
    onUpdate();
  };

  // Birim silme
  const handleRemoveBirim = (index: number) => {
    const updatedBirimler = birimler.filter((_, i) => i !== index);
    
    // TODO: API call to update kurum
    console.log('Removing birim at index:', index);
    
    onUpdate();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Departman & Birim Yönetimi</h2>
        <p className="text-gray-600">
          <strong>{selectedKurum.kurum_adi}</strong> kurumunun departman ve birimlerini yönetin
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* DEPARTMANLAR */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Departmanlar</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {departmanlar.length}
            </span>
          </div>

          {/* Departman Listesi */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {departmanlar.map((departman, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-800">{departman}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingDepartman({ kurumId: selectedKurum.id, departmanIndex: index })}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveDepartman(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {departmanlar.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Henüz departman eklenmemiş</p>
              </div>
            )}
          </div>

          {/* Yeni Departman Ekleme */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Yeni departman adı..."
              value={newDepartmanInputs[selectedKurum.id] || ''}
              onChange={(e) => setNewDepartmanInputs(prev => ({
                ...prev,
                [selectedKurum.id]: e.target.value
              }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDepartman()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleAddDepartman}
              disabled={!newDepartmanInputs[selectedKurum.id]?.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ekle
            </button>
          </div>
        </div>

        {/* BİRİMLER */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Birimler</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {birimler.length}
            </span>
          </div>

          {/* Birim Listesi */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {birimler.map((birim, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-800">{birim}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => console.log('Edit birim:', birim)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveBirim(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {birimler.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Henüz birim eklenmemiş</p>
              </div>
            )}
          </div>

          {/* Yeni Birim Ekleme */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Yeni birim adı..."
              value={newBirimInputs[selectedKurum.id] || ''}
              onChange={(e) => setNewBirimInputs(prev => ({
                ...prev,
                [selectedKurum.id]: e.target.value
              }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBirim()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleAddBirim}
              disabled={!newBirimInputs[selectedKurum.id]?.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ekle
            </button>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Özet</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Toplam Departman:</span>
            <span className="font-medium text-blue-600">{departmanlar.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Toplam Birim:</span>
            <span className="font-medium text-green-600">{birimler.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmanManagement; 