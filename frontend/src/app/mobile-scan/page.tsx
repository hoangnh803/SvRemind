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
  const socketRef = useRef<SocketIOClient.Socket | null>(null);

  // Ensure this matches your backend WebSocket server URL
  const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:3001'; 

  useEffect(() => {
    const id = searchParams.get('sessionId');
    if (id) {
      setSessionId(id);
      setStatusMessage('Connecting to server...');
      // Initialize Socket.IO client using the default export from the namespace
      socketRef.current = SocketIOClient.default(backendWsUrl, {
        transports: ['websocket', 'polling']
      });

      if (socketRef.current) { // Check if current is not null before accessing properties
        socketRef.current.on('connect', () => {
          setStatusMessage('Connected. Waiting for QR scan...');
          console.log('Connected to WebSocket server with id:', socketRef.current?.id);
        });

        socketRef.current.on('disconnect', () => {
          setStatusMessage('Disconnected from server.');
          console.log('Disconnected from WebSocket server.');
        });

        socketRef.current.on('dataForwarded', (data: { status: string }) => {
          console.log('Server confirmed data forwarded:', data);
          setStatusMessage(`Student ID: ${scanResult} sent successfully! Scan another.`);
          setTimeout(() => {
            if (isScannerActive) setStatusMessage('Ready to scan next QR code.');
          }, 3000);
        });

        socketRef.current.on('dataForwardFailed', (error: { status: string; message?: string }) => {
          console.error('Server failed to forward data:', error);
          setStatusMessage(`Error: ${error.message || 'Could not send data.'}`);
        });
      } // End of check for socketRef.current

    } else {
      setStatusMessage('Error: Session ID not found in URL.');
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
            setScanResult(decodedText);
            setStatusMessage(`Scanned: ${decodedText}. Sending to desktop...`);
            setIsScannerActive(false); // Stop further scans until this one is processed

            if (socketRef.current && sessionId) {
                socketRef.current.emit('sendStudentQrData', {
                    sessionId: sessionId,
                    qrData: decodedText,
                });
            } else {
                setStatusMessage('Error: Not connected to server or session ID missing.');
            }
            // To clear the scanner after a successful scan:
            if (html5QrcodeScanner) {
              html5QrcodeScanner.clear().catch(err => console.error('Failed to clear scanner', err));
            }
            // To re-enable scanning for another QR code after a short delay:
            setTimeout(() => setIsScannerActive(true), 3000); 
        };

        const onScanFailure = (_error: string) => {
            // console.warn(`QR scan error: ${_error}`);
            // Don't update status too frequently on scan failures, can be annoying
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        setStatusMessage('QR Scanner started. Point camera at a student QR code.');

    } catch (error) {
        console.error('Failed to initialize Html5QrcodeScanner', error);
        setStatusMessage('Error: Could not start QR scanner. Check camera permissions.');
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
}, [sessionId, isScannerActive]); // Rerun when sessionId is available or scanner needs reactivation

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Mobile QR Code Scanner</h1>
      <p>Session ID: {sessionId || 'Waiting...'}</p>
      <div id="html5qr-code-full-region" style={{ width: '100%', maxWidth: '500px', margin: '20px auto' }}></div>
      {scanResult && <p>Last Scanned: {scanResult}</p>}
      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Status: {statusMessage}</p>
      {!isScannerActive && sessionId && (
        <button 
          onClick={() => { 
            setIsScannerActive(true); 
            setStatusMessage('Scanner reactivated. Ready to scan.');
            setScanResult(null); // Clear previous scan result
          }} 
          style={{padding: '10px 20px', marginTop: '10px'}}
        >
          Scan Another QR Code
        </button>
      )}
      {!sessionId && <p>Please ensure you accessed this page by scanning the QR code from the desktop application.</p>}
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