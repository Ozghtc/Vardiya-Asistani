import React from 'react';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  aktif_mi: boolean;
}

interface UserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  kurum_id: string;
  departman_id: string;
  birim_id: string;
}

interface Kurum {
  id: string;
  kurum_adi: string;
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
}

interface DeleteModal {
  type: 'admin' | 'yonetici' | 'personel';
  id: string;
  name: string;
}

interface PersonelKullanicilarProps {
  personeller: User[];
  personelForm: UserForm;
  setPersonelForm: React.Dispatch<React.SetStateAction<UserForm>>;
  handlePersonelSubmit: (e: React.FormEvent) => void;
  editPersonelId: string | null;
  editPersonelForm: UserForm;
  setEditPersonelForm: React.Dispatch<React.SetStateAction<UserForm>>;
  handlePersonelEdit: (user: User) => void;
  handlePersonelEditSave: () => void;
  handlePersonelEditCancel: () => void;
  handlePersonelToggle: (id: string, aktif: boolean) => void;
  handlePersonelDelete: (id: string) => void;
  kurumlar: Kurum[];
  departmanlar: Departman[];
  birimler: Birim[];
  filteredDepartmanlar: Departman[];
  filteredBirimler: Birim[];
  showDeleteModal: DeleteModal | null;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<DeleteModal | null>>;
  deleteConfirmInput: string;
  setDeleteConfirmInput: React.Dispatch<React.SetStateAction<string>>;
  collapsedSections: { [key: string]: boolean };
  toggleSection: (section: string) => void;
}

const PersonelKullanicilar: React.FC<PersonelKullanicilarProps> = ({
  personeller,
  personelForm,
  setPersonelForm,
  handlePersonelSubmit,
  editPersonelId,
  editPersonelForm,
  setEditPersonelForm,
  handlePersonelEdit,
  handlePersonelEditSave,
  handlePersonelEditCancel,
  handlePersonelToggle,
  handlePersonelDelete,
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
  toggleSection
}) => (
  <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 items-start">
    {/* Sol: Form */}
    <div className="w-full max-w-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Personel Ekle</h2>
        <button
          onClick={() => toggleSection('personel')}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsedSections.personel ? '▼' : '▲'}
        </button>
      </div>
      {!collapsedSections.personel && (
        <form onSubmit={handlePersonelSubmit} className="flex flex-col gap-4 mb-8">
          <input name="name" placeholder="Ad Soyad" value={personelForm.name} onChange={e => setPersonelForm((f: UserForm) => ({ ...f, name: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="email" placeholder="Email" type="email" value={personelForm.email} onChange={e => setPersonelForm((f: UserForm) => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="password" placeholder="Şifre" type="password" value={personelForm.password} onChange={e => setPersonelForm((f: UserForm) => ({ ...f, password: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <input name="phone" placeholder="Telefon" type="tel" value={personelForm.phone} onChange={e => setPersonelForm((f: UserForm) => ({ ...f, phone: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required />
          <select name="kurum_id" value={personelForm.kurum_id || ''} onChange={e => setPersonelForm((f: UserForm) => ({ ...f, kurum_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required>
            <option value="">Kurum Seçiniz</option>
            {kurumlar.map((k: Kurum) => (
              <option key={k.id} value={k.id}>{k.kurum_adi}</option>
            ))}
          </select>
          <select name="departman_id" value={personelForm.departman_id || ''} onChange={e => setPersonelForm((f: UserForm) => ({ ...f, departman_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required disabled={!personelForm.kurum_id}>
            <option value="">Departman Seçiniz</option>
            {filteredDepartmanlar.map((d: Departman) => (
              <option key={d.id} value={d.id}>{d.departman_adi}</option>
            ))}
          </select>
          <select name="birim_id" value={personelForm.birim_id || ''} onChange={e => setPersonelForm((f: UserForm) => ({ ...f, birim_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" required disabled={!personelForm.kurum_id}>
            <option value="">Birim Seçiniz</option>
            {filteredBirimler.map((b: Birim) => (
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
        <h3 className="text-xl font-semibold">Personeller</h3>
        <button
          onClick={() => toggleSection('personel')}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsedSections.personel ? '▼' : '▲'}
        </button>
      </div>
      {!collapsedSections.personel && (
        <ul className="divide-y flex-1 flex flex-col">
          {personeller.length === 0 && <li className="py-2 text-gray-500">Henüz personel yok.</li>}
          {personeller.map((user: User) => (
            <li key={user.id} className={`my-3 bg-white rounded-2xl shadow-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 max-w-[650px] ${user.aktif_mi === false ? 'opacity-50 line-through' : ''}`}>
              {editPersonelId === user.id ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                  <div className="flex-1 flex flex-col gap-1">
                    <input name="name" value={editPersonelForm.name} onChange={e => setEditPersonelForm((f: UserForm) => ({ ...f, name: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" />
                    <input name="email" value={editPersonelForm.email} onChange={e => setEditPersonelForm((f: UserForm) => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" />
                    <input name="phone" value={editPersonelForm.phone} onChange={e => setEditPersonelForm((f: UserForm) => ({ ...f, phone: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" />
                    <input name="password" type="text" value={editPersonelForm.password} onChange={e => setEditPersonelForm((f: UserForm) => ({ ...f, password: e.target.value.toLocaleUpperCase('tr-TR') }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]" />
                    <select name="kurum_id" value={editPersonelForm.kurum_id || ''} onChange={e => setEditPersonelForm((f: UserForm) => ({ ...f, kurum_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]">
                      <option value="">Kurum Seçiniz</option>
                      {kurumlar.map((k: Kurum) => (
                        <option key={k.id} value={k.id}>{k.kurum_adi}</option>
                      ))}
                    </select>
                    <select name="departman_id" value={editPersonelForm.departman_id || ''} onChange={e => setEditPersonelForm((f: UserForm) => ({ ...f, departman_id: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full min-w-[280px]">
                      <option value="">Departman Seçiniz</option>
                      {departmanlar.filter((d: Departman) => d.kurum_id === editPersonelForm.kurum_id).map((d: Departman) => (
                        <option key={d.id} value={d.id}>{d.departman_adi}</option>
                      ))}
                    </select>
                    <select name="birim_id" value={editPersonelForm.birim_id || ''} onChange={e => setEditPersonelForm((f: UserForm) => ({ ...f, birim_id: e.target.value }))} className="border rounded px-2 py-1 text-sm">
                      <option value="">Birim Seçiniz</option>
                      {birimler.filter((b: Birim) => b.kurum_id === editPersonelForm.kurum_id).map((b: Birim) => (
                        <option key={b.id} value={b.id}>{b.birim_adi}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 mt-2 md:mt-0 md:ml-4 self-end md:self-auto items-end w-full md:w-auto">
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => handlePersonelToggle(user.id, user.aktif_mi)} title={user.aktif_mi ? 'Pasif Yap' : 'Aktif Yap'} className={`p-2 rounded ${user.aktif_mi ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}><span>⏸</span></button>
                      <button onClick={() => setShowDeleteModal({ type: 'personel', id: user.id, name: user.name })} title="Sil" className="p-2 rounded bg-red-100 text-red-700"><span>🗑</span></button>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={handlePersonelEditSave} className="bg-green-600 text-white px-3 py-1 rounded w-full md:w-auto">Kaydet</button>
                      <button onClick={handlePersonelEditCancel} className="bg-gray-300 text-gray-700 px-3 py-1 rounded w-full md:w-auto">İptal</button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="font-bold text-blue-700">{user.name}</span>
                    <span className="block text-sm text-gray-600">{user.email}</span>
                    <span className="block text-sm text-gray-600">{user.phone}</span>
                    <span className="block text-sm text-gray-600">Kurum: {kurumlar.find((k: Kurum) => k.id === user.kurum_id)?.kurum_adi || '-'}</span>
                    <span className="block text-sm text-gray-600">Departman: {departmanlar.find((d: Departman) => d.id === user.departman_id)?.departman_adi || '-'}</span>
                    <span className="block text-sm text-gray-600">Birim: {birimler.find((b: Birim) => b.id === user.birim_id)?.birim_adi || '-'}</span>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">Personel</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePersonelToggle(user.id, user.aktif_mi)} title={user.aktif_mi ? 'Pasif Yap' : 'Aktif Yap'} className={`p-2 rounded ${user.aktif_mi ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}><span>⏸</span></button>
                    <button onClick={() => setShowDeleteModal({ type: 'personel', id: user.id, name: user.name })} title="Sil" className="p-2 rounded bg-red-100 text-red-700"><span>🗑</span></button>
                    <button onClick={() => handlePersonelEdit(user)} title="Düzenle" className="p-2 rounded bg-blue-100 text-blue-700"><span>✏️</span></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default PersonelKullanicilar; 