import React, { useState, useCallback } from 'react';
import Toast, { ToastProps } from './Toast';

export interface ToastItem extends Omit<ToastProps, 'id' | 'onClose'> {
  id: string;
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export const ToastContext = React.createContext<{
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}>({
  showToast: () => {},
});

export const ToastProvider: React.FC<ToastContainerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${toasts.length + 1}`; // KURAL 18: Date.now() ve Math.random() kaldırıldı
    const newToast: ToastItem = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 max-w-sm w-full pointer-events-none">
        <div className="space-y-2 pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 