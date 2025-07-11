import React from 'react';

const YoneticiKullanicilar = ({
  yoneticiler,
  yoneticiForm,
  setYoneticiForm,
  handleYoneticiSubmit,
  editYoneticiId,
  editYoneticiForm,
  setEditYoneticiForm,
  handleYoneticiEdit,
  handleYoneticiEditSave,
  handleYoneticiEditCancel,
  handleYoneticiToggle,
  handleYoneticiDelete,
  kurumlar,
  departmanlar,
  birimler,
  filteredDepartmanlar,
  filteredBirimler,
  showDeleteModal,
  setShowDeleteModal,
  deleteConfirmInput,
  setDeleteConfirmInput,
  collapsedSections,
  toggleSection,
  yetkilendirmeler
}) => (
  <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 items-start">
    {/* Sol: Form */}
    <div className="w-full max-w-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Yönetici Ekle</h2>
        <button
          onClick={() => toggleSection('yonetici')}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsedSections.yonetici ? '▼' : '▲'}
        </button>
      </div>
      {!collapsedSections.yonetici && (
        <form onSubmit={handleYoneticiSubmit} className="flex flex-col gap-4 mb-8">
          <input name="name" placeholder="Ad Soyad" value={yoneticiForm.name} onChange={e => setYoneticiForm(f => ({ ...f, name: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="email" placeholder="Email" type="email" value={yoneticiForm.email} onChange={e => setYoneticiForm(f => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="password" placeholder="Şifre" type="password" value={yoneticiForm.password} onChange={e => setYoneticiForm(f => ({ ...f, password: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="phone" placeholder="Telefon" type="tel" value={yoneticiForm.phone} onChange={e => setYoneticiForm(f => ({ ...f, phone: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <select name="kurum_id" value={yoneticiForm.kurum_id || ''} onChange={e => setYoneticiForm(f => ({ ...f, kurum_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required>
            <option value="">Kurum Seçiniz</option>
            {kurumlar.map((k) => (
              <option key={k.id} value={k.id}>{k.kurum_adi}</option>
            ))}
          </select>
          <select name="departman_id" value={yoneticiForm.departman_id || ''} onChange={e => setYoneticiForm(f => ({ ...f, departman_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required disabled={!yoneticiForm.kurum_id}>
            <option value="">Departman Seçiniz</option>
            {filteredDepartmanlar.map((d) => (
              <option key={d.id} value={d.id}>{d.departman_adi}</option>
            ))}
          </select>
          <select name="birim_id" value={yoneticiForm.birim_id || ''} onChange={e => setYoneticiForm(f => ({ ...f, birim_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required disabled={!yoneticiForm.kurum_id}>
            <option value="">Birim Seçiniz</option>
            {filteredBirimler.map((b) => (
              <option key={b.id} value={b.id}>{b.birim_adi}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition w-full md:w-1/2">Ekle</button>
        </form>
      )}
    </div>
    {/* Sağ: Liste */}
    <div className="h-full min-h-[420px] flex flex-col justify-start mt-0 w-full max-w-[700px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">Yöneticiler</h3>
        <button
          onClick={() => toggleSection('yonetici')}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsedSections.yonetici ? '▼' : '▲'}
        </button>
      </div>
      {!collapsedSections.yonetici && (
        <ul className="divide-y flex-1 flex flex-col">
          {yoneticiler.length === 0 && <li className="py-2 text-gray-500">Henüz yönetici yok.</li>}
          {yoneticiler.map(user => {
            if (!departmanlar.length || !birimler.length) return null;
            const kullaniciYetkileri = yetkilendirmeler
              .filter(y => y.kullanici_id === user.id)
              .map(y => ({
                departmanAd: departmanlar.find(d => d.id === y.departman_id)?.departman_adi || '-',
                birimAd: birimler.find(b => b.id === y.birim_id)?.birim_adi || '-',
                gorev: y.gorev,
                departmanId: y.departman_id,
                birimId: y.birim_id
              }));
            const kendiBolumuDuzenleyebilir = kullaniciYetkileri.some(
              y => y.departmanId === user.departman_id && y.birimId === user.birim_id && y.gorev === 'DÜZENLEYEBİLİR'
            );
            const kendiBolumuGorebilir = kullaniciYetkileri.some(
              y => y.departmanId === user.departman_id && y.birimId === user.birim_id && y.gorev === 'GÖREBİLİR'
            );
            const baskaBolumlerdeDuzenleyebilir = kullaniciYetkileri.some(
              y => (y.departmanId !== user.departman_id || y.birimId !== user.birim_id) && y.gorev === 'DÜZENLEYEBİLİR'
            );
            const baskaBolumlerdeGorebilir = kullaniciYetkileri.some(
              y => (y.departmanId !== user.departman_id || y.birimId !== user.birim_id) && y.gorev === 'GÖREBİLİR'
            );
            // DÜZENLEME MODU
            if (editYoneticiId === user.id) {
              return (
                <li key={user.id} className="my-3 bg-blue-50 rounded-2xl shadow-lg border p-4 flex flex-col gap-2 relative max-w-[650px]">
                  <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); handleYoneticiEditSave(); }}>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input name="name" placeholder="Ad Soyad" value={editYoneticiForm.name} onChange={e => setEditYoneticiForm(f => ({ ...f, name: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full" required />
                      <input name="email" placeholder="Email" type="email" value={editYoneticiForm.email} onChange={e => setEditYoneticiForm(f => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" required />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input name="password" placeholder="Şifre" type="text" value={editYoneticiForm.password} onChange={e => setEditYoneticiForm(f => ({ ...f, password: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" required />
                      <input name="phone" placeholder="Telefon" type="tel" value={editYoneticiForm.phone} onChange={e => setEditYoneticiForm(f => ({ ...f, phone: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" required />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <select name="kurum_id" value={editYoneticiForm.kurum_id || ''} onChange={e => setEditYoneticiForm(f => ({ ...f, kurum_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" required>
                        <option value="">Kurum Seçiniz</option>
                        {kurumlar.map((k) => (
                          <option key={k.id} value={k.id}>{k.kurum_adi}</option>
                        ))}
                      </select>
                      <select name="departman_id" value={editYoneticiForm.departman_id || ''} onChange={e => setEditYoneticiForm(f => ({ ...f, departman_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" required disabled={!editYoneticiForm.kurum_id}>
                        <option value="">Departman Seçiniz</option>
                        {departmanlar.filter(d => d.kurum_id === editYoneticiForm.kurum_id).map((d) => (
                          <option key={d.id} value={d.id}>{d.departman_adi}</option>
                        ))}
                      </select>
                      <select name="birim_id" value={editYoneticiForm.birim_id || ''} onChange={e => setEditYoneticiForm(f => ({ ...f, birim_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" required disabled={!editYoneticiForm.kurum_id}>
                        <option value="">Birim Seçiniz</option>
                        {birimler.filter(b => b.kurum_id === editYoneticiForm.kurum_id).map((b) => (
                          <option key={b.id} value={b.id}>{b.birim_adi}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button type="button" onClick={handleYoneticiEditCancel} className="px-4 py-2 rounded bg-gray-200 text-gray-700">İptal</button>
                      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Kaydet</button>
                    </div>
                  </form>
                </li>
              );
            }
            return (
              <li key={user.id} className={`my-3 bg-white rounded-2xl shadow-lg border p-4 flex flex-col gap-2 relative max-w-[650px] ${user.aktif_mi === false ? 'opacity-50 line-through' : ''}`}>
                <div className="flex flex-row justify-between items-start w-full">
                  <div className="flex-1">
                    <span className="font-bold text-blue-700">{user.name}</span>
                    <span className="block text-sm text-gray-600">{user.email}</span>
                    <span className="block text-sm text-gray-600">{user.phone}</span>
                    <span className="block text-sm text-gray-600">Kurum: {kurumlar.find(k => k.id === user.kurum_id)?.kurum_adi || '-'}</span>
                    <span className="block text-sm text-gray-600">Departman: {departmanlar.find(d => d.id === user.departman_id)?.departman_adi || '-'}</span>
                    <span className="block text-sm text-gray-600">Birim: {birimler.find(b => b.id === user.birim_id)?.birim_adi || '-'}</span>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">Yönetici</span>
                  </div>
                  <div className="flex gap-2 ml-4 mt-1">
                    <button onClick={() => handleYoneticiToggle(user.id, user.aktif_mi)} title={user.aktif_mi ? 'Pasif Yap' : 'Aktif Yap'} className={`p-2 rounded ${user.aktif_mi ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}><span>⏸</span></button>
                    <button onClick={() => setShowDeleteModal({ type: 'yonetici', id: user.id, name: user.name })} title="Sil" className="p-2 rounded bg-red-100 text-red-700"><span>🗑</span></button>
                    <button onClick={() => handleYoneticiEdit(user)} title="Düzenle" className="p-2 rounded bg-blue-100 text-blue-700"><span>✏️</span></button>
                  </div>
                </div>
                {/* Uyarı ve bilgi kutuları */}
                {!kendiBolumuDuzenleyebilir && !kendiBolumuGorebilir && !baskaBolumlerdeDuzenleyebilir && !baskaBolumlerdeGorebilir && (
                  <div className="bg-red-100 text-red-700 font-semibold rounded p-2 text-center my-2">
                    Kendi departmanı veya birimi için düzenleme/görüntüleme yetkisi ekli değil!
                  </div>
                )}
                {!kendiBolumuDuzenleyebilir && kendiBolumuGorebilir && (
                  <div className="bg-yellow-100 text-yellow-800 font-semibold rounded p-2 text-center my-2">
                    Kendi departmanı veya birimi için sadece görüntüleme yetkisi var!
                  </div>
                )}
                {!kendiBolumuDuzenleyebilir && baskaBolumlerdeDuzenleyebilir && (
                  <div className="bg-blue-100 text-blue-800 font-semibold rounded p-2 text-center my-2">
                    Başka birim/departmanı da düzenleyebiliyor.
                  </div>
                )}
                {!kendiBolumuDuzenleyebilir && !baskaBolumlerdeDuzenleyebilir && baskaBolumlerdeGorebilir && (
                  <div className="bg-gray-100 text-gray-800 font-semibold rounded p-2 text-center my-2">
                    Başka birim/departmanı da görebiliyor.
                  </div>
                )}
                {/* Yetkiler tablosu */}
                {kullaniciYetkileri.length > 0 && (
                  <div className="mt-2 w-full">
                    <span className="font-bold text-xs text-gray-700">Yetkiler:</span>
                    <table className="w-full text-xs bg-gray-50 rounded mt-1">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-1 text-left">Departman</th>
                          <th className="p-1 text-left">Birim</th>
                          <th className="p-1 text-left">Görev</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kullaniciYetkileri.map((y, i) => (
                          <tr key={i}>
                            <td className="p-1">{y.departmanAd}</td>
                            <td className="p-1">{y.birimAd}</td>
                            <td className="p-1">{y.gorev}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </div>
);

export default YoneticiKullanicilar; 