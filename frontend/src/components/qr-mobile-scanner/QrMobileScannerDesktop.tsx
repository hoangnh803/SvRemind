/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import * as SocketIOClient from 'socket.io-client';

interface ScannedData {
  // Define the structure of the data you expect to receive
  // For now, let's assume it's just a string, but you can make it more complex
  id: string; // Example: student ID
  timestamp: number;
}

interface QrMobileScannerDesktopProps {
  onStudentDataScanned?: (scannedUrl: string) => void; // New prop for callback
}

const QrMobileScannerDesktop: React.FC<QrMobileScannerDesktopProps> = ({ onStudentDataScanned }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mobileScanUrl, setMobileScanUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedStudentData, setScannedStudentData] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<string>('Disconnected');
  const socketRef = useRef<SocketIOClient.Socket | null>(null);

  // Ensure this matches your backend API URL
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';
  // Ensure this matches your backend WebSocket server URL
  const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:3001';

  const initializeSession = async () => {
    setIsLoading(true);
    setError(null);
    setScannedStudentData(null);
    setSessionId(null);
    setMobileScanUrl(null);

    try {
      const response = await fetch(`${backendApiUrl}/realtime-qr/initiate-session`);
      if (!response.ok) {
        throw new Error(`Failed to initiate session: ${response.statusText}`);
      }
      const data = await response.json();
      setSessionId(data.sessionId);
      setMobileScanUrl(data.mobileScanUrl);
      
      // Automatically connect WebSocket after session is initiated
      connectWebSocket(data.sessionId);

    } catch (err: any) {
      setError(err.message || 'Could not fetch session details.');
      setSocketStatus('Error during initiation');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = (currentSessionId: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setSocketStatus('Connecting...');
    socketRef.current = SocketIOClient.default(backendWsUrl, {
      transports: ['websocket', 'polling']
    });

    if (socketRef.current) {
      socketRef.current.on('connect', () => {
        setSocketStatus('Connected. Registering desktop...');
        console.log('Desktop connected to WebSocket server with id:', socketRef.current?.id);
        socketRef.current?.emit('registerDesktop', { sessionId: currentSessionId });
      });

      socketRef.current.on('desktopRegistered', (data: { sessionId: string }) => {
        setSocketStatus(`Registered with session: ${data.sessionId}. Waiting for mobile scan...`);
        console.log('Desktop registered:', data);
      });

      socketRef.current.on('studentQrData', (data: string) => {
        console.log('Received student QR data from mobile:', data);
        setScannedStudentData(data);
        setSocketStatus('Student data received! Processing with SendEmailPage...');
        if (onStudentDataScanned) {
          onStudentDataScanned(data);
        }
      });

      socketRef.current.on('disconnect', () => {
        setSocketStatus('Disconnected from WebSocket.');
        console.log('Desktop disconnected from WebSocket server.');
      });

      socketRef.current.on('connect_error', (err: Error) => {
        setSocketStatus(`Connection Error: ${err.message}`);
        console.error('WebSocket Connection Error:', err);
        setError('WebSocket connection failed. Ensure backend WebSocket is running and accessible.');
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
      <h2>Scan Student QR with Mobile Phone</h2>
      {!sessionId && (
        <button onClick={initializeSession} disabled={isLoading} style={{ padding: '10px 15px', fontSize: '16px' }}>
          {isLoading ? 'Initializing...' : 'Start Mobile Scan Session'}
        </button>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <div style={{ marginTop: '20px' }}>
        <strong>WebSocket Status:</strong> {socketStatus}
      </div>

      {mobileScanUrl && sessionId && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px' }}>
          <h3>1. Scan this QR Code with your Mobile Phone:</h3>
          <p>This will open a special scanning page on your phone.</p>
          <div style={{ margin: '20px 0'}}>
            <QRCode value={mobileScanUrl} size={256} level="H" />
          </div>
          <p>URL: <a href={mobileScanUrl} target="_blank" rel="noopener noreferrer">{mobileScanUrl}</a></p>
          <p>Your Session ID: <strong>{sessionId}</strong></p>
          <hr style={{margin: '20px 0'}}/>
          <h3>2. Scanned Student Data:</h3>
          {scannedStudentData ? (
            <div style={{padding: '10px', backgroundColor: '#e6ffed', border: '1px solid #b2f5d0', marginTop: '10px'}}>
                <p><strong>Last Scanned Student ID/URL:</strong> {scannedStudentData}</p>
                {/* The actual student info will now be processed and displayed by SendEmailPage */}
            </div>
          ) : (
            <p><em>Waiting for student QR data from mobile... (Desktop component will pass it to SendEmailPage)</em></p>
          )}
        </div>
      )}
    </div>
  );
};

export default QrMobileScannerDesktop; 