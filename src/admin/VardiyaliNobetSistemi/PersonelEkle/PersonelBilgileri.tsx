import React, { useState, useEffect } from 'react';
import { useCapitalization } from '../../../hooks/useCapitalization';

interface FormData {
  name: string;
  surname: string;
  title: string;
  tcno: string;
  email: string;
}

interface Props {
  data: FormData;
  onChange: (data: FormData) => void;
}

export default function PersonelBilgileri({ data, onChange }: Props) {
  const [name, handleNameChange] = useCapitalization(data.name);
  const [surname, handleSurnameChange] = useCapitalization(data.surname);
  const [tcno, handleTcnoChange] = useCapitalization(data.tcno);
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    const savedTitles = localStorage.getItem('unvanlar');
    if (savedTitles) {
      setTitles(JSON.parse(savedTitles));
    }
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    let updatedData = { ...data, [field]: value };

    if (field === 'name') {
      handleNameChange({ target: { value } } as any);
      updatedData.name = value.toUpperCase();
    }
    if (field === 'surname') {
      handleSurnameChange({ target: { value } } as any);
      updatedData.surname = value.toUpperCase();
    }
    if (field === 'tcno') {
      handleTcnoChange({ target: { value } } as any);
      updatedData.tcno = value;
    }
    
    onChange(updatedData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-4 pl-6 pr-4 w-1/3">
                <label className="block text-sm font-medium text-gray-700">
                  TC Kimlik No <span className="text-red-500">*</span>
                </label>
              </td>
              <td className="py-4 pr-6">
                <input
                  type="text"
                  value={data.tcno}
                  onChange={(e) => handleChange('tcno', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="TC KİMLİK NO"
                  maxLength={11}
                  required
                />
              </td>
            </tr>

            <tr>
              <td className="py-4 pl-6 pr-4">
                <label className="block text-sm font-medium text-gray-700">
                  Ad <span className="text-red-500">*</span>
                </label>
              </td>
              <td className="py-4 pr-6">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="AD"
                  required
                />
              </td>
            </tr>

            <tr>
              <td className="py-4 pl-6 pr-4">
                <label className="block text-sm font-medium text-gray-700">
                  Soyad <span className="text-red-500">*</span>
                </label>
              </td>
              <td className="py-4 pr-6">
                <input
                  type="text"
                  value={data.surname}
                  onChange={(e) => handleChange('surname', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="SOYAD"
                  required
                />
              </td>
            </tr>

            <tr>
              <td className="py-4 pl-6 pr-4">
                <label className="block text-sm font-medium text-gray-700">
                  Ünvan <span className="text-red-500">*</span>
                </label>
              </td>
              <td className="py-4 pr-6">
                <select
                  value={data.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                >
                  <option value="">Seçiniz</option>
                  {titles.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td className="py-4 pl-6 pr-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
              </td>
              <td className="py-4 pr-6">
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="ornek@email.com"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}