import { useState, useCallback } from 'react';

// Production ortamında localStorage/sessionStorage yasak - KURAL 16
// In-memory state management - sayfa yenilenmede sıfırlanır
export function useTemporaryState<T>(initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const newValue = value instanceof Function ? value(state) : value;
    setState(newValue);
  }, [state]);

  return [state, setValue];
}

export default useTemporaryState; 