/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { columns } from "./columns";

interface User {
  id: number;
  email: string;
  role: { name: string };
  createdDate: string;
  latestData: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [confirmPopup, setConfirmPopup] = useState<{
    show: boolean;
    message: string;
    email: string;
    newRole: string;
  }>({ show: false, message: "", email: "", newRole: "" });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Get auth data from localStorage only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      
      setToken(storedToken);
      setCurrentUser(storedUser);
      setCurrentEmail(storedUser.email || "");
      
      // Redirect if not admin
      if (storedUser.role !== "Admin") {
        router.push("/");
        return;
      }
      
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Only fetch users when we have token and the user is admin
    if (!token || currentUser.role !== "Admin" || isLoading) return;

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data as User[]);
      } catch (err) {
        setError("Lỗi khi lấy danh sách người dùng");
      }
    };
    fetchUsers();
  }, [token, currentUser.role, isLoading]);

  const handleUpdateRole = async (email: string, newRole: string) => {
    try {
      await axios.put(
        `http://localhost:3001/auth/users/${email}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((u) =>
          u.email === email ? { ...u, role: { name: newRole } } : u
        )
      );
    } catch (err) {
      setError("Lỗi khi cập nhật role");
    }
  };

  const showConfirmPopup = (email: string, newRole: string, message: string) => {
    setConfirmPopup({ show: true, message, email, newRole });
  };

  const confirmAction = async () => {
    const { email, newRole } = confirmPopup;
    await handleUpdateRole(email, newRole);
    setConfirmPopup({ show: false, message: "", email: "", newRole: "" });
  };

  const cancelAction = () => {
    setConfirmPopup({ show: false, message: "", email: "", newRole: "" });
  };

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    meta: {
      currentEmail,
      showConfirmPopup,
    },
  });

  // Show loading or nothing if still checking authentication
  if (isLoading) return null;
  
  // If we've checked and not Admin, return nothing
  if (currentUser.role !== "Admin") return null;

  return (
    <div className="p-6">
      {confirmPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Xác nhận</h2>
            <p>{confirmPopup.message}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelAction}>
                Hủy
              </Button>
              <Button onClick={confirmAction}>Xác nhận</Button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Quản lý Người dùng</h1>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>
      )}

      {/* Ô nhập để lọc theo email */}
      <div className="mb-4">
        <Input
          placeholder="Lọc theo email..."
          value={
            (table.getColumn("email")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Giao diện phân trang */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trang trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Trang sau
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span>
            Trang{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Chọn số hàng" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} hàng
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}