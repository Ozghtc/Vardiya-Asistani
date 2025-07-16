import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, Power, Undo2, Trash2 } from 'lucide-react';

interface NobetGrubu {
  saat: number;
  gunler: string[];
}

interface Alan {
  id: number;
  name: string;
  color: string;
  description: string;
  isActive?: boolean;
  nobetler?: NobetGrubu[];
}

export default function PersonelNobetTanimlama() {
  const [selectedDate, setSelectedDate] = useState('');
  const [addedDays, setAddedDays] = useState<{day: string, dayOfWeek: string}[]>([]);
  const [monthYear, setMonthYear] = useState('');
  const [kalanAlanlar, setKalanAlanlar] = useState<Alan[]>([]);
  const [ortaAlanlar, setOrtaAlanlar] = useState<Alan[]>([]);
  const [expandedAlanId, setExpandedAlanId] = useState<number | null>(null);
  const [kayitliOzelNobetler, setKayitliOzelNobetler] = useState<string[]>([]);
  const [kayitliGenelNobetler, setKayitliGenelNobetler] = useState<string[]>([]);
  const [pasifAlanlar, setPasifAlanlar] = useState<number[]>([]);
  const [alanDurumlar, setAlanDurumlar] = useState<{[key: number]: boolean}>({});
  const [expandedNobetSaati, setExpandedNobetSaati] = useState<{[key: number]: number[]}>({});
  const [secilenNobetler, setSecilenNobetler] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // KURAL 16: Production ortamında localStorage yasak - demo data sistemi
    const demoAreas = [
      { id: 1, name: 'Acil Servis', isActive: true, color: '#FF0000', description: 'Acil Servis' },
      { id: 2, name: 'Dahiliye', isActive: true, color: '#00FF00', description: 'Dahiliye' },
      { id: 3, name: 'Cerrahi', isActive: true, color: '#0000FF', description: 'Cerrahi' }
    ];
    setKalanAlanlar(demoAreas);
    
    const durumlar = demoAreas.reduce((acc: any, alan: any) => ({
      ...acc,
      [alan.id]: alan.isActive ?? true
    }), {});
    setAlanDurumlar(durumlar);
    
    // Demo nöbet verileri
    setKayitliGenelNobetler(['Gündüz', 'Gece']);
    setKayitliOzelNobetler(['Hafta Sonu', 'Bayram']);
  }, []);

  const getFilteredGunler = (gunler: string[]) => {
    if (addedDays.length === 0) return gunler;
    return gunler.filter(gun => addedDays.some(day => day.dayOfWeek === gun));
  };

  const toggleAllDaysForNobet = (alanId: number, saat: number, gunler: string[]) => {
    const filteredGunler = getFilteredGunler(gunler);
    const allSelected = filteredGunler.every(gun => {
      const key = `${alanId}-${saat}-${gun}`;
      return secilenNobetler[key];
    });

    const newSelections = { ...secilenNobetler };
    filteredGunler.forEach(gun => {
      const key = `${alanId}-${saat}-${gun}`;
      newSelections[key] = !allSelected;
    });

    setSecilenNobetler(newSelections);
  };

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[date.getDay()];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleAddDate = () => {
    if (selectedDate) {
      const dateObj = new Date(selectedDate);
      const day = dateObj.getDate().toString();
      const dayOfWeek = getDayOfWeek(selectedDate);
      const month = dateObj.toLocaleDateString('tr-TR', { month: 'long' });
      const year = dateObj.getFullYear();
      
      setMonthYear(`${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`);
      setAddedDays(prev => [...prev, { day, dayOfWeek }]);
      setSelectedDate('');
    }
  };

  const handleClearDays = () => {
    setAddedDays([]);
    setMonthYear('');
  };

  const toggleAlanDurum = (alanId: number) => {
    setAlanDurumlar(prev => ({
      ...prev,
      [alanId]: !prev[alanId]
    }));
  };

  const alaniOrtayaTasi = (alan: Alan) => {
    setOrtaAlanlar(prev => [...prev, alan]);
    setPasifAlanlar(prev => [...prev, alan.id]);
  };

  const alaniGeriGonder = (alan: Alan) => {
    setOrtaAlanlar(prev => prev.filter(a => a.id !== alan.id));
    setPasifAlanlar(prev => prev.filter(id => id !== alan.id));
  };

  const toggleAlanAccordion = (alanId: number) => {
    setExpandedAlanId(prev => (prev === alanId ? null : alanId));
  };

  const handleKaydet = (alan: Alan) => {
    if (!alan.nobetler) return;

    const secilenNobetBilgileri = Object.entries(secilenNobetler)
      .filter(([key, isSelected]) => {
        if (!isSelected) return false;
        const [alanId, saat, gun] = key.split('-');
        return Number(alanId) === alan.id;
      })
      .map(([key]) => {
        const [_, saat, gun] = key.split('-');
        return { saat: Number(saat), gun };
      });

    if (addedDays.length > 0) {
      const nobetOzeti = addedDays.map(({ day, dayOfWeek }) => {
        const gunNobetleri = secilenNobetBilgileri
          .filter(nobet => nobet.gun === dayOfWeek)
          .map(nobet => `${nobet.saat}s`)
          .join(', ');

        return `${day} (${dayOfWeek}): ${gunNobetleri || 'Nöbet seçilmedi'}`;
      }).join(' | ');

      const ozet = `${alan.name} - ${nobetOzeti}`;
      setKayitliOzelNobetler(prev => {
        const newList = [...prev, ozet];
        // KURAL 16: Production ortamında localStorage yasak - kayıt disabled
        return newList;
      });
      setSecilenNobetler({});
      setExpandedNobetSaati({});
      setExpandedAlanId(null);
      setAddedDays([]);
      setMonthYear('');
      setTimeout(() => {
            // KURAL 16: Production ortamında localStorage yasak - işlem disabled
    console.log('Demo: Özel nöbet silindi');
      }, 100);
    } else {
      const gunlereGoreNobetler = secilenNobetBilgileri.reduce((acc, { saat, gun }) => {
        if (!acc[gun]) acc[gun] = [];
        acc[gun].push(`${saat}s`);
        return acc;
      }, {} as Record<string, string[]>);

      const nobetOzeti = Object.entries(gunlereGoreNobetler)
        .map(([gun, saatler]) => `${gun}: ${saatler.join(', ')}`)
        .join(' | ');

      const ozet = `${alan.name} - ${nobetOzeti}`;
      setKayitliGenelNobetler(prev => {
        const newList = [...prev, ozet];
        // KURAL 16: Production ortamında localStorage yasak - kayıt disabled
        return newList;
      });
      setOrtaAlanlar(prev => prev.filter(a => a.id !== alan.id));
      setSecilenNobetler({});
      setExpandedNobetSaati({});
      setExpandedAlanId(null);
      setTimeout(() => {
            // KURAL 16: Production ortamında localStorage yasak - işlem disabled
    console.log('Demo: Genel nöbet silindi');
      }, 100);
    }
  };

  const handleSil = (ozet: string, tip: 'ozel' | 'genel') => {
    if (tip === 'ozel') {
      setKayitliOzelNobetler(prev => {
        const updated = prev.filter(item => item !== ozet);
        // KURAL 16: Production ortamında localStorage yasak - kayıt disabled
        return updated;
      });
    } else {
      setKayitliGenelNobetler(prev => {
        const updated = prev.filter(item => item !== ozet);
        // KURAL 16: Production ortamında localStorage yasak - kayıt disabled
        return updated;
      });
      const alanAdi = ozet.split(' - ')[0];
      const ilgili = kalanAlanlar.find(a => a.name === alanAdi);
      if (ilgili) setPasifAlanlar(prev => prev.filter(id => id !== ilgili.id));
    }
  };

  const toggleNobetSaati = (alanId: number, saat: number) => {
    setExpandedNobetSaati(prev => ({
      ...prev,
      [alanId]: prev[alanId]?.includes(saat) 
        ? prev[alanId].filter(s => s !== saat)
        : [...(prev[alanId] || []), saat]
    }));
  };

  const toggleNobetGunSecimi = (alanId: number, saat: number, gun: string) => {
    const key = `${alanId}-${saat}-${gun}`;
    setSecilenNobetler(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const groupNobetlerByArea = (nobetler: string[]) => {
    const grouped: { 
      [key: string]: { 
        color: string; 
        saatler: { 
          saat: string; 
          gunler: string[] 
        }[] 
      } 
    } = {};
    
    nobetler.forEach(nobet => {
      const [alanAdi, detaylar] = nobet.split(' - ');
      const alan = kalanAlanlar.find(a => a.name === alanAdi);
      const gunParcalari = detaylar.split(' | ');
      
      if (!grouped[alanAdi]) {
        grouped[alanAdi] = {
          color: alan?.color || '#e5e7eb',
          saatler: []
        };
      }
      
      gunParcalari.forEach(gunParca => {
        const [gun, saatler] = gunParca.split(': ');
        if (!saatler) return;
        
        saatler.split(', ').forEach(saat => {
          const saatKey = (saat || '').trim();
          const existingSaat = grouped[alanAdi].saatler.find(s => s.saat === saatKey);
          
          if (existingSaat) {
            if (!existingSaat.gunler.includes(gun)) {
              existingSaat.gunler.push(gun);
            }
          } else {
            grouped[alanAdi].saatler.push({
              saat: saatKey,
              gunler: [gun]
            });
          }
        });
      });
    });
    
    return grouped;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-6 px-4 py-6 flex-1">
        <div className="w-60">
          <div className="bg-white rounded-2xl shadow-xl p-4 sticky top-[120px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Tanımlı Alanlar</h2>
            <div className="space-y-3">
              {kalanAlanlar.map((alan) => (
                <div 
                  key={alan.id} 
                  className={`bg-gray-50 rounded p-2 space-y-1 relative ${
                    !alanDurumlar[alan.id] ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: alan.color }} 
                      />
                      <span className="text-sm font-semibold">{alan.name}</span>
                    </div>
                    <button
                      onClick={() => toggleAlanDurum(alan.id)}
                      className={`p-1 rounded-full ${
                        alanDurumlar[alan.id] 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={alanDurumlar[alan.id] ? 'Aktif' : 'Pasif'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => alaniOrtayaTasi(alan)}
                    className="w-full bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={pasifAlanlar.includes(alan.id) || !alanDurumlar[alan.id]}
                  >
                    Alan Ortaya Taşı
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-96 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={handleDateChange} 
                className="border border-gray-300 rounded p-2 flex-1"
              />
              <button 
                onClick={handleAddDate} 
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg px-4 py-2"
              >
                Ekle
              </button>
            </div>

            {monthYear && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">{monthYear}</span>
                <button 
                  onClick={handleClearDays}
                  className="text-red-500 hover:text-red-700 p-1 rounded"
                  title="Tümünü Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {addedDays.map(({ day, dayOfWeek }, index) => (
                <div 
                  key={index} 
                  className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1 text-sm font-semibold"
                >
                  <div>{day}</div>
                  <div className="text-xs text-blue-600">{dayOfWeek}</div>
                </div>
              ))}
            </div>
          </div>

          {ortaAlanlar.map((alan) => (
            <div key={alan.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between"
                style={{ 
                  backgroundColor: alan.color,
                }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alan.nobetler && alan.nobetler.every(nobet => getFilteredGunler(nobet.gunler).every(gun => secilenNobetler[`${alan.id}-${nobet.saat}-${gun}`]))}
                    onChange={e => {
                      if (!alan.nobetler) return;
                      const newSelections = { ...secilenNobetler };
                      alan.nobetler.forEach(nobet => {
                        getFilteredGunler(nobet.gunler).forEach(gun => {
                          newSelections[`${alan.id}-${nobet.saat}-${gun}`] = e.target.checked;
                        });
                      });
                      setSecilenNobetler(newSelections);
                    }}
                    className="mr-2"
                  />
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <span className="font-semibold text-white">{alan.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alaniGeriGonder(alan)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
                    title="Geri Gönder"
                  >
                    <Undo2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleAlanAccordion(alan.id)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
                  >
                    {expandedAlanId === alan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleKaydet(alan)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
                    title="Kaydet"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedAlanId === alan.id && (
                <div className="p-4">
                  {alan.nobetler?.map((nobet) => (
                    <div key={nobet.saat} className="mb-4">
                      <button
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        onClick={() => toggleNobetSaati(alan.id, nobet.saat)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={getFilteredGunler(nobet.gunler).every(gun => secilenNobetler[`${alan.id}-${nobet.saat}-${gun}`])}
                            onChange={e => {
                              const newSelections = { ...secilenNobetler };
                              getFilteredGunler(nobet.gunler).forEach(gun => {
                                newSelections[`${alan.id}-${nobet.saat}-${gun}`] = e.target.checked;
                              });
                              setSecilenNobetler(newSelections);
                            }}
                            onClick={ev => ev.stopPropagation()}
                            className="mr-2"
                          />
                          <span className="font-medium">{nobet.saat} Saatlik Nöbet (1 Vardiya)</span>
                        </div>
                        {expandedNobetSaati[alan.id]?.includes(nobet.saat) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {expandedNobetSaati[alan.id]?.includes(nobet.saat) && (
                        <div className="mt-2 pl-4 space-y-2">
                          {nobet.gunler
                            .filter(gun => addedDays.length === 0 || addedDays.some(d => d.dayOfWeek === gun))
                            .map((gun) => {
                              const key = `${alan.id}-${nobet.saat}-${gun}`;
                              const matchingDay = addedDays.find(d => d.dayOfWeek === gun);
                              const isAnotherNobetSelected = Object.keys(secilenNobetler).some(k => {
                                if (!secilenNobetler[k]) return false;
                                const [aid, saat, g] = k.split('-');
                                return Number(aid) === alan.id && g === gun && Number(saat) !== nobet.saat;
                              });
                              return (
                                <label key={gun} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={secilenNobetler[key] || false}
                                    onChange={() => {
                                      if (!secilenNobetler[key] && isAnotherNobetSelected) return;
                                      toggleNobetGunSecimi(alan.id, nobet.saat, gun);
                                    }}
                                    disabled={isAnotherNobetSelected && !secilenNobetler[key]}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {gun}
                                    {matchingDay && (
                                      <span className="text-blue-600 ml-1">
                                        ({matchingDay.day})
                                      </span>
                                    )}
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tanımlı Özel Nöbetler</h2>
          {kayitliOzelNobetler.length === 0 ? (
            <div className="text-center text-gray-500">Henüz özel nöbet eklenmedi.</div>
          ) : (
            <div className="space-y-4">
              {kayitliOzelNobetler.map((nobet, index) => {
                const [alanAdi, detaylar] = nobet.split(' - ');
                const alan = kalanAlanlar.find(a => a.name === alanAdi);
                return (
                  <div
                    key={index}
                    className="border rounded-2xl overflow-hidden shadow-md"
                    style={{ borderColor: alan?.color || '#e5e7eb' }}
                  >
                    <div
                      className="flex justify-between items-center px-4 py-3"
                      style={{ backgroundColor: alan?.color, opacity: 0.95 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white" />
                        <span className="font-bold text-white text-base drop-shadow">{typeof alanAdi === 'object' ? ((alanAdi as any).ad || (alanAdi as any).id || JSON.stringify(alanAdi)) : alanAdi}</span>
                      </div>
                      <button
                        onClick={() => {
                          setKayitliOzelNobetler(prev => {
                            const updated = prev.filter(item => item !== nobet);
                            localStorage.setItem('kayitliOzelNobetler', JSON.stringify(updated));
                            if (updated.length === 0) localStorage.removeItem('kayitliOzelNobetler');
                            return updated;
                          });
                        }}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex flex-wrap gap-2">
                        {detaylar.split(' | ').map((parca, i) => {
                          const [gun, saatler] = parca.split(':');
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200">{typeof gun === 'object' ? ((gun as any).ad || (gun as any).id || JSON.stringify(gun)) : (gun || '').trim()} <span className="font-normal">{(saatler || '').trim()}</span></span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tanımlı Genel Nöbetler</h2>
          {kayitliGenelNobetler.length === 0 ? (
            <div className="text-center text-gray-500">Henüz genel nöbet eklenmedi.</div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupNobetlerByArea(kayitliGenelNobetler.filter(nobet => typeof nobet === 'string'))).map(([alanAdi, alan]) => {
                const isDisabled = pasifAlanlar.includes(kalanAlanlar.find(a => a.name === alanAdi)?.id || -1);
                return (
                  <div
                    key={alanAdi}
                    className={`rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${isDisabled ? 'opacity-50' : ''}`}
                    style={{ borderColor: alan.color, boxShadow: `0 4px 24px 0 ${alan.color}22` }}
                  >
                    <div
                      className="w-full px-6 py-3 flex items-center justify-between"
                      style={{
                        background: alan.color,
                        borderBottom: `2px solid ${alan.color}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-white border-2" style={{ borderColor: alan.color }} />
                        <span className="font-bold text-lg text-white drop-shadow">{typeof alanAdi === 'object' ? ((alanAdi as any).ad || (alanAdi as any).id || JSON.stringify(alanAdi)) : alanAdi}</span>
                      </div>
                      <button
                        className="ml-2 p-1 rounded hover:bg-opacity-80 transition-colors"
                        title="Sil"
                        onClick={() => {
                          setKayitliGenelNobetler(prev => {
                            const updated = prev.filter(item => !item.startsWith(alanAdi + ' - '));
                                    // KURAL 16: Production ortamında localStorage yasak - kayıt disabled
                            return updated;
                          });
                          const ilgili = kalanAlanlar.find(a => a.name === alanAdi);
                          if (ilgili) setPasifAlanlar(prev => prev.filter(id => id !== ilgili.id));
                        }}
                        style={{ background: alan.color }}
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100 bg-white">
                      {alan.saatler
                        .sort((a, b) => parseInt(a.saat) - parseInt(b.saat))
                        .map((saatGrup, index) => (
                          <div key={index} className="p-5 flex flex-col gap-2">
                            <span className="text-base font-bold text-black underline underline-offset-4 mb-1">
                              {saatGrup.saat} Saatlik Nöbetler
                            </span>
                            <div className="flex flex-wrap gap-2 pl-2">
                              {saatGrup.gunler.sort((a, b) => {
                                const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
                                return gunler.indexOf(a) - gunler.indexOf(b);
                              }).map((gun, i) => (
                                <span key={i} className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-xs font-semibold border border-gray-300 shadow-sm">{typeof gun === 'object' ? ((gun as any).ad || (gun as any).id || JSON.stringify(gun)) : gun}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}