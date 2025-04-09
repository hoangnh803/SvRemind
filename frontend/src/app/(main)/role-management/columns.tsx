// src/app/roles/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface Role {
  id: number;
  name: string;
  description: string;
}

export const columns: ColumnDef<Role>[] = [
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
    size: 80, // Chiều rộng nhỏ cho ID
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tên Quyền
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    size: 150, // Chiều rộng vừa cho Tên Quyền
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Mô tả
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    size: 400, // Chiều rộng lớn hơn cho Mô tả
  },
];