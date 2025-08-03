import { useState } from 'react';
import { Toast, ToastOperations } from '../types/UnvanTanimlama.types';

export const useToast = (): ToastOperations => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showSuccessToast = (message: string) => {
    const id = Date.now(); // Unique ID for toast
    const newToast: Toast = { id, message, type: 'success' };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const showErrorToast = (message: string) => {
    const id = Date.now(); // Unique ID for toast
    const newToast: Toast = { id, message, type: 'error' };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    showSuccessToast,
    showErrorToast,
    removeToast
  };
}; 