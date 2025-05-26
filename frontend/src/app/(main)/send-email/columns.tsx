/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/send-email/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { Student } from "@/services/api/student";

export const columns: ColumnDef<Student>[] = [
  {
    id: "stt",
    header: "STT",
    cell: ({ row }) => row.index + 1,
    size: 50,
    enableSorting: false,
  },
  {
    accessorKey: "ten",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Họ và tên
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    size: 200,
  },
  {
    accessorKey: "mssv",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        MSSV
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    size: 120,
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
    size: 250,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const student = row.original;
      const handleDeleteStudent = (table.options.meta as any)?.handleDeleteStudent;
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteStudent(student.mssv)}
        >
          Xóa
        </Button>
      );
    },
    size: 80,
    enableSorting: false,
  },
];