import { useState } from 'react';

// Bölüm 3: Modal State Management
// 50 satır - KURAL 9 uyumlu

export const useModals = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const openLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const openRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const closeLogin = () => {
    setShowLogin(false);
  };

  const closeRegister = () => {
    setShowRegister(false);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const closeAllModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowPassword(false);
  };

  return {
    // State
    showLogin,
    showRegister,
    showPassword,
    
    // Actions
    openLogin,
    openRegister,
    closeLogin,
    closeRegister,
    togglePassword,
    closeAllModals,
    
    // Setters (backup)
    setShowLogin,
    setShowRegister,
    setShowPassword
  };
}; 