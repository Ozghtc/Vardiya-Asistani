import React from 'react';
import { SuccessNotification } from '../../../../components/ui/Notification';
import { useVardiyaOperations } from './hooks/useVardiyaOperations';
import HizliVardiyaEkleme from './components/HizliVardiyaEkleme';
import ManuelVardiyaFormu from './components/ManuelVardiyaFormu';
import TanimliVardiyaListesi from './components/TanimliVardiyaListesi';

const VardiyaTanimlama: React.FC = () => {
  const {
    // State
    shifts,
    loading,
    error,
    showSuccess,
    name,
    startHour,
    endHour,
    
    // Form handlers
    handleNameChange,
    setStartHour,
    setEndHour,
    
    // Actions
    handleSubmit,
    handleDelete,
    handleQuickAdd,
    setShowSuccess
  } = useVardiyaOperations();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Yükleniyor, lütfen bekleyin...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Hızlı Vardiya Ekleme */}
        <HizliVardiyaEkleme
          shifts={shifts}
          onQuickAdd={handleQuickAdd}
          loading={loading}
        />

        {/* Manuel Vardiya Ekleme */}
        <ManuelVardiyaFormu
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          name={name}
          handleNameChange={handleNameChange}
          startHour={startHour}
          setStartHour={setStartHour}
          endHour={endHour}
          setEndHour={setEndHour}
        />
      </div>

      {/* Tanımlı Vardiyalar */}
      <TanimliVardiyaListesi 
        shifts={shifts} 
        onDelete={handleDelete} 
      />
      
      {showSuccess && (
        <SuccessNotification
          message="Vardiya başarıyla eklendi!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default VardiyaTanimlama; 