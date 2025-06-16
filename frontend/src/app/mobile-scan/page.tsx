/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Html5QrcodeScanner, Html5QrcodeResult } from 'html5-qrcode';
import * as SocketIOClient from 'socket.io-client';

// Create a client component that uses useSearchParams
const MobileScanContent = () => {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing scanner...');
  const [isScannerActive, setIsScannerActive] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [connectionMessage, setConnectionMessage] = useState<string>('Chưa kết nối');
  const socketRef = useRef<SocketIOClient.Socket | null>(null);

  // Ensure this matches your backend WebSocket server URL
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.lienlac.sinhvien.online';
  const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || backendApiUrl;

  // Helper function to get connection status styling
  const getConnectionStatusStyle = (status: typeof connectionStatus) => {
    const baseStyle = {
      padding: '8px 16px',
      borderRadius: '8px',
      margin: '10px 0',
      fontWeight: 'bold',
      fontSize: '14px'
    };

    switch (status) {
      case 'connecting':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' };
      case 'connected':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724', border: '1px solid #00b894' };
      case 'disconnected':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #e74c3c' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#f5c6cb', color: '#721c24', border: '1px solid #dc3545' };
      default:
        return baseStyle;
    }
  };

  // Helper function to get connection status icon
  const getConnectionIcon = (status: typeof connectionStatus) => {
    switch (status) {
      case 'connecting':
        return '⏳';
      case 'connected':
        return '✅';
      case 'disconnected':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '❓';
    }
  };

  useEffect(() => {
    const id = searchParams.get('sessionId');
    if (id) {
      setSessionId(id);
      setStatusMessage('Đang khởi tạo kết nối...');
      setConnectionStatus('connecting');
      setConnectionMessage('Đang kết nối đến máy chủ...');
      
      // Initialize Socket.IO client using the default export from the namespace
      socketRef.current = SocketIOClient.default(backendWsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000, // 10 second timeout
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000
      });

      if (socketRef.current) { // Check if current is not null before accessing properties
        socketRef.current.on('connect', () => {
          setConnectionStatus('connected');
          setConnectionMessage('Kết nối thành công! Sẵn sàng quét QR code.');
          setStatusMessage('Đã kết nối. Hãy quét mã QR sinh viên...');
          console.log('Connected to WebSocket server with id:', socketRef.current?.id);
        });

        socketRef.current.on('disconnect', (reason: string) => {
          setConnectionStatus('disconnected');
          setConnectionMessage(`Mất kết nối: ${reason === 'io server disconnect' ? 'Máy chủ ngắt kết nối' : 'Mất kết nối mạng'}`);
          setStatusMessage('Mất kết nối với máy chủ.');
          console.log('Disconnected from WebSocket server. Reason:', reason);
        });

        socketRef.current.on('connect_error', (error: Error) => {
          setConnectionStatus('error');
          setConnectionMessage(`Lỗi kết nối: ${error.message || 'Không thể kết nối đến máy chủ'}`);
          setStatusMessage('Lỗi kết nối. Vui lòng thử lại.');
          console.error('WebSocket connection error:', error);
        });

        socketRef.current.on('reconnect', (attemptNumber: number) => {
          setConnectionStatus('connected');
          setConnectionMessage(`Đã kết nối lại thành công! (Lần thử: ${attemptNumber})`);
          setStatusMessage('Đã kết nối lại. Sẵn sàng quét QR code.');
          console.log('Reconnected to WebSocket server, attempt:', attemptNumber);
        });

        socketRef.current.on('reconnect_error', (error: Error) => {
          setConnectionStatus('error');
          setConnectionMessage(`Lỗi kết nối lại: ${error.message || 'Không thể kết nối lại'}`);
          console.error('WebSocket reconnection error:', error);
        });

        socketRef.current.on('reconnect_failed', () => {
          setConnectionStatus('error');
          setConnectionMessage('Không thể kết nối lại sau nhiều lần thử. Vui lòng tải lại trang.');
          setStatusMessage('Lỗi kết nối nghiêm trọng. Vui lòng tải lại trang.');
          console.error('WebSocket reconnection failed after all attempts');
        });

        socketRef.current.on('dataForwarded', (data: { status: string }) => {
          console.log('Server confirmed data forwarded:', data);
          setStatusMessage(`Mã QR sinh viên đã được gửi thành công! Có thể quét tiếp.`);
          setTimeout(() => {
            if (isScannerActive) setStatusMessage('Sẵn sàng quét mã QR tiếp theo.');
          }, 3000);
        });

        socketRef.current.on('dataForwardFailed', (error: { status: string; message?: string }) => {
          console.error('Server failed to forward data:', error);
          setStatusMessage(`Lỗi: ${error.message || 'Không thể gửi dữ liệu.'}`);
        });
      } // End of check for socketRef.current

    } else {
      setStatusMessage('Lỗi: Không tìm thấy Session ID trong URL.');
      setConnectionStatus('error');
      setConnectionMessage('Session ID không hợp lệ. Vui lòng quét lại QR code từ máy tính.');
      setIsScannerActive(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [searchParams, backendWsUrl, isScannerActive, scanResult]);

  useEffect(() => {
    if (!sessionId || !isScannerActive) return;

    // Ensure the div for the QR scanner exists in your JSX
    const scannerRegionId = "html5qr-code-full-region";

    // Check if a scanner instance already exists to prevent duplicates
    // html5-qrcode doesn't have a direct way to check for an active instance other than by its effects
    // or by managing state carefully.
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;

    try {
        html5QrcodeScanner = new Html5QrcodeScanner(
            scannerRegionId,
            {
                fps: 10,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.8);
                    return {
                        width: qrboxSize,
                        height: qrboxSize,
                    };
                },
                rememberLastUsedCamera: true,
                supportedScanTypes: [], // Use default (camera)
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 2
            },
            /* verbose= */ false,
        );

        const onScanSuccess = (decodedText: string, _result: Html5QrcodeResult) => {
            console.log(`Scan result: ${decodedText}`);
            
            // Validate QR code format
            if (!decodedText || !decodedText.includes('hust.edu.vn')) {
                setStatusMessage('Mã QR không hợp lệ. Vui lòng quét lại.');
                return;
            }

            setScanResult(decodedText);
            setStatusMessage(`Đã quét: ${decodedText}. Đang gửi đến máy tính...`);

            if (socketRef.current && sessionId && connectionStatus === 'connected') {
                socketRef.current.emit('sendStudentQrData', {
                    sessionId: sessionId,
                    qrData: decodedText,
                });
                setStatusMessage('Đang gửi dữ liệu đến máy tính...');
            } else {
                if (connectionStatus !== 'connected') {
                    setStatusMessage('Lỗi: Không có kết nối đến máy chủ. Vui lòng kiểm tra kết nối.');
                } else {
                    setStatusMessage('Lỗi: Thiếu thông tin phiên làm việc.');
                }
            }
        };

        const onScanFailure = (_error: string) => {
            // Don't update status too frequently on scan failures, can be annoying
            if (_error && _error !== "QR code not found") {
                console.warn(`QR scan error: ${_error}`);
            }
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        if (connectionStatus === 'connected') {
            setStatusMessage('Máy quét QR đã sẵn sàng. Hãy hướng camera về phía mã QR sinh viên.');
        } else {
            setStatusMessage('Máy quét đã khởi động nhưng chưa kết nối đến máy chủ.');
        }

    } catch (error) {
        console.error('Failed to initialize Html5QrcodeScanner', error);
        setStatusMessage('Lỗi: Không thể khởi động máy quét QR. Vui lòng cấp quyền truy cập camera.');
        setIsScannerActive(false);
    }
    

    return () => {
        if (html5QrcodeScanner && html5QrcodeScanner.getState()) {
            html5QrcodeScanner.clear().catch(err => {
                console.error("Error cleaning up QR Code scanner: ", err);
            });
        }
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [sessionId, isScannerActive, connectionStatus]); // Rerun when sessionId is available or scanner needs reactivation

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Quét QR Code Bằng Điện Thoại</h1>
      
      {/* Connection Status Card */}
      <div style={getConnectionStatusStyle(connectionStatus)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{getConnectionIcon(connectionStatus)}</span>
          <span>Trạng thái kết nối: {connectionMessage}</span>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        margin: '15px 0',
        border: '1px solid #dee2e6'
      }}>
        <p><strong>Session ID:</strong> {sessionId || 'Đang tải...'}</p>
      </div>

      <div id="html5qr-code-full-region" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        margin: '20px auto',
        border: connectionStatus === 'connected' ? '2px solid #00b894' : '2px solid #ddd',
        borderRadius: '8px',
        padding: '10px'
      }}></div>
      
      {scanResult && (
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '10px',
          borderRadius: '8px',
          margin: '15px 0',
          border: '1px solid #00b894'
        }}>
          <p><strong>Mã QR vừa quét:</strong> {scanResult}</p>
        </div>
      )}
      
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '12px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#495057' }}>
          Trạng thái: {statusMessage}
        </p>
      </div>

      {connectionStatus === 'error' && (
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '12px 24px', 
            marginTop: '15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Tải Lại Trang
        </button>
      )}
      
      {!sessionId && (
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '15px',
          borderRadius: '8px',
          margin: '15px 0',
          border: '1px solid #ffeaa7'
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            Vui lòng đảm bảo bạn đã truy cập trang này bằng cách quét mã QR từ ứng dụng máy tính.
          </p>
        </div>
      )}
    </div>
  );
};

// Loading fallback component
const MobileScanLoading = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Mobile QR Code Scanner</h1>
    <p>Loading scanner...</p>
  </div>
);

// Main page component that wraps the content in a Suspense boundary
const MobileScanPage = () => {
  return (
    <Suspense fallback={<MobileScanLoading />}>
      <MobileScanContent />
    </Suspense>
  );
};

export default MobileScanPage; 