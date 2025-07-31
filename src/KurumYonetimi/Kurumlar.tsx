import React, { useEffect, useState } from 'react';
import { List, Plus, Trash2, Pencil, X, Check, Eye, EyeOff } from 'lucide-react';
import { getKurumlar, updateKurum, deleteKurum } from '../../lib/api';
import { clearTableCache, clearAllCache } from '../../lib/api';

const Kurumlar = () => {
  const [kurumlar, setKurumlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKurumId, setEditKurumId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ kurum_adi: string; adres: string; telefon: string; email: string }>({ 
    kurum_adi: '', 
    adres: '', 
    telefon: '', 
    email: '' 
  });
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>('');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // API'den veri çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiKurumlar = await getKurumlar();
        setKurumlar(apiKurumlar);
      } catch (error: any) {
        setErrorMsg('Kurumlar yüklenirken hata oluştu: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Veri yenileme fonksiyonu
  const refreshData = async () => {
    try {
      const apiKurumlar = await getKurumlar(true);
      setKurumlar(apiKurumlar);
      setSuccessMsg('Veriler yenilendi!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg('Veriler yenilenirken hata oluştu: ' + error.message);
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // Kurum silme fonksiyonu
  const handleKurumSil = async (kurumId: string) => {
    setOperationLoading(kurumId);
    try {
      const result = await deleteKurum(kurumId);
      if (result.success) {
        setKurumlar(prev => prev.filter(k => k.id !== kurumId));
        setShowDeleteModal(null);
        setDeleteConfirmInput('');
        setSuccessMsg('Kurum başarıyla silindi!');
        
        // Cache temizle
        clearTableCache('30');
        clearAllCache();
        
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(result.message || 'Kurum silinirken hata oluştu');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (error: any) {
      setErrorMsg('Kurum silinirken hata oluştu: ' + error.message);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setOperationLoading(null);
    }
  };

  // Kurum düzenleme başlat
  const handleKurumEdit = (kurum: any) => {
    setEditKurumId(kurum.id);
    setEditValues({
      kurum_adi: kurum.kurum_adi || '',
      adres: kurum.adres || '',
      telefon: kurum.telefon || '',
      email: kurum.email || '',
    });
  };

  // Kurum düzenleme kaydet
  const handleKurumEditSave = async () => {
    if (!editKurumId) return;
    
    setOperationLoading(editKurumId);
    try {
      const updateData = {
        kurum_adi: editValues.kurum_adi,
        adres: editValues.adres,
        telefon: editValues.telefon,
        email: editValues.email
      };
      
      const result = await updateKurum(editKurumId, updateData);
      
      if (result.success) {
        setKurumlar(prev => prev.map(k => 
          k.id === editKurumId 
            ? { ...k, ...updateData }
            : k
        ));
        
        setEditKurumId(null);
        setSuccessMsg('Kurum başarıyla güncellendi!');
        
        // Cache temizle
        clearTableCache('30');
        clearAllCache();
        
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(result.message || 'Kurum güncellenirken hata oluştu');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (error: any) {
      setErrorMsg('Kurum güncellenirken hata oluştu: ' + error.message);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setOperationLoading(null);
    }
  };

  // Kurum düzenleme iptal
  const handleKurumEditCancel = () => {
    setEditKurumId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-0 mt-4 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <List className="w-6 h-6 text-blue-600" />
          Kurumlar ({kurumlar.length})
        </h1>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Hata/Başarı Mesajları */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMsg}
        </div>
      )}

      {/* Kurumlar Listesi */}
      <div className="space-y-4">
        {kurumlar.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Henüz kurum bulunmamaktadır</div>
          </div>
        ) : (
          kurumlar.map((kurum) => (
            <div key={kurum.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editKurumId === kurum.id ? (
                    // Düzenleme Modu
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editValues.kurum_adi}
                          onChange={(e) => setEditValues(prev => ({...prev, kurum_adi: e.target.value}))}
                          className="border rounded px-3 py-2"
                          placeholder="Kurum Adı"
                        />
                        <input
                          type="text"
                          value={editValues.adres}
                          onChange={(e) => setEditValues(prev => ({...prev, adres: e.target.value}))}
                          className="border rounded px-3 py-2"
                          placeholder="Adres"
                        />
                        <input
                          type="tel"
                          value={editValues.telefon}
                          onChange={(e) => setEditValues(prev => ({...prev, telefon: e.target.value}))}
                          className="border rounded px-3 py-2"
                          placeholder="Telefon"
                        />
                        <input
                          type="email"
                          value={editValues.email}
                          onChange={(e) => setEditValues(prev => ({...prev, email: e.target.value}))}
                          className="border rounded px-3 py-2"
                          placeholder="E-posta"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleKurumEditSave}
                          disabled={operationLoading === kurum.id}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          {operationLoading === kurum.id ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                          onClick={handleKurumEditCancel}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Görüntüleme Modu
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          ID: {kurum.kurum_id}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800">{kurum.kurum_adi}</h3>
                      </div>
                      
                      {kurum.adres && (
                        <p className="text-gray-600">📍 {kurum.adres}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {kurum.telefon && (
                          <span>📞 {kurum.telefon}</span>
                        )}
                        {kurum.email && (
                          <span>✉️ {kurum.email}</span>
                        )}
                      </div>
                      
                      {/* DEPARTMAN ve BIRIM Gösterimi */}
                      {(kurum.departman_id || kurum.departmanlar || kurum.birim_id || kurum.birimler) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* DEPARTMAN */}
                            {(kurum.departman_id || kurum.departmanlar) && (
                              <div>
                                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                  <span>📋</span>
                                  <span>DEPARTMAN</span>
                                </div>
                                {kurum.departman_id && (
                                  <div className="mb-2">
                                    <div className="text-xs text-gray-400 mb-1">DEPARTMAN ID:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {kurum.departman_id.split(',').filter((d: string) => d.trim()).map((deptId: string, index: number) => (
                                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-500 text-xs rounded border">
                                          {deptId.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {kurum.departmanlar && (
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">DEPARTMAN:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {kurum.departmanlar.split(',').filter((d: string) => d.trim()).map((dept: string, index: number) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                                          {dept.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* BIRIM */}
                            {(kurum.birim_id || kurum.birimler) && (
                              <div>
                                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                  <span>🏢</span>
                                  <span>BIRIM</span>
                                </div>
                                {kurum.birim_id && (
                                  <div className="mb-2">
                                    <div className="text-xs text-gray-400 mb-1">BIRIM ID:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {kurum.birim_id.split(',').filter((b: string) => b.trim()).map((birimId: string, index: number) => (
                                        <span key={index} className="px-2 py-1 bg-green-50 text-green-500 text-xs rounded border">
                                          {birimId.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {kurum.birimler && (
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">BIRIM:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {kurum.birimler.split(',').filter((b: string) => b.trim()).map((birim: string, index: number) => (
                                        <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                                          {birim.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editKurumId !== kurum.id && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleKurumEdit(kurum)}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Düzenle"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(kurum.id)}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Silme Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kurumu Sil</h3>
            <p className="text-gray-600 mb-4">
              Bu kurumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Onaylamak için kurum adını yazın:
            </p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Kurum adını yazın..."
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleKurumSil(showDeleteModal)}
                disabled={
                  deleteConfirmInput !== kurumlar.find(k => k.id === showDeleteModal)?.kurum_adi ||
                  operationLoading === showDeleteModal
                }
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading === showDeleteModal ? 'Siliniyor...' : 'Sil'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setDeleteConfirmInput('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kurumlar;