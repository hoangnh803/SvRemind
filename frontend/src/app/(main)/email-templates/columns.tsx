/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/email-templates/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmailTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
}

export const columns: ColumnDef<EmailTemplate>[] = [
  {
    accessorKey: "name",
    size: 150,

    header: ({ column }) => (
      <Button
        className="!p-0"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tên template
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="w-[150px] truncate">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        className="!p-0"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tiêu đề email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="w-[150px] truncate">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "body",
    header: "Nội dung email",
    cell: ({ row }) => {
      const body: string = row.getValue("body");
      // Tạo một phần tử tạm để chuyển HTML thành văn bản thô
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = body;
      const plainText = tempDiv.textContent?.replace(/\s+/g, " ").trim() || "";
      return (
        <div
          className="max-w-[700px] truncate"
          title={plainText} // Hiển thị văn bản thô khi hover
        >
          {plainText}
        </div>
      );
    },
    size: 400,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const template = row.original;
      const handleEditTemplate = (table.options.meta as any)
        ?.handleEditTemplate;
      const handleDeleteTemplate = (table.options.meta as any)
        ?.handleDeleteTemplate;

      return (
        // <div className="flex space-x-2">
        //   <Button
        //     variant="outline"
        //     size="sm"
        //     onClick={() => handleEditTemplate(template)}
        //   >
        //     Chỉnh sửa
        //   </Button>
        //   <Button
        //     variant="destructive"
        //     size="sm"
        //     onClick={() => handleDeleteTemplate(template.id)}
        //   >
        //     Xóa
        //   </Button>
        // </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="max-w-8">
              <Button
                variant="ghost"
                className="max-w-8 flex h-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreHorizontal />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteTemplate(template.id)}
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
