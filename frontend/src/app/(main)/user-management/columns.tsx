/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/users/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { User } from "@/services/api/auth";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="w-[30px] text-center">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorFn: (row) => row.role.name,
    id: "role.name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Create Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("createdDate")).toLocaleString(),
  },
  {
    accessorKey: "latestData",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Latest Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.getValue("latestData")
        ? new Date(row.getValue("latestData")).toLocaleString()
        : "Chưa đăng nhập lại",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original;
      const currentEmail = (table.options.meta as any)?.currentEmail;

      if (user.email === currentEmail) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const showConfirmPopup = (table.options.meta as any)?.showConfirmPopup;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="max-w-8 flex h-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {user.role.name === "HUST" && (
              <DropdownMenuItem
                onClick={() =>
                  showConfirmPopup(
                    user.email,
                    "Admin",
                    `Bạn muốn cấp quyền Admin cho ${user.email}?`
                  )
                }
              >
                Cấp quyền Admin
              </DropdownMenuItem>
            )}
            {user.role.name === "Admin" && (
              <DropdownMenuItem
                onClick={() =>
                  showConfirmPopup(
                    user.email,
                    "HUST",
                    `Bạn muốn gỡ quyền Admin của ${user.email}?`
                  )
                }
              >
                Gỡ quyền Admin
              </DropdownMenuItem>
            )}
            {user.role.name === "Disable" ? (
              <DropdownMenuItem
                className="text-green-600"
                onClick={() =>
                  showConfirmPopup(
                    user.email,
                    "HUST",
                    `Bạn muốn mở khóa tài khoản ${user.email}?`
                  )
                }
              >
                Mở khóa
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() =>
                  showConfirmPopup(
                    user.email,
                    "Disable",
                    `Bạn muốn khóa tài khoản ${user.email}?`
                  )
                }
              >
                Khóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
