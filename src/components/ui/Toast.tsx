import React, { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Info, CheckCircle, XCircle, AlertCircle, InfoIcon } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 4000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Giriş animasyonu
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    // Progress bar animasyonu
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);
    
    // Otomatik kapanma
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
      clearInterval(progressTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 350);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-white" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-white" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-white" />;
      case 'info':
        return <InfoIcon className="w-6 h-6 text-white" />;
      default:
        return <CheckCircle className="w-6 h-6 text-white" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'bg-gradient-to-r from-green-500 via-green-600 to-green-700',
          shadow: 'shadow-lg shadow-green-500/25',
          progressBar: 'bg-green-300'
        };
      case 'error':
        return {
          gradient: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700',
          shadow: 'shadow-lg shadow-red-500/25',
          progressBar: 'bg-red-300'
        };
      case 'warning':
        return {
          gradient: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700',
          shadow: 'shadow-lg shadow-amber-500/25',
          progressBar: 'bg-amber-300'
        };
      case 'info':
        return {
          gradient: 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700',
          shadow: 'shadow-lg shadow-blue-500/25',
          progressBar: 'bg-blue-300'
        };
      default:
        return {
          gradient: 'bg-gradient-to-r from-green-500 via-green-600 to-green-700',
          shadow: 'shadow-lg shadow-green-500/25',
          progressBar: 'bg-green-300'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        relative max-w-sm w-full mb-3
        transform transition-all duration-350 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        relative overflow-hidden rounded-xl border border-white/20
        ${styles.gradient} ${styles.shadow}
        backdrop-blur-sm
      `}>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
          <div 
            className={`h-full ${styles.progressBar} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-tight">
                {title}
              </h4>
              {message && (
                <p className="mt-1 text-sm text-white/90 leading-relaxed">
                  {message}
                </p>
              )}
            </div>
            
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-2 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 group"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast; 