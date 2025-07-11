import React, { useEffect, useState, useRef } from 'react';
import { List, Plus, Trash2, Pencil, X, Check, Pause, Eye, EyeOff, Edit2 } from 'lucide-react';
import Select from 'react-select';
import turkiyeIller from './il-ilceler/turkiye-il-ilce.json';

const Kurumlar = () => {
  const [kurumlar, setKurumlar] = useState<any[]>([]);
  const [departmanlar, setDepartmanlar] = useState<any[]>([]);
  const [birimler, setBirimler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Yeni ekleme inputları için state
  const [yeniDepartman, setYeniDepartman] = useState<{[kurumId:string]: string}>({});
  const [yeniBirim, setYeniBirim] = useState<{[kurumId:string]: string}>({});
  const [ekleMsg, setEkleMsg] = useState<{[kurumId:string]: string}>({});
  const depInputRefs = useRef<{[kurumId:string]: HTMLInputElement|null}>({});
  const birimInputRefs = useRef<{[kurumId:string]: HTMLInputElement|null}>({});
  const [editKurumId, setEditKurumId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ kurum_adi: string; kurum_turu: string; adres: string; il?: string; ilce?: string }>({ kurum_adi: '', kurum_turu: '', adres: '' });
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>('');
  // Departman ve birim düzenleme için state
  const [editDepartman, setEditDepartman] = useState<{id: string|null, value: string}>({id: null, value: ''});
  const [editBirim, setEditBirim] = useState<{id: string|null, value: string}>({id: null, value: ''});
  const [editIl, setEditIl] = useState<{ value: string; label: string } | null>(null);
  const [editIlce, setEditIlce] = useState<{ value: string; label: string } | null>(null);

  // Sadece localStorage'dan veri çek
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const kurumlarData = localStorage.getItem('kurumlar');
      const depData = localStorage.getItem('departmanlar');
      const birimData = localStorage.getItem('birimler');
      setKurumlar(kurumlarData ? JSON.parse(kurumlarData) : []);
      setDepartmanlar(depData ? JSON.parse(depData) : []);
      setBirimler(birimData ? JSON.parse(birimData) : []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Kurum silme fonksiyonu
  const handleKurumSil = async (kurumId: string) => {
    const { error } = await supabase.from('admin_kurumlar').delete().eq('id', kurumId);
    if (!error) {
      setKurumlar(prev => prev.filter(k => k.id !== kurumId));
      setShowDeleteModal(null);
      setDeleteConfirmInput('');
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

  // Kurum düzenleme iptal
  const handleKurumEditCancel = () => {
    setEditKurumId(null);
  };

  // Kurum pasife al fonksiyonu
  const handleKurumPasif = async (kurumId: string) => {
    const { error } = await supabase.from('admin_kurumlar').update({ aktif_mi: false }).eq('id', kurumId);
    if (!error) setKurumlar(prev => prev.map(k => k.id === kurumId ? { ...k, aktif_mi: false } : k));
  };

  // Kurum aktife al fonksiyonu
  const handleKurumAktif = async (kurumId: string) => {
    const { error } = await supabase.from('admin_kurumlar').update({ aktif_mi: true }).eq('id', kurumId);
    if (!error) setKurumlar(prev => prev.map(k => k.id === kurumId ? { ...k, aktif_mi: true } : k));
  };

  // Departman güncelle
  const handleDepartmanUpdate = async (depId: string) => {
    const { error } = await supabase.from('admin_kurumlar_departmanlar').update({ departman_adi: editDepartman.value }).eq('id', depId);
    if (!error) {
      setDepartmanlar(prev => prev.map(d => d.id === depId ? { ...d, departman_adi: editDepartman.value } : d));
      setEditDepartman({id: null, value: ''});
    }
  };

  // Departman pasif/aktif
  const handleDepartmanAktifPasif = async (depId: string, aktif: boolean) => {
    const { error } = await supabase.from('admin_kurumlar_departmanlar').update({ aktif_mi: !aktif }).eq('id', depId);
    if (!error) setDepartmanlar(prev => prev.map(d => d.id === depId ? { ...d, aktif_mi: !aktif } : d));
  };

  // Birim güncelle
  const handleBirimUpdate = async (birimId: string) => {
    const { error } = await supabase.from('admin_kurumlar_birimler').update({ birim_adi: editBirim.value }).eq('id', birimId);
    if (!error) {
      setBirimler(prev => prev.map(b => b.id === birimId ? { ...b, birim_adi: editBirim.value } : b));
      setEditBirim({id: null, value: ''});
    }
  };

  // Birim pasif/aktif
  const handleBirimAktifPasif = async (birimId: string, aktif: boolean) => {
    const { error } = await supabase.from('admin_kurumlar_birimler').update({ aktif_mi: !aktif }).eq('id', birimId);
    if (!error) setBirimler(prev => prev.map(b => b.id === birimId ? { ...b, aktif_mi: !aktif } : b));
  };

  if (loading) return <div className="p-4">Yükleniyor...</div>;
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><List className="w-5 h-5" /> Kayıtlı Kurumlar</h2>
      {kurumlar.length === 0 && <div className="text-gray-500">Henüz kurum eklenmemiş.</div>}
      <div className="space-y-8">
        {kurumlar
          .filter(k => k.id)
          .sort((a, b) => {
            // Aktifler üstte, pasifler altta
            if ((a.aktif_mi === false || a.aktif_mi === 'false') && (b.aktif_mi !== false && b.aktif_mi !== 'false')) return 1;
            if ((a.aktif_mi !== false && a.aktif_mi !== 'false') && (b.aktif_mi === false || b.aktif_mi === 'false')) return -1;
            return 0;
          })
          .map(kurum => (
          <div key={kurum.id} className={`bg-white rounded-xl shadow p-4${kurum.aktif_mi === false || kurum.aktif_mi === 'false' ? ' opacity-60 bg-gray-100' : ''}`}>
            <div className="flex justify-between items-start mb-1">
              <div className="font-bold text-blue-700 text-lg w-full">
                {editKurumId === kurum.id ? (
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500 font-semibold">Kurum Adı
                      <input
                        className="border rounded p-1 w-full mt-1"
                        value={editValues.kurum_adi}
                        onChange={e => setEditValues(v => ({ ...v, kurum_adi: e.target.value.toUpperCase() }))}
                        placeholder="Kurum Adı"
                      />
                    </label>
                    <label className="text-xs text-gray-500 font-semibold">Kurum Türü
                      <input
                        className="border rounded p-1 w-full mt-1"
                        value={editValues.kurum_turu}
                        onChange={e => setEditValues(v => ({ ...v, kurum_turu: e.target.value.toUpperCase() }))}
                        placeholder="Kurum Türü"
                      />
                    </label>
                    <label className="text-xs text-gray-500 font-semibold">Adres
                      <input
                        className="border rounded p-1 w-full mt-1"
                        value={editValues.adres}
                        onChange={e => setEditValues(v => ({ ...v, adres: e.target.value.toUpperCase() }))}
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
                  </div>
                ) : (
                  <>
                    <div className="mb-1">
                      <span className="text-xs text-gray-500 font-semibold">Kurum Adı:</span> 
                      <span className={`text-blue-700 font-bold text-lg ${kurum.aktif_mi === false || kurum.aktif_mi === 'false' ? 'line-through' : ''}`}>{kurum.kurum_adi}</span>
                    </div>
                    <div className="mb-1"><span className="text-xs text-gray-500 font-semibold">Kurum Türü:</span> <span className="text-gray-700 font-semibold">{kurum.kurum_turu}</span></div>
                    <div className="mb-1"><span className="text-xs text-gray-500 font-semibold">Adres:</span> <span className="text-gray-700">{kurum.adres}</span></div>
                    <div className="mb-1"><span className="text-xs text-gray-500 font-semibold">İl:</span> <span className="text-gray-700 font-semibold">{kurum.il}</span></div>
                    <div className="mb-1"><span className="text-xs text-gray-500 font-semibold">İlçe:</span> <span className="text-gray-700 font-semibold">{kurum.ilce}</span></div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {editKurumId === kurum.id ? (
                  <>
                    <button onClick={() => handleKurumEditSave(kurum.id)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={18} /></button>
                    <button onClick={handleKurumEditCancel} className="p-1 text-gray-400 hover:bg-gray-200 rounded"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleKurumEdit(kurum)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Pencil size={18} /></button>
                    {kurum.aktif_mi === false || kurum.aktif_mi === 'false' ? (
                      <button
                        onClick={() => handleKurumAktif(kurum.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Kurumu tekrar aktif yap"
                      >
                        <Pause size={18} className="rotate-180" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleKurumPasif(kurum.id)}
                        className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                        title="Kurumu pasif yap"
                      >
                        <Pause size={18} />
                      </button>
                    )}
                    <button onClick={() => setShowDeleteModal(kurum.id)} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 size={18} /></button>
                  </>
                )}
              </div>
            </div>
            {/* Silme onay modalı */}
            {showDeleteModal === kurum.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded shadow-lg p-6 min-w-[320px] flex flex-col items-center">
                  <div className="mb-2 text-center font-semibold">Bu kurumu silmek istediğinize emin misiniz?</div>
                  <div className="mb-2 text-sm text-gray-600 text-center">Lütfen silmek için <span className="font-bold text-blue-700">{kurum.kurum_adi}</span> adını aşağıya yazınız.</div>
                  <input
                    type="text"
                    className="border rounded p-2 w-full mb-4 text-center"
                    placeholder="Kurum adını tam olarak yazın"
                    value={deleteConfirmInput}
                    onChange={e => setDeleteConfirmInput(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleKurumSil(kurum.id)}
                      className={`px-4 py-1 rounded text-white ${deleteConfirmInput === kurum.kurum_adi ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
                      disabled={deleteConfirmInput !== kurum.kurum_adi}
                    >
                      Evet
                    </button>
                    <button
                      onClick={() => { setShowDeleteModal(null); setDeleteConfirmInput(''); }}
                      className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              </div>
            )}
            {(kurum.aktif_mi === false || kurum.aktif_mi === 'false') && (
              <div className="text-xs text-gray-500 font-bold mb-2">Pasif</div>
            )}
            {editKurumId !== kurum.id && (
              <div className="flex flex-col md:flex-row gap-4 mt-2">
                {/* Departmanlar */}
                <div className="flex-1">
                  <div className="font-semibold mb-1">🏥 Departmanlar:</div>
                  <div className="flex gap-2 items-center mb-2">
                    <input
                      ref={el => depInputRefs.current[kurum.id] = el}
                      value={yeniDepartman[kurum.id] || ''}
                      onChange={e => setYeniDepartman(d => ({...d, [kurum.id]: e.target.value.toUpperCase()}))}
                      placeholder="Yeni departman"
                      className="border p-2 rounded flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleDepartmanEkle(kurum.id)}
                    />
                    <button onClick={() => handleDepartmanEkle(kurum.id)} className="p-2 bg-blue-100 rounded hover:bg-blue-200"><Plus /></button>
                  </div>
                  <ul className="text-gray-700 min-h-[24px] list-disc list-inside">
                    {departmanlar.filter(d => d.kurum_id === kurum.id).length === 0 ? (
                      <li className="text-gray-400">Henüz eklenmemiş</li>
                    ) : (
                      departmanlar.filter(d => d.kurum_id === kurum.id).map((d, idx) => (
                        <li key={d.id} className={`flex items-center gap-2 ${d.aktif_mi === false ? 'opacity-50 line-through' : ''}`}>
                          {editDepartman.id === d.id ? (
                            <>
                              <input value={editDepartman.value} onChange={e => setEditDepartman({id: d.id, value: e.target.value.toUpperCase()})} className="border rounded p-1" />
                              <button onClick={() => handleDepartmanUpdate(d.id)} className="text-green-600"><Check size={16} /></button>
                              <button onClick={() => setEditDepartman({id: null, value: ''})} className="text-gray-400"><X size={16} /></button>
                            </>
                          ) : (
                            <>
                              <span>{d.departman_adi}</span>
                              <button onClick={() => setEditDepartman({id: d.id, value: d.departman_adi})} className="text-blue-600 hover:bg-blue-100 rounded p-1"><Edit2 size={16} /></button>
                              <button onClick={() => handleDepartmanAktifPasif(d.id, d.aktif_mi)} className="text-yellow-600 hover:bg-yellow-100 rounded p-1">{d.aktif_mi === false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                {/* Birimler */}
                <div className="flex-1">
                  <div className="font-semibold mb-1">👩‍⚕️ Birimler:</div>
                  <div className="flex gap-2 items-center mb-2">
                    <input
                      ref={el => birimInputRefs.current[kurum.id] = el}
                      value={yeniBirim[kurum.id] || ''}
                      onChange={e => setYeniBirim(d => ({...d, [kurum.id]: e.target.value.toUpperCase()}))}
                      placeholder="Yeni birim"
                      className="border p-2 rounded flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleBirimEkle(kurum.id)}
                    />
                    <button onClick={() => handleBirimEkle(kurum.id)} className="p-2 bg-green-100 rounded hover:bg-green-200"><Plus /></button>
                  </div>
                  <ul className="text-gray-700 min-h-[24px] list-disc list-inside">
                    {birimler.filter(b => b.kurum_id === kurum.id).length === 0 ? (
                      <li className="text-gray-400">Henüz eklenmemiş</li>
                    ) : (
                      birimler.filter(b => b.kurum_id === kurum.id).map((b, idx) => (
                        <li key={b.id} className={`flex items-center gap-2 ${b.aktif_mi === false ? 'opacity-50 line-through' : ''}`}>
                          {editBirim.id === b.id ? (
                            <>
                              <input value={editBirim.value} onChange={e => setEditBirim({id: b.id, value: e.target.value.toUpperCase()})} className="border rounded p-1" />
                              <button onClick={() => handleBirimUpdate(b.id)} className="text-green-600"><Check size={16} /></button>
                              <button onClick={() => setEditBirim({id: null, value: ''})} className="text-gray-400"><X size={16} /></button>
                            </>
                          ) : (
                            <>
                              <span>{b.birim_adi}</span>
                              <button onClick={() => setEditBirim({id: b.id, value: b.birim_adi})} className="text-blue-600 hover:bg-blue-100 rounded p-1"><Edit2 size={16} /></button>
                              <button onClick={() => handleBirimAktifPasif(b.id, b.aktif_mi)} className="text-yellow-600 hover:bg-yellow-100 rounded p-1">{b.aktif_mi === false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}
            {ekleMsg[kurum.id] && (
              <div className={`mt-2 text-sm ${ekleMsg[kurum.id].startsWith('Hata') ? 'text-red-600' : 'text-green-600'}`}>{ekleMsg[kurum.id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kurumlar;