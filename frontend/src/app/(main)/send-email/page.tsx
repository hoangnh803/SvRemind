// src/app/send-email/page.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Định nghĩa interface cho dữ liệu sinh viên
interface Student {
  mssv: string;
  ten: string;
  email: string;
  lop: string;
  quanly: string;
}

export default function SendEmailPage() {
  const [recipients, setRecipients] = useState<Student[]>([]);
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [inputMethod, setInputMethod] = useState<"camera" | "scanner" | "manual">("camera");
  const [notification, setNotification] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessedMssv = useRef<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null); // Lưu tham chiếu đến scanner
  const processedMssvSet = useRef<Set<string>>(new Set()); // Set to keep track of processed mssv

  // Hàm khởi tạo và chạy QR scanner
  const startQrScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );
    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner; // Lưu scanner vào ref
    return scanner;
  };

  // Hàm hiển thị thông báo tự động biến mất
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Hàm xóa sinh viên khỏi danh sách
  const handleDeleteStudent = (mssv: string) => {
    setRecipients((prev) => prev.filter((student) => student.mssv !== mssv));
    if (lastScannedStudent && lastScannedStudent.mssv === mssv) {
      setLastScannedStudent(null);
    }
    processedMssvSet.current.delete(mssv); // Remove from processed set
    showNotification("Đã xóa sinh viên khỏi danh sách.");
  };

  // Hàm lấy dữ liệu sinh viên từ barcode và kiểm tra trùng lặp
  const fetchStudentData = async (url: string, isQrScan: boolean = false) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const apiUrl = `http://localhost:3001/proxy/student?barcode=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      const studentData: Student = response.data as Student;

      if (processedMssvSet.current.has(studentData.mssv)) {
        showNotification("Sinh viên này đã có trong danh sách.");
        return;
      }

      processedMssvSet.current.add(studentData.mssv);

      setLastScannedStudent(studentData);
      setRecipients((prev) => [...prev, studentData]);
      showNotification(`Đã thêm: ${studentData.ten} - ${studentData.mssv}`);

      // Tạm dừng scanner nếu là QR scan
      if (isQrScan) {
        scannerRef.current?.pause(); // Tạm dừng quét
        setTimeout(() => {
          scannerRef.current?.resume(); // Tiếp tục quét sau 1 giây
        }, 1000);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sinh viên:", error);
      showNotification("Không thể lấy thông tin sinh viên. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý khi quét QR thành công
  const onScanSuccess = (decodedText: string) => {
    fetchStudentData(decodedText, true);
  };

  // Xử lý khi quét QR thất bại
  const onScanFailure = (error: any) => {
    console.warn(`Lỗi quét mã QR: ${error}`);
  };

  // Xử lý khi nhập tay
  const handleManualAdd = () => {
    if (manualUrl.trim()) {
      fetchStudentData(manualUrl);
      setManualUrl("");
    } else {
      showNotification("Vui lòng nhập URL barcode.");
    }
  };

  // Khởi tạo scanner khi dùng camera
  useEffect(() => {
    if (isScanning && inputMethod === "camera") {
      const scanner = startQrScanner();
      return () => {
        scanner.clear();
        scannerRef.current = null; // Xóa tham chiếu khi dừng scanner
      };
    }
  }, [isScanning, inputMethod]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gửi Email</h1>

      {notification && (
        <div className="z-50 fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
          {notification}
        </div>
      )}

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

      <div className="flex mb-6">
        <div className="w-1/2 pr-4">
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
                  <div
                    id="qr-reader"
                    style={{ width: "500px", height: "500px" }}
                  ></div>
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
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
              <div>
                <h2 className="text-xl font-semibold">Thông tin sinh viên</h2>
                <p>
                  <strong>Tên:</strong> {lastScannedStudent.ten}
                </p>
                <p>
                  <strong>MSSV:</strong> {lastScannedStudent.mssv}
                </p>
                <p>
                  <strong>Email:</strong> {lastScannedStudent.email}
                </p>
                <p>
                  <strong>Lớp:</strong> {lastScannedStudent.lop}
                </p>
                <p>
                  <strong>Trường:</strong> {lastScannedStudent.quanly}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
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
      <ToastContainer />
    </div>
  );
}