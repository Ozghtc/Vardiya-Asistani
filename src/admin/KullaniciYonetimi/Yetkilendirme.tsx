import React, { useState } from 'react';

const Yetkilendirme = ({
  yetkiArama,
  setYetkiArama,
  seciliKullanici,
  setSeciliKullanici,
  admins,
  yoneticiler,
  personeller,
  handleRolGuncelle,
  collapsedSections,
  toggleSection,
  kurumlar,
  departmanlar,
  birimler,
  yetkiDepartman,
  setYetkiDepartman,
  yetkiBirim,
  setYetkiBirim,
  yetkiGorev,
  setYetkiGorev,
  yetkilendirmeler,
  setYetkilendirmeler
}) => {
  const [toast, setToast] = useState<string | null>(null);
  const [silModal, setSilModal] = useState<{index: number, yetki: any} | null>(null);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 bg-red-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 cursor-pointer animate-fade-in"
          onClick={() => setToast(null)}
        >
          <span>{toast}</span>
          <button className="ml-2 text-white font-bold">×</button>
        </div>
      )}
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <input
          type="text"
          placeholder="Kullanıcı adı ile ara..."
          className="border rounded px-3 py-2 w-full"
          value={yetkiArama || ''}
          onChange={e => {
            setYetkiArama(e.target.value.toLocaleUpperCase('tr-TR'));
            setSeciliKullanici(null);
          }}
        />
        <button
          onClick={() => toggleSection('yetkilendirme')}
          className="p-2 rounded hover:bg-gray-100 ml-2"
        >
          {collapsedSections.yetkilendirme ? '▼' : '▲'}
        </button>
      </div>
      {!collapsedSections.yetkilendirme && (
        <div className="w-full">
          {seciliKullanici && (
            <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-4 mb-4">
              {/* Kullanıcı Bilgileri YATAY ve kurum bilgisi */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                  <span className="font-bold text-lg">{seciliKullanici.name}</span>
                  <span className="text-gray-600 text-sm md:ml-4">{seciliKullanici.email}</span>
                  <span className="text-gray-600 text-sm md:ml-4">{seciliKullanici.phone}</span>
                  <span className="text-gray-700 text-sm md:ml-4">Rol: <span className="font-semibold">{seciliKullanici.rol}</span></span>
                  {seciliKullanici.rol !== 'Admin' && (
                    <span className="text-gray-700 text-sm md:ml-4">Kurum: <span className="font-semibold">{kurumlar.find(k => k.id === seciliKullanici.kurum_id)?.kurum_adi || '-'}</span></span>
                  )}
                </div>
              </div>
              {/* Eğer admin ise yeşil bilgi kutusu göster */}
              {seciliKullanici.rol === 'Admin' && (
                <div className="bg-green-100 text-green-800 font-semibold rounded p-4 text-center mb-2">
                  Bu kullanıcı programdaki <span className="font-bold">tüm düzenlemeleri yapma yetkisine sahiptir.</span>
                </div>
              )}
              {/* Eğer personel ise mavi bilgi kutusu göster */}
              {seciliKullanici.rol === 'Personel' && (
                <div className="bg-blue-100 text-blue-800 font-semibold rounded p-4 text-center mb-2">
                  Bu kullanıcı kendi sayfasında <span className="font-bold">tüm düzenlemeleri yapmaya ve görmeye yetkilidir.</span>
                </div>
              )}
              {/* Yetki ekleme paneli sadece Yönetici için */}
              {seciliKullanici.rol === 'Yönetici' && (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Yetki Ekle Formu */}
                  <div className="bg-gray-50 border rounded p-4 flex-1 min-w-[260px] max-w-md">
                    <div className="font-bold mb-2">Yetki Ekle</div>
                    <div className="flex flex-col gap-2 mb-2">
                      <select value={yetkiDepartman} onChange={e => setYetkiDepartman(e.target.value)} className="border rounded px-2 py-1">
                        <option value="">Departman Seçiniz</option>
                        {departmanlar.filter(d => d.kurum_id === seciliKullanici.kurum_id).map(d => (
                          <option key={d.id} value={d.id}>{d.departman_adi}</option>
                        ))}
                      </select>
                      <select value={yetkiBirim} onChange={e => setYetkiBirim(e.target.value)} className="border rounded px-2 py-1">
                        <option value="">Birim Seçiniz</option>
                        {birimler.filter(b => b.kurum_id === seciliKullanici.kurum_id).map(b => (
                          <option key={b.id} value={b.id}>{b.birim_adi}</option>
                        ))}
                      </select>
                      <select value={yetkiGorev} onChange={e => setYetkiGorev(e.target.value)} className="border rounded px-2 py-1">
                        <option value="">Görev Seçiniz</option>
                        <option value="GÖREBİLİR">GÖREBİLİR</option>
                        <option value="DÜZENLEYEBİLİR">DÜZENLEYEBİLİR</option>
                      </select>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        onClick={async () => {
                          if (!yetkiDepartman || !yetkiBirim || !yetkiGorev) return;
                          // Supabase'de aynı yetki var mı kontrol et
                          const { data: existing, error: selectError } = await supabase
                            .from('admin_kullanici_yonetici_yetkilendirme')
                            .select('id')
                            .eq('kullanici_id', seciliKullanici.id)
                            .eq('departman_id', yetkiDepartman)
                            .eq('birim_id', yetkiBirim)
                            .eq('gorev', yetkiGorev);
                          if (existing && existing.length > 0) {
                            setToast('Bu yetki zaten eklenmiş!');
                            setTimeout(() => setToast(null), 2500);
                            return;
                          }
                          const { data, error } = await supabase.from('admin_kullanici_yonetici_yetkilendirme').insert([
                            {
                              kullanici_id: seciliKullanici.id,
                              departman_id: yetkiDepartman,
                              birim_id: yetkiBirim,
                              gorev: yetkiGorev
                            }
                          ]).select();
                          if (error) {
                            setToast('Yetkilendirme kaydedilemedi: ' + (error.message || JSON.stringify(error)));
                            setTimeout(() => setToast(null), 2500);
                            return;
                          }
                          setYetkilendirmeler(arr => [
                            ...arr,
                            {
                              kullaniciId: seciliKullanici.id,
                              departmanId: yetkiDepartman,
                              departmanAd: departmanlar.find(d => d.id === yetkiDepartman)?.departman_adi || '',
                              birimId: yetkiBirim,
                              birimAd: birimler.find(b => b.id === yetkiBirim)?.birim_adi || '',
                              gorev: yetkiGorev
                            }
                          ]);
                          setYetkiDepartman('');
                          setYetkiBirim('');
                          setYetkiGorev('');
                        }}
                      >Ekle</button>
                    </div>
                  </div>
                  {/* Eklenen Yetkiler Tablosu */}
                  <div className="flex-1 min-w-[260px] max-w-xl">
                    {yetkilendirmeler.filter(y => y.kullaniciId === seciliKullanici.id).length > 0 && (
                      <div className="w-full mb-2">
                        <table className="w-full text-sm bg-white rounded shadow">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-2 text-left">Departman</th>
                              <th className="p-2 text-left">Birim</th>
                              <th className="p-2 text-left">Görev</th>
                              <th className="p-2 text-left">İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yetkilendirmeler.filter(y => y.kullaniciId === seciliKullanici.id).map((y, i) => (
                              <tr key={i}>
                                <td className="p-2">{y.departmanAd}</td>
                                <td className="p-2">{y.birimAd}</td>
                                <td className="p-2">{y.gorev}</td>
                                <td className="p-2">
                                  <button
                                    className="text-red-600 hover:bg-red-100 rounded px-2 py-1 text-xs border border-red-200"
                                    onClick={() => setSilModal({index: i, yetki: y})}
                                  >Sil</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="w-full max-w-md">
            {yetkiArama && !seciliKullanici && (
              <ul className="divide-y bg-white rounded shadow">
                {[
                  ...admins.map(u => ({ ...u, rol: 'Admin' })),
                  ...yoneticiler.map(u => ({ ...u, rol: 'Yönetici' })),
                  ...personeller.map(u => ({ ...u, rol: 'Personel' }))
                ]
                  .filter(u => u.name && u.name.toLocaleUpperCase('tr-TR').includes(yetkiArama))
                  .map(u => (
                    <li key={u.id} className="py-2 px-4 flex justify-between items-center cursor-pointer hover:bg-blue-50" onClick={() => setSeciliKullanici(u)}>
                      <span>
                        <span className="font-bold">{u.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({u.rol})</span>
                      </span>
                      <span className="text-xs text-gray-400">{u.email}</span>
                    </li>
                  ))}
                {([
                  ...admins,
                  ...yoneticiler,
                  ...personeller
                ].filter(u => u.name && u.name.toLocaleUpperCase('tr-TR').includes(yetkiArama)).length === 0) && (
                  <li className="py-2 px-4 text-gray-400">Eşleşen kullanıcı bulunamadı.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Silme onay kutusu */}
      {silModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
            <div className="mb-2 text-center font-semibold">Bu yetkiyi silmek istediğinize emin misiniz?</div>
            <div className="mb-4 text-xs text-gray-600 text-center">
              <b>Departman:</b> {silModal.yetki.departmanAd}<br/>
              <b>Birim:</b> {silModal.yetki.birimAd}<br/>
              <b>Görev:</b> {silModal.yetki.gorev}
            </div>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  // Supabase'den sil
                  await supabase
                    .from('admin_kullanici_yonetici_yetkilendirme')
                    .delete()
                    .eq('kullanici_id', seciliKullanici.id)
                    .eq('departman_id', silModal.yetki.departmanId)
                    .eq('birim_id', silModal.yetki.birimId)
                    .eq('gorev', silModal.yetki.gorev);
                  // Local state'ten sil
                  setYetkilendirmeler(arr => arr.filter((_, idx) => idx !== silModal.index));
                  setSilModal(null);
                }}
                className="px-4 py-1 rounded text-white bg-red-600 hover:bg-red-700"
              >Evet</button>
              <button
                onClick={() => setSilModal(null)}
                className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
              >Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Yetkilendirme; 