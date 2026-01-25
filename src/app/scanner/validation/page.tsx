'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';

interface ValidationResult {
  valid?: boolean;
  ticket?: {
    id: string;
    ticketType: string;
  };
  message?: string;
  reason?: string;
  error?: string;
  usedAt?: string;
}

export default function ValidationScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scannerLocation, setScannerLocation] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  React.useEffect(() => {
    // Check browser support
    const hasCamera = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    setDebugInfo(
      `Protocol: ${protocol} | Host: ${hostname} | Camera Support: ${hasCamera ? 'Yes' : 'No'}`
    );
  }, []);

  const startScanning = async () => {
    try {
      console.log('🎯 Starting camera request...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser');
      }

      console.log('✓ getUserMedia available');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      console.log('✓ Camera stream obtained');
      
      // NOW set scanning so the video element renders
      setScanning(true);
      setResult(null);

      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100));

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video) {
        throw new Error('Video element not rendered - ref still null');
      }

      console.log('✓ Video ref available, attaching stream');
      video.srcObject = stream;

      const scanInterval = setInterval(() => {
        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            clearInterval(scanInterval);
            stream.getTracks().forEach((track) => track.stop());
            setScanning(false);
            handleValidation(code.data);
          }
        }
      }, 100);
    } catch (error) {
      console.error('❌ Camera error:', error);
      setScanning(false);
      
      let errorMessage = 'Unknown error';
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please grant permission and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another app.';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResult({
        valid: false,
        error: `Camera Error: ${errorMessage}`,
      });
      alert(`${errorMessage}\n\nDebug: Check browser console (F12) for more details.`);
    }
  };

  const handleValidation = useCallback(
    async (qrCode: string) => {
      setLoading(true);
      setScanning(false);

      try {
        const response = await fetch('/api/tickets/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCode,
            scannerLocation,
          }),
        });

        const data = (await response.json()) as ValidationResult;
        setResult(data);
      } catch (error) {
        setResult({
          valid: false,
          error: 'Failed to validate ticket. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    },
    [scannerLocation]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="mb-6 flex items-center text-green-700 hover:text-green-900 font-semibold transition"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-center mb-2 text-green-900">
          ✓ Validation Scanner
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Verify ticket validity at entry
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Scanner Location Input */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Scanner Location (Optional)
            </label>
            <input
              type="text"
              value={scannerLocation}
              onChange={(e) => setScannerLocation(e.target.value)}
              placeholder="e.g., Main Entrance"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={scanning || loading}
            />
          </div>

          {/* Video Preview */}
          {scanning && (
            <div className="mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  borderRadius: '0.5rem',
                  border: '2px solid rgb(134, 239, 172)'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          {/* Start Scanning Button */}
          <button
            onClick={startScanning}
            disabled={scanning || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition mb-4"
          >
            {scanning ? 'Scanning...' : 'Start Scanning'}
          </button>

          {/* Debug Info */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded mb-4">
            {debugInfo}
          </div>

          {/* Results */}
          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.valid
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <h3
                className={`font-bold mb-2 text-lg ${
                  result.valid ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.valid ? '✓ Valid Ticket' : '✗ Invalid Ticket'}
              </h3>
              {result.message && (
                <p className="text-sm mb-2 font-semibold">{result.message}</p>
              )}
              {result.reason && (
                <p className="text-sm mb-2">Reason: {result.reason}</p>
              )}
              {result.error && <p className="text-sm text-red-700">{result.error}</p>}
              {result.ticket && (
                <div className="text-sm bg-white p-3 rounded mt-3 space-y-1">
                  <p>
                    <strong>Type:</strong> {result.ticket.ticketType}
                  </p>
                </div>
              )}
              {result.usedAt && (
                <p className="text-sm text-red-700 mt-2">
                  Already used on: {new Date(result.usedAt).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => setResult(null)}
                className="mt-3 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded"
              >
                Scan Again
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Start Scanning"</li>
            <li>Point camera at ticket QR code</li>
            <li>Ticket validity will be checked</li>
            <li>Entry approval or denial will show</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
