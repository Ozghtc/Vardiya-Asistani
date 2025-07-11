import { useState, ChangeEvent } from 'react';

interface UseCapitalizationOptions {
  exceptions?: ('email' | 'tc' | 'phone')[];
}

export function useCapitalization(
  initialValue: string = '', 
  options: UseCapitalizationOptions = {}
): [string, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const inputType = e.target.type;
    const inputName = e.target.name;
    
    // İstisnalar kontrolü
    const isException = 
      options.exceptions?.includes('email') && (inputType === 'email' || inputName === 'email') ||
      options.exceptions?.includes('tc') && (inputName === 'tcno' || inputName === 'tc') ||
      options.exceptions?.includes('phone') && (inputType === 'tel' || inputName === 'phone');
    
    if (isException) {
      setValue(inputValue);
    } else {
      // Türkçe karakterler için büyük harf dönüşümü
      setValue(inputValue.toLocaleUpperCase('tr-TR'));
    }
  };

  return [value, handleChange];
}

// Basit kullanım için yardımcı fonksiyon
export function useCapitalizationWithExceptions(initialValue: string = ''): [string, (e: ChangeEvent<HTMLInputElement>) => void] {
  return useCapitalization(initialValue, { exceptions: ['email', 'tc', 'phone'] });
}