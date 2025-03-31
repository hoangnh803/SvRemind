// src/app/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function UsersPage() {
  // Định nghĩa interface User khớp với dữ liệu từ backend
  interface User {
    id: number;
    email: string;
    role: { name: string };
    createdDate: string;
    latestData: string | null;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [confirmPopup, setConfirmPopup] = useState<{
    show: boolean;
    message: string;
    email: string;
    newRole: string;
  }>({ show: false, message: '', email: '', newRole: '' });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | 'role.name';
    direction: 'asc' | 'desc';
  }>({ key: 'id', direction: 'asc' }); // Mặc định sắp xếp theo id tăng dần

  const router = useRouter();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentEmail = currentUser.email;

  useEffect(() => {
    if (currentUser.role !== 'Admin') {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data as User[]);
      } catch (err) {
        setError('Lỗi khi lấy danh sách người dùng');
      }
    };
    fetchUsers();
  }, [token, currentUser.role, router]);

  // Hàm sắp xếp
  const sortUsers = (key: keyof User | 'role.name') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...users].sort((a, b) => {
      let aValue: any, bValue: any;
      if (key === 'role.name') {
        aValue = a.role.name;
        bValue = b.role.name;
      } else {
        aValue = a[key];
        bValue = b[key];
      }

      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setUsers(sortedUsers);
  };

  const handleUpdateRole = async (email: string, newRole: string) => {
    try {
      await axios.put(
        `http://localhost:3001/auth/users/${email}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUsers(
        users.map((u) =>
          u.email === email ? { ...u, role: { name: newRole } } : u,
        ),
      );
    } catch (err) {
      setError('Lỗi khi cập nhật role');
    }
  };

  const showConfirmPopup = (email: string, newRole: string, message: string) => {
    setConfirmPopup({ show: true, message, email, newRole });
  };

  const confirmAction = async () => {
    const { email, newRole } = confirmPopup;
    await handleUpdateRole(email, newRole);
    setConfirmPopup({ show: false, message: '', email: '', newRole: '' });
  };

  const cancelAction = () => {
    setConfirmPopup({ show: false, message: '', email: '', newRole: '' });
  };

  if (currentUser.role !== 'Admin') return null;

  return (
    <div>
      {/* Popup xác nhận */}
      {confirmPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Xác nhận</h2>
            <p>{confirmPopup.message}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Quản lý Người dùng</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <table className="w-full bg-blue-100 border">
        <thead>
          <tr className="bg-blue-200">
            <th className="border p-2 cursor-pointer" onClick={() => sortUsers('id')}>
              ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => sortUsers('email')}>
              Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => sortUsers('role.name')}>
              Role {sortConfig.key === 'role.name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => sortUsers('createdDate')}>
              Create Date{' '}
              {sortConfig.key === 'createdDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => sortUsers('latestData')}>
              Latest Date{' '}
              {sortConfig.key === 'latestData' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email} className="border bg-white">
              <td className="border p-2">{user.id}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role.name}</td>
              <td className="border p-2">{new Date(user.createdDate).toLocaleString()}</td>
              <td className="border p-2">
                {user.latestData ? new Date(user.latestData).toLocaleString() : 'Chưa đăng nhập lại'}
              </td>
              <td className="p-2 flex space-x-2">
                {user.email !== currentEmail && (
                  <>
                    {user.role.name === 'HUST' && (
                      <button
                        onClick={() =>
                          showConfirmPopup(
                            user.email,
                            'Admin',
                            `Bạn muốn cấp quyền Admin cho ${user.email}?`,
                          )
                        }
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Cấp quyền Admin
                      </button>
                    )}
                    {user.role.name === 'Admin' && (
                      <button
                        onClick={() =>
                          showConfirmPopup(
                            user.email,
                            'HUST',
                            `Bạn muốn gỡ quyền Admin của ${user.email}?`,
                          )
                        }
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Gỡ quyền Admin
                      </button>
                    )}
                    {user.role.name === 'Disable' ? (
                      <button
                        onClick={() =>
                          showConfirmPopup(
                            user.email,
                            'HUST',
                            `Bạn muốn mở khóa tài khoản ${user.email}?`,
                          )
                        }
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Mở khóa
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          showConfirmPopup(
                            user.email,
                            'Disable',
                            `Bạn muốn khóa tài khoản ${user.email}?`,
                          )
                        }
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Khóa
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}