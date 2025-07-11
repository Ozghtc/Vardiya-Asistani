import React from 'react';

const AdminKullanicilar = ({
  admins,
  adminForm,
  setAdminForm,
  handleAdminSubmit,
  editAdminId,
  editAdminForm,
  setEditAdminForm,
  handleAdminEdit,
  handleAdminEditSave,
  handleAdminEditCancel,
  handleAdminToggle,
  handleAdminDelete,
  showDeleteModal,
  setShowDeleteModal,
  deleteConfirmInput,
  setDeleteConfirmInput,
  collapsedSections,
  toggleSection
}) => (
  <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 items-start">
    {/* Sol: Form */}
    <div className="w-full max-w-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Admin Ekle</h2>
        <button
          onClick={() => toggleSection('admin')}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsedSections.admin ? '▼' : '▲'}
        </button>
      </div>
      {!collapsedSections.admin && (
        <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4 mb-8">
          <input name="name" placeholder="Ad Soyad" value={adminForm.name} onChange={e => setAdminForm(f => ({ ...f, name: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="email" placeholder="Email" type="email" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="password" placeholder="Şifre" type="password" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="phone" placeholder="Telefon" type="tel" value={adminForm.phone} onChange={e => setAdminForm(f => ({ ...f, phone: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition w-full md:w-1/2">Ekle</button>
        </form>
      )}
    </div>
    {/* Sağ: Liste */}
    <div className="h-full min-h-[420px] flex flex-col justify-start mt-0 w-full max-w-[700px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">Adminler</h3>
        <button
          onClick={() => toggleSection('admin')}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsedSections.admin ? '▼' : '▲'}
        </button>
      </div>
      {!collapsedSections.admin && (
        <ul className="divide-y flex-1 flex flex-col">
          {admins.length === 0 && <li className="py-2 text-gray-500">Henüz admin yok.</li>}
          {admins.map(user => (
            <li key={user.id} className={`my-3 bg-white rounded-2xl shadow-lg border p-4 flex flex-col gap-2 relative max-w-[650px] ${user.aktif_mi === false ? 'opacity-50 line-through' : ''}`}>
              {editAdminId === user.id ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                  <div className="flex-1 flex flex-col gap-1">
                    <input name="name" value={editAdminForm.name} onChange={e => setEditAdminForm((f) => ({ ...f, name: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full md:w-1/2" />
                    <input name="email" value={editAdminForm.email} onChange={e => setEditAdminForm((f) => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full md:w-1/2" />
                    <input name="phone" value={editAdminForm.phone} onChange={e => setEditAdminForm((f) => ({ ...f, phone: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full md:w-1/2" />
                    <input name="password" type="text" value={editAdminForm.password} onChange={e => setEditAdminForm((f) => ({ ...f, password: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full md:w-1/2" />
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 mt-2 md:mt-0 md:ml-4 self-end md:self-auto">
                    <button onClick={handleAdminEditSave} className="bg-green-600 text-white px-3 py-1 rounded">Kaydet</button>
                    <button onClick={handleAdminEditCancel} className="bg-gray-300 text-gray-700 px-3 py-1 rounded">İptal</button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-blue-700">{user.name}</span>
                  <span className="block text-sm text-gray-600">{user.email}</span>
                  <span className="block text-sm text-gray-600">{user.phone}</span>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">Admin</span>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleAdminToggle(user.id, user.aktif_mi)} title={user.aktif_mi ? 'Pasif Yap' : 'Aktif Yap'} className={`p-2 rounded ${user.aktif_mi ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}><span>⏸</span></button>
                <button onClick={() => setShowDeleteModal({ type: 'admin', id: user.id, name: user.name })} title="Sil" className="p-2 rounded bg-red-100 text-red-700"><span>🗑</span></button>
                {editAdminId !== user.id && <button onClick={() => handleAdminEdit(user)} title="Düzenle" className="p-2 rounded bg-blue-100 text-blue-700"><span>✏️</span></button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default AdminKullanicilar; 