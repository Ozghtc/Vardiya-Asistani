// NOT: Bu dosya sadece ana panel ve state/fonksiyon yönetimini içerir.
import React, { useState, useEffect } from 'react';
import AdminKullanicilar from './AdminKullanicilar';
import YoneticiKullanicilar from './YoneticiKullanicilar';
import PersonelKullanicilar from './PersonelKullanicilar';
import Yetkilendirme from './Yetkilendirme';

const initialAdmin = { name: '', email: '', password: '', phone: '' };
const initialUser = { name: '', email: '', password: '', phone: '', kurum_id: '', departman_id: '', birim_id: '' };
const tabs = [
  { id: 'admin', label: 'Adminler' },
  { id: 'yonetici', label: 'Yöneticiler' },
  { id: 'personel', label: 'Personeller' },
  { id: 'yetkilendirme', label: 'Yetkilendirme' },
];

const KullaniciYonetimPaneli: React.FC = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    admin: false, yonetici: false, personel: false, yetkilendirme: false
  });
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  // Adminler
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminForm, setAdminForm] = useState(initialAdmin);
  // Yöneticiler
  const [yoneticiler, setYoneticiler] = useState<any[]>([]);
  const [yoneticiForm, setYoneticiForm] = useState(initialUser);
  // Personeller
  const [personeller, setPersoneller] = useState<any[]>([]);
  const [personelForm, setPersonelForm] = useState(initialUser);
  // Kurum, departman, birim
  const [kurumlar, setKurumlar] = useState<any[]>([]);
  const [departmanlar, setDepartmanlar] = useState<any[]>([]);
  const [birimler, setBirimler] = useState<any[]>([]);
  const [filteredDepartmanlar, setFilteredDepartmanlar] = useState<any[]>([]);
  const [filteredBirimler, setFilteredBirimler] = useState<any[]>([]);
  // Silme modalı
  const [showDeleteModal, setShowDeleteModal] = useState<{ type: 'admin' | 'yonetici' | 'personel', id: string, name: string } | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  // Yetkilendirme
  const [yetkiArama, setYetkiArama] = useState<string>('');
  const [seciliKullanici, setSeciliKullanici] = useState<any>(null);
  const [yetkiDepartman, setYetkiDepartman] = useState('');
  const [yetkiBirim, setYetkiBirim] = useState('');
  const [yetkiGorev, setYetkiGorev] = useState('');
  const [yetkilendirmeler, setYetkilendirmeler] = useState<any[]>([]);
  // Edit state'leri
  const [editAdminId, setEditAdminId] = useState<string | null>(null);
  const [editAdminForm, setEditAdminForm] = useState<any>(initialAdmin);
  const [editYoneticiId, setEditYoneticiId] = useState<string | null>(null);
  const [editYoneticiForm, setEditYoneticiForm] = useState<any>(initialUser);
  const [editPersonelId, setEditPersonelId] = useState<string | null>(null);
  const [editPersonelForm, setEditPersonelForm] = useState<any>(initialUser);

  // CRUD ve yardımcı fonksiyonlar (kısa ve öz)
  const handleAdminDelete = async (id: string) => {
    setAdmins(admins.filter(a => a.id !== id));
    setShowDeleteModal(null);
    setDeleteConfirmInput('');
  };
  const handleAdminToggle = async (id: string, aktif: boolean) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, aktif_mi: !aktif } : a));
  };
  const handleAdminEdit = (user: any) => { setEditAdminId(user.id); setEditAdminForm({ ...user }); };
  const handleAdminEditSave = async () => { setAdmins(admins.map(a => a.id === editAdminId ? { ...editAdminForm } : a)); setEditAdminId(null); };
  const handleAdminEditCancel = () => setEditAdminId(null);
  const handleYoneticiDelete = async (id: string) => { setYoneticiler(yoneticiler.filter(y => y.id !== id)); setShowDeleteModal(null); setDeleteConfirmInput(''); };
  const handleYoneticiToggle = async (id: string, aktif: boolean) => { setYoneticiler(yoneticiler.map(y => y.id === id ? { ...y, aktif_mi: !aktif } : y)); };
  const handleYoneticiEdit = (user: any) => { setEditYoneticiId(user.id); setEditYoneticiForm({ ...user }); };
  const handleYoneticiEditSave = async () => { setYoneticiler(yoneticiler.map(y => y.id === editYoneticiId ? { ...editYoneticiForm } : y)); setEditYoneticiId(null); };
  const handleYoneticiEditCancel = () => setEditYoneticiId(null);
  const handlePersonelDelete = async (id: string) => { setPersoneller(personeller.filter(p => p.id !== id)); setShowDeleteModal(null); setDeleteConfirmInput(''); };
  const handlePersonelToggle = async (id: string, aktif: boolean) => { setPersoneller(personeller.map(p => p.id === id ? { ...p, aktif_mi: !aktif } : p)); };
  const handlePersonelEdit = (user: any) => { setEditPersonelId(user.id); setEditPersonelForm({ ...user }); };
  const handlePersonelEditSave = async () => { setPersoneller(personeller.map(p => p.id === editPersonelId ? { ...editPersonelForm } : p)); setEditPersonelId(null); };
  const handlePersonelEditCancel = () => setEditPersonelId(null);
  // Rol güncelle
  const handleRolGuncelle = async (kullanici: any, yeniRol: string) => {
    if (kullanici.rol === yeniRol) return;
    if (kullanici.rol === 'Admin') {
      setAdmins(admins.map(a => a.id === kullanici.id ? { ...a, rol: yeniRol } : a));
    } else if (kullanici.rol === 'Yönetici') {
      setYoneticiler(yoneticiler.map(y => y.id === kullanici.id ? { ...y, rol: yeniRol } : y));
    } else if (kullanici.rol === 'Personel') {
      setPersoneller(personeller.map(p => p.id === kullanici.id ? { ...p, rol: yeniRol } : p));
    }
    setSeciliKullanici(null);
  };
  // Ekle fonksiyonları
  const handleAdminSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!adminForm.name || !adminForm.email || !adminForm.password || !adminForm.phone) return; setAdmins([...admins, { ...adminForm }]); setAdminForm(initialAdmin); };
  const handleYoneticiSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!yoneticiForm.name || !yoneticiForm.email || !yoneticiForm.password || !yoneticiForm.phone || !yoneticiForm.kurum_id || !yoneticiForm.departman_id || !yoneticiForm.birim_id) return; setYoneticiler([...yoneticiler, { ...yoneticiForm }]); setYoneticiForm(initialUser); };
  const handlePersonelSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!personelForm.name || !personelForm.email || !personelForm.password || !personelForm.phone || !personelForm.kurum_id || !personelForm.departman_id || !personelForm.birim_id) return; setPersoneller([...personeller, { ...personelForm }]); setPersonelForm(initialUser); };
  // Data fetch
  useEffect(() => { setAdmins(admins); }, [admins]);
  useEffect(() => { setYoneticiler(yoneticiler); }, [yoneticiler]);
  useEffect(() => { setPersoneller(personeller); }, [personeller]);
  useEffect(() => { setKurumlar(kurumlar); }, [kurumlar]);
  useEffect(() => { setDepartmanlar(departmanlar); }, [departmanlar]);
  useEffect(() => { setBirimler(birimler); }, [birimler]);
  useEffect(() => { if (yoneticiForm.kurum_id) { setFilteredDepartmanlar(departmanlar.filter((d: any) => d.kurum_id === yoneticiForm.kurum_id)); setFilteredBirimler(birimler.filter((b: any) => b.kurum_id === yoneticiForm.kurum_id)); } else { setFilteredDepartmanlar([]); setFilteredBirimler([]); } setYoneticiForm(f => ({ ...f, departman_id: '', birim_id: '' })); }, [yoneticiForm.kurum_id, departmanlar, birimler]);
  useEffect(() => { if (personelForm.kurum_id) { setFilteredDepartmanlar(departmanlar.filter((d: any) => d.kurum_id === personelForm.kurum_id)); setFilteredBirimler(birimler.filter((b: any) => b.kurum_id === personelForm.kurum_id)); } else { setFilteredDepartmanlar([]); setFilteredBirimler([]); } setPersonelForm(f => ({ ...f, departman_id: '', birim_id: '' })); }, [personelForm.kurum_id, departmanlar, birimler]);
  useEffect(() => {
    const fetchAllYetkiler = async () => {
      setYetkilendirmeler(yetkilendirmeler);
    };
    fetchAllYetkiler();
  }, [yoneticiler]);

  return (
    <div className="w-full max-w-full mx-0 mt-4 bg-white rounded-xl shadow p-2 sm:p-3 md:p-4 lg:p-6">
      <div className="flex gap-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-lg font-semibold border transition ${activeTab === tab.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'admin' && (
        <AdminKullanicilar
          admins={admins}
          adminForm={adminForm}
          setAdminForm={setAdminForm}
          handleAdminSubmit={handleAdminSubmit}
          editAdminId={editAdminId}
          editAdminForm={editAdminForm}
          setEditAdminForm={setEditAdminForm}
          handleAdminEdit={handleAdminEdit}
          handleAdminEditSave={handleAdminEditSave}
          handleAdminEditCancel={handleAdminEditCancel}
          handleAdminToggle={handleAdminToggle}
          handleAdminDelete={handleAdminDelete}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleteConfirmInput={deleteConfirmInput}
          setDeleteConfirmInput={setDeleteConfirmInput}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
        />
      )}
      {activeTab === 'yonetici' && (
        <YoneticiKullanicilar
          yoneticiler={yoneticiler}
          yoneticiForm={yoneticiForm}
          setYoneticiForm={setYoneticiForm}
          handleYoneticiSubmit={handleYoneticiSubmit}
          editYoneticiId={editYoneticiId}
          editYoneticiForm={editYoneticiForm}
          setEditYoneticiForm={setEditYoneticiForm}
          handleYoneticiEdit={handleYoneticiEdit}
          handleYoneticiEditSave={handleYoneticiEditSave}
          handleYoneticiEditCancel={handleYoneticiEditCancel}
          handleYoneticiToggle={handleYoneticiToggle}
          handleYoneticiDelete={handleYoneticiDelete}
          kurumlar={kurumlar}
          departmanlar={departmanlar}
          birimler={birimler}
          filteredDepartmanlar={filteredDepartmanlar}
          filteredBirimler={filteredBirimler}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleteConfirmInput={deleteConfirmInput}
          setDeleteConfirmInput={setDeleteConfirmInput}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
          yetkilendirmeler={yetkilendirmeler}
        />
      )}
      {activeTab === 'personel' && (
        <PersonelKullanicilar
          personeller={personeller}
          personelForm={personelForm}
          setPersonelForm={setPersonelForm}
          handlePersonelSubmit={handlePersonelSubmit}
          editPersonelId={editPersonelId}
          editPersonelForm={editPersonelForm}
          setEditPersonelForm={setEditPersonelForm}
          handlePersonelEdit={handlePersonelEdit}
          handlePersonelEditSave={handlePersonelEditSave}
          handlePersonelEditCancel={handlePersonelEditCancel}
          handlePersonelToggle={handlePersonelToggle}
          handlePersonelDelete={handlePersonelDelete}
          kurumlar={kurumlar}
          departmanlar={departmanlar}
          birimler={birimler}
          filteredDepartmanlar={filteredDepartmanlar}
          filteredBirimler={filteredBirimler}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleteConfirmInput={deleteConfirmInput}
          setDeleteConfirmInput={setDeleteConfirmInput}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
        />
      )}
      {activeTab === 'yetkilendirme' && (
        <Yetkilendirme
          yetkiArama={yetkiArama}
          setYetkiArama={setYetkiArama}
          seciliKullanici={seciliKullanici}
          setSeciliKullanici={setSeciliKullanici}
          admins={admins}
          yoneticiler={yoneticiler}
          personeller={personeller}
          handleRolGuncelle={handleRolGuncelle}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
          kurumlar={kurumlar}
          departmanlar={departmanlar}
          birimler={birimler}
          yetkiDepartman={yetkiDepartman}
          setYetkiDepartman={setYetkiDepartman}
          yetkiBirim={yetkiBirim}
          setYetkiBirim={setYetkiBirim}
          yetkiGorev={yetkiGorev}
          setYetkiGorev={setYetkiGorev}
          yetkilendirmeler={yetkilendirmeler}
          setYetkilendirmeler={setYetkilendirmeler}
        />
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2 text-red-700">Silme Onayı</h2>
            <p className="mb-2">Bu kullanıcıyı silmek üzeresiniz:</p>
            <p className="font-semibold mb-4">{showDeleteModal.name}</p>
            <p className="mb-2 text-sm">Lütfen <span className="font-bold">{showDeleteModal.name}</span> adını tam olarak yazarak onaylayın:</p>
            <input
              className="border rounded px-3 py-2 w-full mb-4"
              value={deleteConfirmInput}
              onChange={e => setDeleteConfirmInput(e.target.value)}
              placeholder="Ad Soyad"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-700">İptal</button>
              <button
                onClick={() => {
                  if (deleteConfirmInput.trim() === showDeleteModal.name.trim()) {
                    if (showDeleteModal.type === 'admin') handleAdminDelete(showDeleteModal.id);
                    if (showDeleteModal.type === 'yonetici') handleYoneticiDelete(showDeleteModal.id);
                    if (showDeleteModal.type === 'personel') handlePersonelDelete(showDeleteModal.id);
                  }
                }}
                disabled={deleteConfirmInput.trim() !== showDeleteModal.name.trim()}
                className={`px-4 py-2 rounded bg-red-600 text-white ${deleteConfirmInput.trim() !== showDeleteModal.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KullaniciYonetimPaneli; 