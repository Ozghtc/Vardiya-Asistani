import React, { createContext, useContext, useState } from 'react';

// Context tipi güncellendi
interface DepartmanBirimContextType {
  kurum_id: string;
  departman_id: string;
  birim_id: string;
  setDepartmanBirim: (value: Partial<Omit<DepartmanBirimContextType, 'setDepartmanBirim'>>) => void;
}

// Varsayılan değerler (örnek)
const DepartmanBirimContext = createContext<DepartmanBirimContextType>({
  kurum_id: '',
  departman_id: '',
  birim_id: '',
  setDepartmanBirim: () => {},
});

export const useDepartmanBirim = () => useContext(DepartmanBirimContext);

export const DepartmanBirimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    kurum_id: '',
    departman_id: '',
    birim_id: '',
  });
  const setDepartmanBirim = (value: Partial<Omit<DepartmanBirimContextType, 'setDepartmanBirim'>>) => {
    setState(prev => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, typeof val === 'object' && val !== null ? (val as any).id || '' : val])
      )
    }));
  };
  return (
    <DepartmanBirimContext.Provider value={{ ...state, setDepartmanBirim }}>
      {children}
    </DepartmanBirimContext.Provider>
  );
}; 