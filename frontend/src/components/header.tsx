'use client';

import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('My Name');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserEmail(JSON.parse(user).email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    deleteCookie('token');
    router.push('/login');
  };

  return (
    <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">My Website</div>
      <div className="flex items-center space-x-4">
        <span>{userEmail}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}