import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

// 3-Layer API Key Configuration
const API_CONFIG = {
  apiKey: import.meta.env.VITE_HZM_API_KEY,
  userEmail: import.meta.env.VITE_HZM_USER_EMAIL,
  projectPassword: import.meta.env.VITE_HZM_PROJECT_PASSWORD,
  baseURL: import.meta.env.VITE_HZM_BASE_URL || 'https://hzmbackandveritabani-production-c660.up.railway.app'
};

interface FormData {
  alan_adi: string;
  aciklama: string;
  aktif_mi: boolean;
}

// Turkish character normalization function
const normalizeTurkishText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
};

const YeniAlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState<FormData>({
    alan_adi: '',
    aciklama: '',
    aktif_mi: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.alan_adi.trim()) {
      setError('Alan adı gereklidir');
      return false;
    }

    if (formData.alan_adi.length < 2) {
      setError('Alan adı en az 2 karakter olmalıdır');
      return false;
    }

    if (formData.alan_adi.length > 100) {
      setError('Alan adı en fazla 100 karakter olabilir');
      return false;
    }

    return true;
  };

  // Check for duplicate area names
  const checkDuplicateAlan = async (alanAdi: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/72',
          method: 'GET',
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (!response.ok) {
        console.warn('Duplicate check failed:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        const existingAlanlar = data.data.rows.filter((alan: any) => 
          alan.kurum_id === user.kurum_id &&
          alan.departman_id === user.departman_id &&
          alan.birim_id === user.birim_id
        );

        // Case-insensitive and Turkish character normalized comparison
        const normalizedNewName = normalizeTurkishText(alanAdi);
        
        return existingAlanlar.some((alan: any) => 
          normalizeTurkishText(alan.alan_adi) === normalizedNewName
        );
      }

      return false;
    } catch (error) {
      console.error('Duplicate check error:', error);
      return false;
    }
  };

  // Generate hierarchical ID for the new area
  const generateAlanId = async (): Promise<string> => {
    if (!user || !user.kurum_id || !user.departman_id || !user.birim_id) {
      console.error('User information incomplete for ID generation');
      return `${Date.now()}_1`; // Fallback
    }

    try {
      const response = await fetch('/.netlify/functions/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/v1/data/table/72',
          method: 'GET',
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch existing areas');
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.rows)) {
        const existingAlanlar = data.data.rows.filter((alan: any) => 
          alan.kurum_id === user.kurum_id &&
          alan.departman_id === user.departman_id &&
          alan.birim_id === user.birim_id
        );

        // Find the highest sequence number for this institution/department/unit
        let maxSira = 0;
        const kurumId = user.kurum_id;
        
        // Extract department and unit codes from IDs
        let departmanKodu = 'D1'; // Default
        let birimKodu = 'B1'; // Default
        
        // Parse departman_id: "6_D1" -> "D1"
        if (user.departman_id && user.departman_id.includes('_')) {
          const parts = user.departman_id.split('_');
          if (parts.length >= 2 && parts[1]) {
            departmanKodu = parts[1];
          }
        }
        
        // Parse birim_id: "6_B1" -> "B1"  
        if (user.birim_id && user.birim_id.includes('_')) {
          const parts = user.birim_id.split('_');
          if (parts.length >= 2 && parts[1]) {
            birimKodu = parts[1];
          }
        }

        // Find existing areas with the same hierarchical pattern
        const prefix = `${kurumId}_${departmanKodu}_${birimKodu}_`;
        
        existingAlanlar.forEach((alan: any) => {
          if (alan.alan_id && alan.alan_id.startsWith(prefix)) {
            const parts = alan.alan_id.split('_');
            if (parts.length >= 4) {
              const sira = parseInt(parts[3]) || 0;
              if (sira > maxSira) {
                maxSira = sira;
              }
            }
          }
        });

        const nextSira = maxSira + 1;
        const alanId = `${kurumId}_${departmanKodu}_${birimKodu}_${nextSira}`;
        
        console.log(`🆔 Generated alan_id: ${alanId}`, {
          kurumId,
          departmanKodu,
          birimKodu,
          nextSira,
          existingCount: existingAlanlar.length
        });
        
        return alanId;
      }

      // Fallback if no existing data
      const kurumId = user.kurum_id;
      const departmanKodu = user.departman_id?.split('_')[1] || 'D1';
      const birimKodu = user.birim_id?.split('_')[1] || 'B1';
      return `${kurumId}_${departmanKodu}_${birimKodu}_1`;
      
    } catch (error) {
      console.error('ID generation error:', error);
      // Fallback ID generation
      const timestamp = Date.now();
      return `${user.kurum_id || 'UNK'}_D1_B1_${timestamp}`;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('Kullanıcı bilgileri yüklenemedi. Lütfen sayfayı yenileyin.');
    return;
  }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check for duplicate names
      const isDuplicate = await checkDuplicateAlan(formData.alan_adi);
      if (isDuplicate) {
        setError(`"${formData.alan_adi}" adında bir alan zaten mevcut. Lütfen farklı bir ad seçin.`);
        setLoading(false);
        return;
      }

      // Generate hierarchical ID
      const alanId = await generateAlanId();

      // Prepare the data to be sent
      const requestData = {
        alan_id: alanId,
        alan_adi: formData.alan_adi.trim(),
        aciklama: formData.aciklama.trim(),
        kurum_id: user.kurum_id,
        departman_id: user.departman_id,
        birim_id: user.birim_id,
        aktif_mi: formData.aktif_mi,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🚀 Sending alan data:', requestData);

      // Send to API
    const response = await fetch('/.netlify/functions/api-proxy', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          path: '/api/v1/data/table/72/rows',
        method: 'POST',
          body: requestData,
          // 3-Layer Authentication
          apiKey: API_CONFIG.apiKey,
          userEmail: API_CONFIG.userEmail,
          projectPassword: API_CONFIG.projectPassword
      })
    });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Alan başarıyla eklendi!');
        console.log('✅ Alan eklendi:', result);
        
        // Reset form
        setFormData({
          alan_adi: '',
          aciklama: '',
          aktif_mi: true
        });

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin/vardiyali-nobet/tanimlamalar/tanimli-alanlar');
        }, 1500);
    } else {
        console.error('❌ API Error:', result);
        setError(result.message || 'Alan eklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      setError('Alan eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500">Kullanıcı bilgileri yükleniyor...</div>
        </div>
                    </div>
    );
  }
                        
                        return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/vardiyali-nobet/tanimlamalar/tanimli-alanlar')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Alan Ekle</h1>
            <p className="text-gray-600">{user.kurum_adi} - {user.departman_adi} - {user.birim_adi}</p>
          </div>
        </div>
            </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alan Adı */}
          <div>
            <label htmlFor="alan_adi" className="block text-sm font-medium text-gray-700 mb-2">
              Alan Adı <span className="text-red-500">*</span>
                  </label>
                    <input
              type="text"
              id="alan_adi"
              value={formData.alan_adi}
              onChange={(e) => handleInputChange('alan_adi', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: Acil Servis, Ameliyathane, Yoğun Bakım"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              En az 2, en fazla 100 karakter. Aynı kurum/departman/birim içinde benzersiz olmalı.
            </p>
              </div>

          {/* Açıklama */}
              <div>
            <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              id="aciklama"
              value={formData.aciklama}
              onChange={(e) => handleInputChange('aciklama', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Alan hakkında detaylı bilgi..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              İsteğe bağlı. En fazla 500 karakter.
            </p>
                </div>
                
          {/* Aktif/Pasif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aktif_mi"
                  checked={formData.aktif_mi === true}
                  onChange={() => handleInputChange('aktif_mi', true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Aktif</span>
                            </label>
              <label className="flex items-center">
                            <input
                  type="radio"
                  name="aktif_mi"
                  checked={formData.aktif_mi === false}
                  onChange={() => handleInputChange('aktif_mi', false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Pasif</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <div className="w-5 h-5 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm">{success}</span>
          </div>
        )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/vardiyali-nobet/tanimlamalar/tanimli-alanlar')}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ekleniyor...
                </>
              ) : (
                <>
              <Save className="w-4 h-4" />
                  Alan Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Bilgi</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Alan adları aynı kurum/departman/birim içinde benzersiz olmalıdır</li>
          <li>• Türkçe karakterler ve büyük/küçük harf farkı gözetilmez</li>
          <li>• Eklenen alan otomatik olarak hiyerarşik ID alacaktır</li>
          <li>• Pasif alanlar sistemde görünür ancak kullanılamaz</li>
        </ul>
      </div>
    </div>
  );
};

export default YeniAlan; 