/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { setCookie } from 'cookies-next';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(credentials);
      if (data.user.role === 'Disable') {
        setError('Tài khoản của bạn đã bị vô hiệu hóa.');
        return;
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCookie('token', data.access_token, { maxAge: 60 * 60 });
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email HUST</label>
            <input
              type="email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="VD: hoang.nh215581@sis.hust.edu.vn"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}