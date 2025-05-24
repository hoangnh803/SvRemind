/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "@/hooks/useDebounce";

interface Transaction {
  id: number;
  sender: string;
  receivers: string;
  emailTemplateId: number | null;
  title: string;
  body: string;
  plantDate: string | null;
  sendDate: string | null;
  createdBy: string;
  emailTemplate: {
    id: number;
    name: string;
    title: string;
    body: string;
  };
}

interface PaginatedTransactionsResponse {
  data: Transaction[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Get token from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const fetchTransactions = async (page: number, size: number, query = "") => {
    if (!token) return; // Don't fetch if token isn't loaded yet
    
    setIsLoading(true);
    try {
      const response = await axios.get<PaginatedTransactionsResponse>(
        `http://localhost:3001/transactions/paginated?page=${page + 1}&limit=${size}${
          query ? `&search=${encodeURIComponent(query)}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setTransactions(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setTotalItems(response.data.meta.totalItems);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách transaction:", error);
      toast.error("Không thể tải danh sách transaction");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return; // Don't fetch if token isn't loaded yet

    fetchTransactions(pageIndex, pageSize, debouncedSearchQuery);
  }, [token, pageIndex, pageSize, debouncedSearchQuery]);

  const handleDeleteTransaction = async (id: number) => {
    if (!token) return;
    if (!confirm("Bạn có chắc chắn muốn xóa transaction này?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Refresh transactions after delete
      fetchTransactions(pageIndex, pageSize, debouncedSearchQuery);
      toast.success("Transaction đã được xóa thành công");
    } catch (error: any) {
      console.error("Lỗi khi xóa transaction:", error);
      toast.error(error.response?.data?.message || "Không thể xóa transaction");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setPageIndex(0);
  };

  const table = useReactTable({
    data: transactions,
    columns: columns as any,
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
      handleDeleteTransaction,
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Email Đã Gửi</h1>

      <div className="flex justify-end mb-4">
        <Input
          placeholder="Tìm kiếm theo tiêu đề, nội dung, người gửi hoặc người nhận..."
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
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                  >
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => router.push(`/transactions/${row.original.id}`)}
                  className="cursor-pointer hover:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="align-top"
                    >
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

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Trang trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
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
            disabled={isLoading}
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

      <ToastContainer />
    </div>
  );
}