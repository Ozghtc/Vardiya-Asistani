import { useState, ChangeEvent } from 'react';

interface UseCapitalizationOptions {
  exceptions?: ('email' | 'tc' | 'phone')[];
}

export function useCapitalization(
  initialValue: string = '', 
  options: UseCapitalizationOptions = {}
): [string, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useState(initialValue || ''); // Güvenli initial value

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value || ''; // Güvenli input value
    const inputType = e.target.type || '';
    const inputName = e.target.name || '';
    
    // İstisnalar kontrolü
    const isException = 
      options.exceptions?.includes('email') && (inputType === 'email' || inputName === 'email') ||
      options.exceptions?.includes('tc') && (inputName === 'tcno' || inputName === 'tc') ||
      options.exceptions?.includes('phone') && (inputType === 'tel' || inputName === 'phone');
    
    if (isException) {
      setValue(inputValue);
    } else {
      // Türkçe karakterler için büyük harf dönüşümü - güvenli
      setValue((inputValue || '').toLocaleUpperCase('tr-TR'));
    }
  };

  return [value, handleChange];
}

// Basit kullanım için yardımcı fonksiyon - güvenli string işleme
export function safeStringOperation(str: any, operation: 'trim' | 'toUpperCase' | 'toLowerCase' = 'trim'): string {
  if (typeof str !== 'string') {
    return '';
  }
  
  try {
    switch (operation) {
      case 'trim':
        return str.trim();
      case 'toUpperCase':
        return str.toLocaleUpperCase('tr-TR');
      case 'toLowerCase':
        return str.toLowerCase();
      default:
        return str;
    }
  } catch (error) {
    console.warn('String operation failed:', error);
    return '';
  }
}