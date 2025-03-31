// src/app/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RolesPage() {
  // Định nghĩa interface Role khớp với dữ liệu từ backend
  interface Role {
    id: number;
    name: string;
    description: string;
  }

  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (currentUser.role !== 'Admin') {
      router.push('/');
      return;
    }

    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/auth/roles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(response.data as Role[]);
      } catch (err) {
        setError('Lỗi khi lấy danh sách quyền');
      }
    };
    fetchRoles();
  }, [token, currentUser.role, router]);

  if (currentUser.role !== 'Admin') return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý Quyền Truy Cập</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <table className="w-full bg-blue-100 border">
        <thead>
          <tr className="bg-blue-200">
            <th className="border p-2 w-1/24">ID</th>
            <th className="border p-2 w-1/8">Tên Quyền</th>
            <th className="border p-2">Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className=" bg-white">
              <td className="border p-2 w-1/24">{role.id}</td>
              <td className="border p-2 w-1/8">{role.name}</td>
              <td className="border p-2">{role.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}