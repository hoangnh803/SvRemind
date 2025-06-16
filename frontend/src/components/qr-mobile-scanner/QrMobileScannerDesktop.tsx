/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import * as SocketIOClient from 'socket.io-client';
import { Button } from '../ui/button';

interface QrMobileScannerDesktopProps {
  onStudentDataScanned?: (scannedUrl: string) => void; // New prop for callback
}

const QrMobileScannerDesktop: React.FC<QrMobileScannerDesktopProps> = ({ onStudentDataScanned }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mobileScanUrl, setMobileScanUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const [scannedStudentData, setScannedStudentData] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<string>('Chưa kết nối');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const socketRef = useRef<SocketIOClient.Socket | null>(null);

  // Ensure this matches your backend API URL
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.lienlac.sinhvien.online';
  // Socket.IO will automatically use the same base URL as the API, with proper protocol
  const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || backendApiUrl;

  // Helper function to get connection status styling
  const getConnectionStatusStyle = (status: typeof connectionStatus) => {
    const baseStyle = {
      padding: '12px 16px',
      borderRadius: '8px',
      margin: '15px 0',
      fontWeight: 'bold',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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

  const initializeSession = async () => {
    setIsLoading(true);
    setError(null);
    // setScannedStudentData(null);
    setSessionId(null);
    setMobileScanUrl(null);

    try {
      const response = await fetch(`${backendApiUrl}/realtime-qr/initiate-session`);
      if (!response.ok) {
        throw new Error(`Lỗi khởi tạo phiên: ${response.statusText}`);
      }
      const data = await response.json();
      setSessionId(data.sessionId);
      setMobileScanUrl(data.mobileScanUrl);
      
      // Automatically connect WebSocket after session is initiated
      connectWebSocket(data.sessionId);

    } catch (err: any) {
      setError(err.message || 'Không thể tạo phiên làm việc.');
      setConnectionStatus('error');
      setSocketStatus('Lỗi trong quá trình khởi tạo');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = (currentSessionId: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setConnectionStatus('connecting');
    setSocketStatus('Đang kết nối đến máy chủ...');
    
    socketRef.current = SocketIOClient.default(backendWsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000
    });

    if (socketRef.current) {
      socketRef.current.on('connect', () => {
        setConnectionStatus('connecting');
        setSocketStatus('Đã kết nối. Đang đăng ký desktop...');
        console.log('Desktop connected to WebSocket server with id:', socketRef.current?.id);
        socketRef.current?.emit('registerDesktop', { sessionId: currentSessionId });
      });

      socketRef.current.on('desktopRegistered', (data: { sessionId: string }) => {
        setConnectionStatus('connected');
        setSocketStatus(`Đã đăng ký thành công với phiên: ${data.sessionId}. Chờ điện thoại quét...`);
        console.log('Desktop registered:', data);
      });

      socketRef.current.on('studentQrData', (data: string) => {
        console.log('Received student QR data from mobile:', data);
        // setScannedStudentData(data);
        setSocketStatus('Đã nhận dữ liệu sinh viên! Đang xử lý...');
        if (onStudentDataScanned) {
          onStudentDataScanned(data);
        }
      });

      socketRef.current.on('disconnect', (reason: string) => {
        setConnectionStatus('disconnected');
        setSocketStatus(`Mất kết nối: ${reason === 'io server disconnect' ? 'Máy chủ ngắt kết nối' : 'Mất kết nối mạng'}`);
        console.log('Desktop disconnected from WebSocket server. Reason:', reason);
      });

      socketRef.current.on('connect_error', (err: Error) => {
        setConnectionStatus('error');
        setSocketStatus(`Lỗi kết nối: ${err.message || 'Không thể kết nối đến máy chủ'}`);
        console.error('WebSocket Connection Error:', err);
        setError('Kết nối WebSocket thất bại. Đảm bảo máy chủ backend đang chạy và có thể truy cập.');
      });

      socketRef.current.on('reconnect', (attemptNumber: number) => {
        setConnectionStatus('connected');
        setSocketStatus(`Đã kết nối lại thành công! (Lần thử: ${attemptNumber})`);
        console.log('Reconnected to WebSocket server, attempt:', attemptNumber);
      });

      socketRef.current.on('reconnect_error', (error: Error) => {
        setConnectionStatus('error');
        setSocketStatus(`Lỗi kết nối lại: ${error.message || 'Không thể kết nối lại'}`);
        console.error('WebSocket reconnection error:', error);
      });

      socketRef.current.on('reconnect_failed', () => {
        setConnectionStatus('error');
        setSocketStatus('Không thể kết nối lại sau nhiều lần thử. Vui lòng thử lại.');
        console.error('WebSocket reconnection failed after all attempts');
      });
    }
  };

  useEffect(() => {
    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Quét QR Sinh Viên Bằng Điện Thoại</h2>
      
      {!sessionId && (
        <Button 
          onClick={initializeSession} 
          disabled={isLoading} 
          style={{ 
            padding: '12px 20px', 
            fontSize: '16px',
            backgroundColor: isLoading ? '#6c757d' : '#007bff',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Đang khởi tạo...' : 'Bắt Đầu Phiên Quét Mobile'}
        </Button>
      )}

      {error && (
        <div style={{
          color: '#721c24',
          backgroundColor: '#f5c6cb',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #dc3545',
          margin: '15px 0'
        }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}
      
      {/* Connection Status Display */}
      <div style={getConnectionStatusStyle(connectionStatus)}>
        <span style={{ fontSize: '16px' }}>{getConnectionIcon(connectionStatus)}</span>
        <span>Trạng thái WebSocket: {socketStatus}</span>
      </div>

      {mobileScanUrl && sessionId && (
        <div style={{ 
          marginTop: '20px', 
          border: connectionStatus === 'connected' ? '2px solid #00b894' : '1px solid #ccc', 
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '15px' }}>1. Quét mã QR này bằng điện thoại:</h3>
          <p style={{ color: '#6c757d' }}>Điều này sẽ mở trang quét chuyên dụng trên điện thoại của bạn.</p>
          
          <div style={{ 
            margin: '20px 0', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <QRCode value={mobileScanUrl} size={256} level="H" />
          </div>
          
          <div style={{
            backgroundColor: '#e9ecef',
            padding: '12px',
            borderRadius: '6px',
            margin: '15px 0'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#495057' }}>
              <strong>URL:</strong> <a href={mobileScanUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>{mobileScanUrl}</a>
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#495057' }}>
              <strong>Session ID:</strong> <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{sessionId}</code>
            </p>
          </div>
          
          <hr style={{margin: '20px 0', borderColor: '#dee2e6'}}/>
          
          {/* <h3 style={{ color: '#495057', marginBottom: '15px' }}>2. Dữ liệu sinh viên đã quét:</h3>
          {scannedStudentData ? (
            <div style={{
              padding: '15px', 
              backgroundColor: '#e8f5e8', 
              border: '1px solid #00b894', 
              marginTop: '10px',
              borderRadius: '8px'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#155724' }}>
                  <strong>Mã QR sinh viên vừa quét:</strong> {scannedStudentData}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#155724' }}>
                  Dữ liệu đã được chuyển đến trang Gửi Email để xử lý.
                </p>
            </div>
          ) : (
            <div style={{
              padding: '15px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              fontStyle: 'italic',
              color: '#856404'
            }}>
              Đang chờ dữ liệu QR sinh viên từ điện thoại... (Component desktop sẽ chuyển dữ liệu đến trang Gửi Email)
            </div>
          )} */}
        </div>
      )}
      
      {connectionStatus === 'error' && sessionId && (
        <Button 
          onClick={() => connectWebSocket(sessionId)} 
          style={{
            padding: '10px 16px',
            marginTop: '15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Thử Kết Nối Lại
        </Button>
      )}
    </div>
  );
};

export default QrMobileScannerDesktop; 