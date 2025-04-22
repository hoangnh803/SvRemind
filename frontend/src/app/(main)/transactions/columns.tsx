/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";

interface Transaction {
  id: number;
  sender: string;
  receivers: string;
  emailTemplateId: number;
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

export const columns: ColumnDef<Transaction>[] = [
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
    cell: ({ row }) => (
      <div className="w-[150px] truncate">
        {row.original.title}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "body",
    header: "Nội dung email",
    cell: ({ row }) => {
      const body: string = row.getValue("body");
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = body;
      const plainText = tempDiv.textContent?.replace(/\s+/g, " ").trim() || "";
      return (
        <div className="max-w-[350px] truncate" title={plainText}>
          {plainText}
        </div>
      );
    },
    size: 350,
    enableSorting: false,
  },
  {
    accessorKey: "sendDate",
    header: ({ column }) => (
      <Button
        className="!p-0"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ngày gửi
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const sendDate = row.getValue("sendDate");
      return (
        <div className="w-[150px]">
          {sendDate
            ? new Date(sendDate as string).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })
            : "Chưa gửi"}
        </div>
      );
    },
    size: 150,
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row, table }) => {
      const handleDelete = (table.options.meta as any)?.handleDeleteTransaction;
      return (
        <Button
          className="!p-0 cursor-pointer"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click navigation
            handleDelete(row.original.id);
          }}
          title="Xóa transaction"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      );
    },
    size: 80,
  },
];