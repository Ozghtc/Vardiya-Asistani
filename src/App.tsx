import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DepartmanBirimProvider } from './admin/VardiyaliNobetSistemi/Tanimlamalar/DepartmanBirimContext';

// Layout components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Landing Page
import LandingPage from './landing/LandingPage';

// Pages
import AdminPage from './admin/AdminPage';
import VardiyaPlanla from './admin/VardiyaliNobetSistemi/NobetIslemleri/VardiyaPlanla';
import KurumEkle from './admin/KurumYonetimi/KurumYonetimi';
import KullaniciYonetimPaneli from './admin/KullaniciYonetimi/KullaniciYonetimPaneli';
import Tanimlamalar from './admin/VardiyaliNobetSistemi/Tanimlamalar/Tanimlamalar';
import PersonelEkle from './admin/VardiyaliNobetSistemi/PersonelEkle/PersonelEkle';
import PersonelListesi from './admin/VardiyaliNobetSistemi/PersonelListesi/PersonelListesi';
import PersonelPaneli from './admin/PersonelPaneli/PersonelPaneli';
import Nobetlerim from './admin/PersonelPaneli/Nobetlerim';
import IstekTaleplerim from './admin/PersonelPaneli/IstekTaleplerim';
import VardiyaliNobet from './admin/VardiyaliNobetSistemi/VardiyaliNobet';
import NobetEkrani from './admin/VardiyaliNobetSistemi/NobetIslemleri/NobetEkrani';
import NobetKurallari from './admin/VardiyaliNobetSistemi/NobetIslemleri/NobetKurallari';
import NobetOlustur from './admin/VardiyaliNobetSistemi/NobetIslemleri/NobetOlustur';
import Raporlar from './admin/VardiyaliNobetSistemi/NobetIslemleri/Raporlar';
import Login from './admin/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/vardiya-planla/*" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><VardiyaPlanla /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/kurum-ekle" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><KurumEkle /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/kullanici-ekle" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><KullaniciYonetimPaneli /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/tanimlamalar/*" element={
          <DepartmanBirimProvider>
            <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
              <Layout><Tanimlamalar /></Layout>
            </ProtectedRoute>
          </DepartmanBirimProvider>
        } />
        <Route path="/personel-ekle" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><PersonelEkle /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/personel-listesi" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><PersonelListesi /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/vardiyali-nobet" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><VardiyaliNobet /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/personel/panel" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici', 'personel']}>
            <Layout><PersonelPaneli /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/personel/nobetlerim" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici', 'personel']}>
            <Layout><Nobetlerim /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/personel/istekler" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici', 'personel']}>
            <Layout><IstekTaleplerim /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/nobet/ekran" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><NobetEkrani /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/nobet/kurallar" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><NobetKurallari /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/nobet/olustur" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><NobetOlustur /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/nobet/raporlar" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><Raporlar /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/kullanicilar" element={
          <ProtectedRoute allowedRoles={['admin', 'yonetici']}>
            <Layout><KullaniciYonetimPaneli /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;