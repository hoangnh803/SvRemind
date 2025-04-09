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

// Định nghĩa interface cho dữ liệu sinh viên
interface Student {
  mssv: string;
  ten: string;
  email: string;
  lop: string;
  quanly: string;
}

// Định nghĩa interface cho Email Template
interface EmailTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
}

export default function SendEmailPage() {
  const [recipients, setRecipients] = useState<Student[]>([]);
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [inputMethod, setInputMethod] = useState<"camera" | "scanner" | "manual">("camera");
  const [isProcessing, setIsProcessing] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({ name: "", title: "", body: "" });
  const lastProcessedMssv = useRef<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processedMssvSet = useRef<Set<string>>(new Set());

  // Hàm lấy danh sách template từ API
  const fetchTemplates = async () => {
    try {
      const response = await axios.get<EmailTemplate[]>("http://localhost:3001/email-templates", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTemplates(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách template:", error);
    }
  };

  // Lấy danh sách template khi trang được tải
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Khởi tạo và chạy QR scanner
  const startQrScanner = () => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;
    return scanner;
  };

  // Xử lý khi quét QR thành công
  const onScanSuccess = (decodedText: string) => {
    fetchStudentData(decodedText, true);
  };

  // Xử lý khi quét QR thất bại
  const onScanFailure = (error: any) => {
    console.warn(`Lỗi quét mã QR: ${error}`);
  };

  // Lấy dữ liệu sinh viên từ barcode
  const fetchStudentData = async (url: string, isQrScan: boolean = false) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const apiUrl = `http://localhost:3001/proxy/student?barcode=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      const studentData: Student = response.data as Student;

      if (processedMssvSet.current.has(studentData.mssv)) {
        toast.info("Sinh viên này đã có trong danh sách.");
        return;
      }

      processedMssvSet.current.add(studentData.mssv);
      setLastScannedStudent(studentData);
      setRecipients((prev) => [...prev, studentData]);
      toast.success(`Đã thêm: ${studentData.ten} - ${studentData.mssv}`);

      if (isQrScan) {
        scannerRef.current?.pause();
        setTimeout(() => scannerRef.current?.resume(), 1000);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sinh viên:", error);
      toast.error("Không thể lấy thông tin sinh viên. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý khi nhập tay
  const handleManualAdd = () => {
    if (manualUrl.trim()) {
      fetchStudentData(manualUrl);
      setManualUrl("");
    } else {
      toast.warn("Vui lòng nhập URL barcode.");
    }
  };

  // Xóa sinh viên khỏi danh sách
  const handleDeleteStudent = (mssv: string) => {
    setRecipients((prev) => prev.filter((student) => student.mssv !== mssv));
    if (lastScannedStudent && lastScannedStudent.mssv === mssv) {
      setLastScannedStudent(null);
    }
    processedMssvSet.current.delete(mssv);
    toast.success("Đã xóa sinh viên khỏi danh sách.");
  };

  // Khởi tạo scanner khi dùng camera
  useEffect(() => {
    if (isScanning && inputMethod === "camera") {
      const scanner = startQrScanner();
      return () => {
        scanner.clear();
        scannerRef.current = null;
      };
    }
  }, [isScanning, inputMethod]);

  // Xử lý khi chọn template
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

  // Xử lý thay đổi trường trong form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý thay đổi nội dung email trong TinyMCE
  const handleEditorChange = (content: string) => {
    setEmailForm((prev) => ({ ...prev, body: content }));
  };

  // Lưu template
  const handleSaveTemplate = async () => {
    if (!emailForm.name || !emailForm.title || !emailForm.body) {
      toast.warn("Vui lòng điền đầy đủ tên template, tiêu đề và nội dung email.");
      return;
    }

    try {
      if (selectedTemplate) {
        // Cập nhật template đã chọn
        await axios.put(
          `http://localhost:3001/email-templates/${selectedTemplate}`,
          emailForm,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        toast.success("Đã cập nhật template thành công!");
      } else {
        // Tạo template mới
        const response = await axios.post<{ id: string }>("http://localhost:3001/email-templates", emailForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSelectedTemplate(String(response.data.id)); // Chọn template vừa tạo
        toast.success("Đã lưu template mới thành công!");
      }
      // Làm mới danh sách templates từ API sau khi lưu
      await fetchTemplates();
    } catch (error) {
      console.error("Lỗi khi lưu template:", error);
      toast.error("Không thể lưu template. Vui lòng thử lại.");
    }
  };

  // Gửi email
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
          recipients: recipients.map((r) => r.email),
          subject: emailForm.title,
          body: emailForm.body,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Email đã được gửi thành công!");
      setRecipients([]);
      processedMssvSet.current.clear();
      setLastScannedStudent(null);
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      toast.error("Không thể gửi email. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gửi Email</h1>

      {/* Phần quét mã và danh sách người nhận */}
      <div className="flex mb-6">
        <div className="w-1/2 pr-4">
          <div className="mb-4">
            <label className="mr-4">
              <input
                type="radio"
                value="camera"
                checked={inputMethod === "camera"}
                onChange={() => setInputMethod("camera")}
              />
              Dùng Camera để quét QR
            </label>
            <label className="mr-4">
              <input
                type="radio"
                value="scanner"
                checked={inputMethod === "scanner"}
                onChange={() => setInputMethod("scanner")}
              />
              Dùng máy quét QR
            </label>
            <label>
              <input
                type="radio"
                value="manual"
                checked={inputMethod === "manual"}
                onChange={() => setInputMethod("manual")}
              />
              Nhập tay
            </label>
          </div>

          {inputMethod === "camera" && (
            <>
              {!isScanning && (
                <button
                  onClick={() => setIsScanning(true)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Bắt đầu quét QR bằng Camera
                </button>
              )}
              {isScanning && (
                <div className="mt-4">
                  <div id="qr-reader" style={{ width: "500px", height: "500px" }}></div>
                  <button
                    onClick={() => setIsScanning(false)}
                    className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Dừng quét
                  </button>
                </div>
              )}
            </>
          )}
          {inputMethod === "scanner" && (
            <div>
              <p>Vui lòng sử dụng máy quét QR để quét mã.</p>
            </div>
          )}
          {inputMethod === "manual" && (
            <div>
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Nhập URL barcode"
                className="p-2 border rounded w-full mb-2"
              />
              <button
                onClick={handleManualAdd}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Thêm sinh viên
              </button>
            </div>
          )}
        </div>

        <div className="w-1/2 pl-4">
          {lastScannedStudent && (
            <div className="p-4 bg-gray-100 rounded flex">
              <img
                src={`https://api.toolhub.app/hust/AnhDaiDien?mssv=${lastScannedStudent.mssv}`}
                alt="Ảnh thẻ"
                width="100"
                className="mr-4"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
              <div>
                <h2 className="text-xl font-semibold">Thông tin sinh viên</h2>
                <p><strong>Tên:</strong> {lastScannedStudent.ten}</p>
                <p><strong>MSSV:</strong> {lastScannedStudent.mssv}</p>
                <p><strong>Email:</strong> {lastScannedStudent.email}</p>
                <p><strong>Lớp:</strong> {lastScannedStudent.lop}</p>
                <p><strong>Trường:</strong> {lastScannedStudent.quanly}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách người nhận */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Danh sách người nhận</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-200">
              <th className="p-2 border">STT</th>
              <th className="p-2 border">Họ và tên</th>
              <th className="p-2 border">MSSV</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((student, index) => (
              <tr key={student.mssv} className="bg-white">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{student.ten}</td>
                <td className="p-2 border">{student.mssv}</td>
                <td className="p-2 border">{student.email}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDeleteStudent(student.mssv)}
                    className="p-1 px-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phần soạn email */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Soạn Email</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Chọn template (tùy chọn)</label>
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

        <div className="mb-4 flex items-center">
          <div className="w-3/4">
            <label className="block mb-1 font-medium">Tên template</label>
            <input
              type="text"
              name="name"
              value={emailForm.name}
              onChange={handleFormChange}
              className="p-2 border rounded w-full"
              placeholder="Nhập tên template (nếu muốn lưu)"
            />
          </div>
          <button
            onClick={handleSaveTemplate}
            className="ml-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 self-end"
          >
            Lưu template
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Tiêu đề email</label>
          <input
            type="text"
            name="title"
            value={emailForm.title}
            onChange={handleFormChange}
            className="p-2 border rounded w-full"
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
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
              ],
              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
              content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
        </div>

        <button
          onClick={handleSendEmail}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Gửi Email
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}