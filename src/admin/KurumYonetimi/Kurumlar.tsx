import React, { useEffect, useState, useRef } from 'react';
import { List, Plus, Trash2, Pencil, X, Check, Pause, Eye, EyeOff, Edit2 } from 'lucide-react';
import Select from 'react-select';
import turkiyeIller from './il-ilceler/turkiye-il-ilce.json';
import { getKurumlar, updateKurum, deleteKurum } from '../../lib/api';

const Kurumlar = () => {
  const [kurumlar, setKurumlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKurumId, setEditKurumId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ kurum_adi: string; kurum_turu: string; adres: string; il?: string; ilce?: string }>({ kurum_adi: '', kurum_turu: '', adres: '' });
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>('');
  const [editIl, setEditIl] = useState<{ value: string; label: string } | null>(null);
  const [editIlce, setEditIlce] = useState<{ value: string; label: string } | null>(null);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // API'den veri çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Normal sayfa yüklendiğinde cache'den al (hızlı)
        const apiKurumlar = await getKurumlar();
        setKurumlar(apiKurumlar);
      } catch (error: any) {
        setErrorMsg('Kurumlar yüklenirken hata oluştu: ' + error.message);
        console.error('API\'den veri çekilemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Veri yenileme fonksiyonu
  const refreshData = async () => {
    try {
      // Zorla yenileme - API'den fresh veri çek
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
      await deleteKurum(kurumId);
      setKurumlar(prev => prev.filter(k => k.id !== kurumId));
      setShowDeleteModal(null);
      setDeleteConfirmInput('');
      setSuccessMsg('Kurum başarıyla silindi!');
      setTimeout(() => setSuccessMsg(''), 3000);
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
      kurum_turu: kurum.kurum_turu || '',
      adres: kurum.adres || '',
      il: kurum.il || '',
      ilce: kurum.ilce || '',
    });
    setEditIl(kurum.il ? { value: kurum.il, label: kurum.il } : null);
    setEditIlce(kurum.ilce ? { value: kurum.ilce, label: kurum.ilce } : null);
  };

  // Kurum düzenleme kaydet
  const handleKurumEditSave = async () => {
    if (!editKurumId) return;
    
    setOperationLoading(editKurumId);
    try {
      const updateData = {
        kurum_adi: editValues.kurum_adi,
        kurum_turu: editValues.kurum_turu,
        adres: editValues.adres,
        il: editIl?.value || '',
        ilce: editIlce?.value || ''
      };
      
      await updateKurum(editKurumId, updateData);
      
      setKurumlar(prev => prev.map(k => 
        k.id === editKurumId 
          ? { ...k, ...updateData }
          : k
      ));
      
      setEditKurumId(null);
      setSuccessMsg('Kurum başarıyla güncellendi!');
      setTimeout(() => setSuccessMsg(''), 3000);
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

  // Kurum aktif/pasif durumunu değiştir
  const handleKurumAktifPasif = async (kurumId: string, aktifMi: boolean) => {
    setOperationLoading(kurumId);
    try {
      await updateKurum(kurumId, { aktif_mi: !aktifMi });
      
      setKurumlar(prev => prev.map(k => 
        k.id === kurumId ? { ...k, aktif_mi: !aktifMi } : k
      ));
      
      setSuccessMsg(`Kurum ${!aktifMi ? 'aktif' : 'pasif'} hale getirildi!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg('Kurum durumu değiştirilirken hata oluştu: ' + error.message);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setOperationLoading(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Kurumlar yükleniyor...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <List className="w-5 h-5" /> Kayıtlı Kurumlar
        </h2>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
        >
          Yenile
        </button>
      </div>

      {/* Error/Success Messages */}
      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
          {successMsg}
        </div>
      )}

      {kurumlar.length === 0 && (
        <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
          Henüz kurum eklenmemiş. "Kurum Ekle" sekmesinden yeni kurum ekleyebilirsiniz.
        </div>
      )}

      <div className="space-y-4">
        {kurumlar
          .sort((a, b) => {
            // Aktifler üstte, pasifler altta
            if ((a.aktif_mi === false) && (b.aktif_mi !== false)) return 1;
            if ((a.aktif_mi !== false) && (b.aktif_mi === false)) return -1;
            return 0;
          })
          .map(kurum => (
          <div 
            key={kurum.id} 
            className={`bg-white rounded-xl shadow p-4 ${kurum.aktif_mi === false ? 'opacity-60 bg-gray-100' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="font-bold text-blue-700 text-lg w-full">
                {editKurumId === kurum.id ? (
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500 font-semibold">Kurum Adı
                      <input
                        className="border rounded p-2 w-full mt-1"
                        value={editValues.kurum_adi}
                        onChange={e => setEditValues(v => ({ ...v, kurum_adi: e.target.value.toLocaleUpperCase('tr-TR') }))}
                        placeholder="Kurum Adı"
                      />
                    </label>
                    <label className="text-xs text-gray-500 font-semibold">Kurum Türü
                      <input
                        className="border rounded p-2 w-full mt-1"
                        value={editValues.kurum_turu}
                        onChange={e => setEditValues(v => ({ ...v, kurum_turu: e.target.value.toLocaleUpperCase('tr-TR') }))}
                        placeholder="Kurum Türü"
                      />
                    </label>
                    <label className="text-xs text-gray-500 font-semibold">Adres
                      <input
                        className="border rounded p-2 w-full mt-1"
                        value={editValues.adres}
                        onChange={e => setEditValues(v => ({ ...v, adres: e.target.value.toLocaleUpperCase('tr-TR') }))}
                        placeholder="Adres"
                      />
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 font-semibold">İl
                          <Select
                            options={turkiyeIller.map(i => ({ value: i.ad, label: i.ad }))}
                            value={editIl}
                            onChange={v => { setEditIl(v); setEditIlce(null); }}
                            placeholder="İl"
                            isClearable
                            classNamePrefix="react-select"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 font-semibold">İlçe
                          <Select
                            options={editIl ? (turkiyeIller.find(i => i.ad === editIl.value)?.ilceler || []).map(ilceAd => ({ value: ilceAd, label: ilceAd })) : []}
                            value={editIlce}
                            onChange={v => setEditIlce(v)}
                            placeholder="İlçe"
                            isClearable
                            isDisabled={!editIl}
                            classNamePrefix="react-select"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={handleKurumEditSave} 
                        disabled={operationLoading === kurum.id}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {operationLoading === kurum.id ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      <button 
                        onClick={handleKurumEditCancel} 
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-bold mb-2">{kurum.kurum_adi}</div>
                    <div className="text-sm text-gray-600 font-normal space-y-1">
                      {/* Kurum ID'si - Veritabanında görünür */}
                      <div>
                        <span className="font-semibold">Kurum ID:</span> 
                        <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-mono">
                          {kurum.kurum_id || 'KURUM_001'}
                        </span>
                      </div>
                      {kurum.kurum_turu && <div><span className="font-semibold">Tür:</span> {kurum.kurum_turu}</div>}
                      {kurum.adres && <div><span className="font-semibold">Adres:</span> {kurum.adres}</div>}
                      {(kurum.il || kurum.ilce) && (
                        <div><span className="font-semibold">Konum:</span> {kurum.il} {kurum.ilce}</div>
                      )}
                      {/* Departman ID'leri */}
                      {kurum.departmanlar && (
                        <div>
                          <span className="font-semibold">Departmanlar:</span>
                          <div className="ml-4 mt-1 space-y-1">
                            {kurum.departmanlar.split(',').map((dep: string, idx: number) => (
                              <div key={idx} className="text-xs">
                                <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                                  {kurum.kurum_id || 'KURUM_001'}_{dep.trim().replace(/\s+/g, '_').toUpperCase()}
                                </span>
                                <span>{dep.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Birim ID'leri */}
                      {kurum.birimler && (
                        <div>
                          <span className="font-semibold">Birimler:</span>
                          <div className="ml-4 mt-1 space-y-1">
                            {kurum.birimler.split(',').map((birim: string, idx: number) => (
                              <div key={idx} className="text-xs">
                                <span className="font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
                                  {kurum.kurum_id || 'KURUM_001'}_{birim.trim().replace(/\s+/g, '_').toUpperCase()}
                                </span>
                                <span>{birim.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Durum:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${kurum.aktif_mi === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {kurum.aktif_mi === false ? 'Pasif' : 'Aktif'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {editKurumId !== kurum.id && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleKurumEdit(kurum)} 
                    className="p-2 bg-blue-100 rounded hover:bg-blue-200" 
                    title="Düzenle"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleKurumAktifPasif(kurum.id, kurum.aktif_mi)} 
                    disabled={operationLoading === kurum.id}
                    className="p-2 bg-yellow-100 rounded hover:bg-yellow-200 disabled:opacity-50" 
                    title={kurum.aktif_mi === false ? 'Aktif Yap' : 'Pasif Yap'}
                  >
                    {operationLoading === kurum.id ? (
                      <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Pause size={16} />
                    )}
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(kurum.id)} 
                    className="p-2 bg-red-100 rounded hover:bg-red-200" 
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Silme Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Kurumu Sil</h3>
            <p className="text-gray-600 mb-4">
              Bu kurumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Silmek için "SİL" yazın:
            </p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              className="border rounded p-2 w-full mb-4"
              placeholder="SİL"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setDeleteConfirmInput('');
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmInput === 'SİL') {
                    handleKurumSil(showDeleteModal);
                  }
                }}
                disabled={deleteConfirmInput !== 'SİL' || operationLoading === showDeleteModal}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading === showDeleteModal ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kurumlar;