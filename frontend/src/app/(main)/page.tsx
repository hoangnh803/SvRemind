'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      try {
        const parsedUser = JSON.parse(user);
        setUserEmail(parsedUser.email);
      } catch (error) {
        console.error('Error parsing user:', error);
        setUserEmail(null);
      }
    }
  }, []);

  return (
    <div>
      {userEmail ? (
        <h1 className="text-3xl font-bold mb-4">Chào mừng {userEmail} đến Dashboard!</h1>
      ) : (
        <h1 className="text-3xl font-bold">Vui lòng đăng nhập để tiếp tục</h1>
      )}
    </div>
  );
}