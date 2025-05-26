/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
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
import { useDebounce } from "@/hooks/useDebounce";
import { authService, User } from "@/services/api/auth";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [confirmPopup, setConfirmPopup] = useState<{
    show: boolean;
    message: string;
    email: string;
    newRole: string;
  }>({ show: false, message: "", email: "", newRole: "" });
  const [currentUser, setCurrentUser] = useState<any>({});
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const router = useRouter();

  // Get auth data from localStorage only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      
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

  const fetchUsers = async (page: number, size: number, query = "") => {
    setIsDataLoading(true);
    try {
      const response = await authService.getUsersPaginated(page + 1, size, query);
      
      setUsers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalItems);
    } catch (err) {
      setError("Lỗi khi lấy danh sách người dùng");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch users when the user is admin
    if (currentUser.role !== "Admin" || isLoading) return;

    fetchUsers(pageIndex, pageSize, debouncedSearchQuery);
  }, [currentUser.role, isLoading, pageIndex, pageSize, debouncedSearchQuery]);

  const handleUpdateRole = async (email: string, newRole: string) => {
    try {
      await authService.updateUserRole(email, newRole);
      
      // Refresh users after update
      fetchUsers(pageIndex, pageSize, debouncedSearchQuery);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setPageIndex(0);
  };

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newPagination.pageIndex);
        setPageSize(newPagination.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    state: {
      pagination: {
        pageIndex,
        pageSize,
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

      {/* Ô nhập để tìm kiếm */}
      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm theo email hoặc mô tả..."
          value={searchQuery}
          onChange={handleSearchChange}
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
            {isDataLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
            disabled={!table.getCanPreviousPage() || isDataLoading}
          >
            Trang trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isDataLoading}
          >
            Trang sau
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span>
            Trang{" "}
            <strong>
              {pageIndex + 1} / {Math.max(1, totalPages)}
            </strong>{" "}
            ({totalItems} kết quả)
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            disabled={isDataLoading}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Chọn số hàng" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} hàng
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}