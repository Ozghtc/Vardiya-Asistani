import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { clearTableCache, clearAllCache } from '../../../../lib/api';
import API_CONFIG from '../../../../lib/api';

// Components
import ToastContainer from './components/ToastContainer';
import UnvanYonetimi from './components/UnvanYonetimi';
import MesaiTuruYonetimi from './components/MesaiTuruYonetimi';

// Hooks
import { useToast } from './hooks/useToast';
import { useUnvanOperations } from './hooks/useUnvanOperations';
import { useMesaiOperations } from './hooks/useMesaiOperations';

// Types
import { Unvan, KaydedilenMesai } from './types/UnvanTanimlama.types';

// Utils
import { matchesUserContext } from './utils/unvanHelpers';

const UnvanTanimlama: React.FC = () => {
  const { user } = useAuthContext();
  const [unvanlar, setUnvanlar] = useState<Unvan[]>([]);
  const [kaydedilenMesaiTurleri, setKaydedilenMesaiTurleri] = useState<KaydedilenMesai[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast sistemi
  const { toasts, showSuccessToast, showErrorToast, removeToast } = useToast();

  // Ünvan operasyonları
  const { handleUnvanEkle, handleUnvanSil, error } = useUnvanOperations(
    unvanlar,
    setUnvanlar,
    showSuccessToast,
    showErrorToast
  );

  // Mesai loading state
  const [mesaiLoading, setMesaiLoading] = useState(false);

  // Mesai türlerini yükle - useCallback ile infinite loop önlenir
  const loadMesaiTurleri = useCallback(async (): Promise<void> => {
    if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) return;

    setMesaiLoading(true);
    try {
      clearAllCache();
      clearTableCache('73');
      
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/73',
          method: 'GET',
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        const filteredMesai = data.data.rows.filter((mesai: any) => 
          matchesUserContext(mesai, user)
        );
        setKaydedilenMesaiTurleri(filteredMesai);
      } else {
        setKaydedilenMesaiTurleri([]);
      }
    } catch (error) {
      console.error('Mesai türleri yüklenirken hata:', error);
      setKaydedilenMesaiTurleri([]);
    } finally {
      setMesaiLoading(false);
    }
  }, [user?.kurum_id, user?.departman_id, user?.birim_id]);

  // Mesai operasyonları
  const { handleMesaiEkle, handleMesaiTuruSil } = useMesaiOperations(
    kaydedilenMesaiTurleri,
    setKaydedilenMesaiTurleri,
    showSuccessToast,
    showErrorToast,
    loadMesaiTurleri
  );

  // Initial data loading - SADECE BİR KEZ
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Load Unvanlar
        clearAllCache();
        clearTableCache('69');
        
        const unvanResponse = await fetch('/.netlify/functions/api-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/api/v1/data/table/69',
            method: 'GET',
            apiKey: API_CONFIG.apiKey,
            userEmail: API_CONFIG.userEmail,
            projectPassword: API_CONFIG.projectPassword
          })
        });

        if (unvanResponse.ok) {
          const unvanData = await unvanResponse.json();
          if (unvanData.success && unvanData.data && Array.isArray(unvanData.data.rows)) {
            const filteredUnvanlar = unvanData.data.rows.filter((unvan: any) => 
              matchesUserContext(unvan, user)
            );
            setUnvanlar(filteredUnvanlar);
          }
        }

        // Load Mesai Türleri
        await loadMesaiTurleri();
        
      } catch (error) {
        console.error('🚨 Initial data loading error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [user?.kurum_id, user?.departman_id, user?.birim_id, loadMesaiTurleri]);

  // User context kontrolü
  if (!user?.kurum_id || !user?.departman_id || !user?.birim_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor, lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Haftalık Minimum Mesai Tanımlama */}
      <MesaiTuruYonetimi
        kaydedilenMesaiTurleri={kaydedilenMesaiTurleri}
        mesaiLoading={mesaiLoading}
        onMesaiEkle={handleMesaiEkle}
        onMesaiTuruSil={handleMesaiTuruSil}
      />

      {/* Personel Ünvan Tanımları */}
      <UnvanYonetimi
        unvanlar={unvanlar}
        loading={loading}
        error={error}
        onUnvanEkle={handleUnvanEkle}
        onUnvanSil={handleUnvanSil}
      />
    </div>
  );
};

export default UnvanTanimlama; 