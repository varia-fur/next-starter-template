'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';

interface ActivationResult {
  success: boolean;
  ticket?: {
    id: string;
    fullName: string;
    email: string;
    ticketType: string;
  };
  message?: string;
  error?: string;
  activatedBy?: string;
}

export default function ActivationScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [validated, setValidated] = useState(false);

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

    // Load stored credentials
    const storedCompanyName = localStorage.getItem('scannerCompanyName');
    const storedApiKey = localStorage.getItem('scannerApiKey');

    if (storedCompanyName && storedApiKey) {
      setCompanyName(storedCompanyName);
      setApiKey(storedApiKey);
      setIsSetup(true);
      setValidated(true);
    } else {
      setIsSetup(false);
    }
  }, []);

  const startScanning = async () => {
    if (!companyName.trim()) {
      alert('Please enter your company name');
      return;
    }

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
            console.log('✓ QR Code detected:', code.data);
            clearInterval(scanInterval);
            stream.getTracks().forEach((track) => track.stop());
            setScanning(false);
            handleActivation(code.data);
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
        success: false,
        error: `Camera Error: ${errorMessage}`,
      });
      alert(`${errorMessage}\n\nDebug: Check browser console (F12) for more details.`);
    }
  };

  const handleActivation = useCallback(
    async (qrCode: string) => {
      setLoading(true);
      setScanning(false);

      try {
        // Validate company credentials first
        const validateResponse = await fetch('/api/validate-company-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName,
            apiKey,
          }),
        });

        const validateResult = (await validateResponse.json()) as { valid: boolean };

        if (!validateResult.valid) {
          setResult({
            success: false,
            error: 'Invalid scanner credentials. Please reconfigure.',
          });
          return;
        }

        // Credentials valid, proceed with activation
        const response = await fetch('/api/tickets/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCode,
            companyName,
          }),
        });

        const data = (await response.json()) as ActivationResult;
        setResult(data);
      } catch (error) {
        setResult({
          success: false,
          error: 'Failed to activate ticket. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    },
    [companyName, apiKey]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="mb-6 flex items-center text-purple-700 hover:text-purple-900 font-semibold transition"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-900">
          🎫 Activation Scanner
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Scan QR codes to activate presale tickets
        </p>

        {!isSetup ? (
          // Setup Required
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-yellow-800 font-semibold mb-4">
                ⚙️ Scanner Setup Required
              </p>
              <p className="text-yellow-700 text-sm mb-4">
                This scanner hasn't been configured yet. Please complete the setup process.
              </p>
              <button
                onClick={() => router.push('/scanner/setup')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
              >
                Go to Setup
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            {/* Status */}
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✓ Scanner Configured for: {companyName}
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('scannerCompanyName');
                  localStorage.removeItem('scannerApiKey');
                  setCompanyName('');
                  setApiKey('');
                  setIsSetup(false);
                  setValidated(false);
                }}
                className="mt-2 text-sm text-green-700 hover:text-green-900 underline"
              >
                Reconfigure Scanner
              </button>
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
                    border: '2px solid rgb(216, 180, 254)'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}

            {/* Start Scanning Button */}
            <button
              onClick={startScanning}
              disabled={scanning || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition mb-4"
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
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <h3
                  className={`font-bold mb-2 ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.success ? '✓ Activated' : '✗ Failed'}
                </h3>
                <p className="text-sm mb-2">
                  {result.message || result.error}
                </p>
                {result.ticket && (
                  <div className="text-sm bg-white p-2 rounded mt-2">
                    <p>
                      <strong>Type:</strong> {result.ticket.ticketType}
                    </p>
                  </div>
                )}
                {result.activatedBy && (
                  <p className="text-sm text-yellow-700 mt-2">
                    Already activated by: {result.activatedBy}
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
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Scanner is configured with company credentials</li>
            <li>Click "Start Scanning"</li>
            <li>Point camera at ticket QR code</li>
            <li>Ticket will be activated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
