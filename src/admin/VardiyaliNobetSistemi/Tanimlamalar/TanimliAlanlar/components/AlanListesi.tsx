import React from 'react';
import { AlanListesiProps } from '../types/TanimliAlanlar.types';
import AlanKarti from './AlanKarti';
import EmptyState from './EmptyState';

const AlanListesi: React.FC<AlanListesiProps> = ({
  alanlar,
  loading,
  expandedAlan,
  onToggleExpand,
  onOpenDetayModal,
  onHandleDelete,
  getActiveDays
}) => {
  if (alanlar.length === 0) {
    return (
      <EmptyState 
        onNavigateToDefinitions={() => window.location.href = '/tanimlamalar'} 
      />
    );
  }

  return (
    <div className="space-y-4">
      {alanlar.map((alan) => (
        <AlanKarti
          key={alan.id}
          alan={alan}
          isExpanded={expandedAlan === alan.id}
          loading={loading}
          onToggleExpand={onToggleExpand}
          onOpenDetayModal={onOpenDetayModal}
          onHandleDelete={onHandleDelete}
          getActiveDays={getActiveDays}
        />
      ))}
    </div>
  );
};

export default AlanListesi; 