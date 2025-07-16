import { useState, useCallback } from 'react';

// Production ortamında localStorage yasak - KURAL 16
// Geçici in-memory state management
export function useTemporaryState<T>(initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const newValue = value instanceof Function ? value(state) : value;
    setState(newValue);
    
    // Production ortamında sadece in-memory - session boyunca geçerli
    console.warn('⚠️ useTemporaryState kullanılıyor - sayfa yenilenmede sıfırlanır');
  }, [state]);

  return [state, setValue];
}

export default useTemporaryState; 