/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
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

interface EmailTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
}

export default function EmailTemplatePage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({ name: "", title: "", body: "" });
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get<EmailTemplate[]>(
          "http://localhost:3001/email-templates",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTemplates(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách template:", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setFormData({ name: "", title: "", body: "" });
    setIsPopupOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      body: template.body,
    });
    setIsPopupOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, body: content }));
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.title || !formData.body) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      if (currentTemplate) {
        const response = await axios.put(
          `http://localhost:3001/email-templates/${currentTemplate.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === currentTemplate.id
              ? (response.data as EmailTemplate)
              : template
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:3001/email-templates",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTemplates((prev) => [...prev, response.data as EmailTemplate]);
      }
      setIsPopupOpen(false);
    } catch (error: any) {
      console.error("Lỗi khi lưu template:", error);
      alert(error.response?.data?.message || "Không thể lưu template.");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa template này?")) {
      try {
        await axios.delete(`http://localhost:3001/email-templates/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTemplates((prev) => prev.filter((template) => template.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa template:", error);
        alert("Không thể xóa template.");
      }
    }
  };

  const table = useReactTable({
    data: templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    columnResizeMode: "onChange",
    meta: {
      handleEditTemplate,
      handleDeleteTemplate,
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Email Template</h1>

      <div className="flex justify-between mb-4">
        <Button onClick={handleCreateTemplate}>Tạo template mới</Button>
        <Input
          placeholder="Tìm kiếm theo tên, tiêu đề, hoặc nội dung..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="align-top" // Đảm bảo nội dung căn lên trên
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

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {currentTemplate ? "Chỉnh sửa template" : "Tạo template mới"}
            </h2>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Tên template</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Nhập tên template"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Tiêu đề email</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Nhập tiêu đề email (VD: Xin chào {ten})"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Nội dung email</label>
              <p className="text-sm text-gray-900 mt-1">
                Sử dụng {`{ten}`}, {`{mssv}`}, {`{email}`} để chèn thông tin sinh viên.
              </p>
              <Editor
                apiKey="5hpduv8dw5cs809fj9cgji7pofo1uq3bxhtdvaa6tl9jyyns"
                value={formData.body}
                onEditorChange={handleEditorChange}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={() => setIsPopupOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveTemplate}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}