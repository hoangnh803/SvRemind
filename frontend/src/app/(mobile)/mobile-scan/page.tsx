/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";

export default function ScanQrPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startQrScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10 },
        false
      );
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
      setIsScanning(true);
    } catch (err) {
      toast.error("Không thể truy cập camera. Hãy cấp quyền cho ứng dụng.");
      setIsScanning(false);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (!sessionId) {
      toast.error("Không tìm thấy sessionId.");
      return;
    }

    try {
      await axios.post(`http://localhost:3001/session/${sessionId}/scan`, {
        url: decodedText,
      });
      toast.success("Đã gửi URL đến máy tính!");
      scannerRef.current?.pause();
      setTimeout(() => scannerRef.current?.resume(), 1000);
    } catch (error) {
      console.error("Lỗi khi gửi URL:", error);
      toast.error("Không thể gửi URL. Vui lòng thử lại.");
    }
  };

  const onScanFailure = (error: any) => {
    console.warn(`Lỗi quét mã QR: ${error}`);
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quét QR bằng Điện Thoại</h1>
      {!isScanning ? (
        <Button onClick={startQrScanner}>Bắt đầu quét QR</Button>
      ) : (
        <div>
          <div id="qr-reader" className="w-full border rounded" />
          <Button
            variant="destructive"
            className="mt-2"
            onClick={() => {
              scannerRef.current?.clear();
              setIsScanning(false);
            }}
          >
            Dừng quét
          </Button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}