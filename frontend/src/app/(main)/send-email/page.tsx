/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Student {
  mssv: string;
  ten: string;
  email: string;
  lop: string;
  quanly: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
}

export default function SendEmailPage() {
  const [recipients, setRecipients] = useState<Student[]>([]);
  const [recentlyAddedStudents, setRecentlyAddedStudents] = useState<Student[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [inputMethod, setInputMethod] = useState<"camera" | "scanner" | "manual">("camera");
  const [isProcessing, setIsProcessing] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({ name: "", title: "", body: "" });
  const [globalFilter, setGlobalFilter] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processedMssvSet = useRef<Set<string>>(new Set());

  const fetchTemplates = async () => {
    try {
      const response = await axios.get<EmailTemplate[]>(
        "http://localhost:3001/email-templates",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTemplates(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách template:", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);
  

  const startQrScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
        },
        false
      );
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
      return scanner;
    } catch (err) {
      toast.error("Không thể truy cập camera. Hãy cấp quyền cho ứng dụng.");
      setIsScanning(false);
    }
  };

  const onScanSuccess = (decodedText: string) => {
    fetchStudentData(decodedText, true);
  };

  const onScanFailure = (error: any) => {
    console.warn(`Lỗi quét mã QR: ${error}`);
  };

  const fetchStudentData = async (url: string, isQrScan: boolean = false): Promise<Student | null> => {
    if (isProcessing) return null;
    setIsProcessing(true);

    try {
      const apiUrl = `http://localhost:3001/proxy/student?barcode=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      const studentData: Student = response.data as Student;

      if (processedMssvSet.current.has(studentData.mssv)) {
        toast.info(`Sinh viên ${studentData.ten} đã có trong danh sách.`);
        return null;
      }

      processedMssvSet.current.add(studentData.mssv);
      setRecipients((prev) => [...prev, studentData]); // Add to recipients
      if (isQrScan) {
        setRecentlyAddedStudents([studentData]);
        setCurrentSlide(0);
        scannerRef.current?.pause();
        setTimeout(() => scannerRef.current?.resume(), 1000);
      }
      toast.success(`Đã thêm: ${studentData.ten} - ${studentData.mssv}`);
      return studentData;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sinh viên:", error);
      toast.error("Không thể lấy thông tin sinh viên từ URL này.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAdd = async () => {
    if (!manualUrl.trim()) {
      toast.warn("Vui lòng nhập ít nhất một URL barcode.");
      return;
    }

    const urls = manualUrl.split("\n").map((url) => url.trim()).filter((url) => url);
    if (urls.length === 0) {
      toast.warn("Không có URL hợp lệ để xử lý.");
      return;
    }

    const newStudents: Student[] = [];
    for (const url of urls) {
      const student = await fetchStudentData(url);
      if (student) {
        newStudents.push(student);
      }
    }

    if (newStudents.length > 0) {
      setRecentlyAddedStudents(newStudents);
      setCurrentSlide(0);
      setManualUrl("");
    } else {
      toast.info("Không thêm được sinh viên nào do trùng lặp hoặc lỗi.");
    }
  };

  const handleDeleteStudent = (mssv: string) => {
    setRecipients((prev) => prev.filter((student) => student.mssv !== mssv));
    setRecentlyAddedStudents((prev) => prev.filter((student) => student.mssv !== mssv));
    processedMssvSet.current.delete(mssv);
    toast.success("Đã xóa sinh viên khỏi danh sách.");
  };

  useEffect(() => {
    if (isScanning && inputMethod === "camera") {
      const scanner = startQrScanner();
      return () => {
        scanner.then((resolvedScanner) => resolvedScanner?.clear());
        scannerRef.current = null;
      };
    }
  }, [isScanning, inputMethod]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find((t) => String(t.id) === templateId);
      if (template) {
        setEmailForm({
          name: template.name,
          title: template.title,
          body: template.body,
        });
      }
    } else {
      setEmailForm({ name: "", title: "", body: "" });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setEmailForm((prev) => ({ ...prev, body: content }));
  };

  const handleSaveTemplate = async () => {
    if (!emailForm.name || !emailForm.title || !emailForm.body) {
      toast.warn("Vui lòng điền đầy đủ tên template, tiêu đề và nội dung email.");
      return;
    }

    try {
      if (selectedTemplate) {
        await axios.put(
          `http://localhost:3001/email-templates/${selectedTemplate}`,
          emailForm,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        toast.success("Đã cập nhật template thành công!");
      } else {
        const response = await axios.post<{ id: string }>(
          "http://localhost:3001/email-templates",
          emailForm,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setSelectedTemplate(String(response.data.id));
        toast.success("Đã lưu template mới thành công!");
      }
      await fetchTemplates();
    } catch (error) {
      console.error("Lỗi khi lưu template:", error);
      toast.error("Không thể lưu template. Vui lòng thử lại.");
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.title || !emailForm.body) {
      toast.warn("Vui lòng điền tiêu đề và nội dung email.");
      return;
    }
    if (recipients.length === 0) {
      toast.warn("Vui lòng thêm ít nhất một người nhận.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/send-email",
        {
          recipients: recipients.map((student) => ({
            email: student.email,
            ten: student.ten,
            mssv: student.mssv,
          })),
          subject: emailForm.title,
          body: emailForm.body,
          emailTemplateId: selectedTemplate ? parseInt(selectedTemplate) : null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Email đã được gửi thành công!");
      setRecipients([]);
      processedMssvSet.current.clear();
      setRecentlyAddedStudents([]);
      setCurrentSlide(0);
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      toast.error("Không thể gửi email. Vui lòng thử lại.");
    }
  };

  const table = useReactTable({
    data: recipients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: { globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    columnResizeMode: "onChange",
    meta: { handleDeleteStudent },
  });

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? recentlyAddedStudents.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === recentlyAddedStudents.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gửi Email</h1>

      {/* Input Method Selector */}
      <div className="mb-4 flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="camera"
            checked={inputMethod === "camera"}
            onChange={() => setInputMethod("camera")}
          />
          <span>Dùng Camera</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="scanner"
            checked={inputMethod === "scanner"}
            onChange={() => setInputMethod("scanner")}
          />
          <span>Dùng máy quét QR</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="manual"
            checked={inputMethod === "manual"}
            onChange={() => setInputMethod("manual")}
          />
          <span>Nhập URL</span>
        </label>
      </div>

      {/* Dynamic Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow min-h-[320px] flex items-center justify-center">
          {inputMethod === "camera" &&
            (!isScanning ? (
              <Button onClick={() => setIsScanning(true)}>
                Bắt đầu quét QR bằng Camera
              </Button>
            ) : (
              <div className="w-full">
                <div id="qr-reader" className="w-full border rounded" />
                <Button
                  variant="destructive"
                  className="mt-2"
                  onClick={() => setIsScanning(false)}
                >
                  Dừng quét
                </Button>
              </div>
            ))}

          {inputMethod === "scanner" && (
            <p className="text-gray-600">
              Vui lòng sử dụng máy quét QR để quét mã.
            </p>
          )}

          {inputMethod === "manual" && (
            <div className="w-full">
              <textarea
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Nhập URL barcode (mỗi dòng một URL)"
                className="mb-2 w-full h-32 p-2 border rounded"
              />
              <Button onClick={handleManualAdd}>Thêm sinh viên</Button>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow min-h-[320px] flex flex-col justify-center">
          {recentlyAddedStudents.length > 0 ? (
            <div className="relative">
              <h2 className="text-lg font-semibold mb-2">Thông tin sinh viên</h2>
              <div className="flex items-center justify-between">
                {recentlyAddedStudents.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevSlide}
                    className="absolute left-0"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                <div className="flex-1 flex justify-center">
                  <div className="text-center">
                    <img
                      src={`https://api.toolhub.app/hust/AnhDaiDien?mssv=${recentlyAddedStudents[currentSlide].mssv}`}
                      alt="Ảnh thẻ"
                      className="w-48 rounded border mx-auto"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <p>
                      <strong>Tên:</strong> {recentlyAddedStudents[currentSlide].ten}
                    </p>
                    <p>
                      <strong>MSSV:</strong> {recentlyAddedStudents[currentSlide].mssv}
                    </p>
                    <p>
                      <strong>Email:</strong> {recentlyAddedStudents[currentSlide].email}
                    </p>
                    <p>
                      <strong>Lớp:</strong> {recentlyAddedStudents[currentSlide].lop}
                    </p>
                    <p>
                      <strong>Trường:</strong> {recentlyAddedStudents[currentSlide].quanly}
                    </p>
                  </div>
                </div>
                {recentlyAddedStudents.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextSlide}
                    className="absolute right-0"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>
              {recentlyAddedStudents.length > 1 && (
                <div className="flex justify-center mt-2">
                  {recentlyAddedStudents.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 w-2 rounded-full mx-1 ${
                        index === currentSlide ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Chưa có sinh viên nào được thêm.</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Danh sách người nhận</h2>
        <div className="flex justify-end mb-4">
          <Input
            placeholder="Tìm kiếm theo tên, MSSV, hoặc email..."
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
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
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Soạn Email</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Chọn template (tùy chọn)
          </label>
          <select
            value={selectedTemplate || ""}
            onChange={handleTemplateChange}
            className="p-2 border rounded w-full"
          >
            <option value="">-- Chọn template hoặc soạn mới --</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex place-items-end">
          <div className="w-3/4">
            <label className="block mb-1 font-medium">Tên template</label>
            <Input
              name="name"
              value={emailForm.name}
              onChange={handleFormChange}
              placeholder="Nhập tên template (nếu muốn lưu)"
            />
          </div>
          <Button onClick={handleSaveTemplate} className="ml-4">
            Lưu template
          </Button>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Tiêu đề email</label>
          <Input
            name="title"
            value={emailForm.title}
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
            value={emailForm.body}
            onEditorChange={handleEditorChange}
            init={{
              height: 300,
              menubar: false,
              plugins: [],
              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
        </div>

        <Button onClick={handleSendEmail}>Gửi Email</Button>
      </div>

      <ToastContainer />
    </div>
  );
}