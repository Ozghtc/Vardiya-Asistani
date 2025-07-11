import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  hasLoginPage: boolean;
}

export default function GirisBilgileri() {
  const [data, setData] = useState<FormData>({
    email: '',
    password: '',
    hasLoginPage: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td colSpan={2} className="p-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.hasLoginPage}
                    onChange={e => handleChange('hasLoginPage', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Kullanıcı Sayfası Açılsın mı?
                  </span>
                </label>
              </td>
            </tr>

            {data.hasLoginPage && (
              <>
                <tr>
                  <td className="py-4 pl-6 pr-4 w-1/3">
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="py-4 pr-6">
                    <input
                      type="email"
                      value={data.email}
                      onChange={e => handleChange('email', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      placeholder="ornek@email.com"
                      required
                    />
                  </td>
                </tr>

                <tr>
                  <td className="py-4 pl-6 pr-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Şifre <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="py-4 pr-6">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={data.password}
                        onChange={e => handleChange('password', e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}