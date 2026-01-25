'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';

export default function ScannerSetup() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [companyName, setCompanyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const startScanning = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);

        const scanQRCode = () => {
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              ctx.drawImage(videoRef.current, 0, 0);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);

              if (code) {
                try {
                  const data = JSON.parse(code.data);
                  if (data.companyName && data.apiKey) {
                    setCompanyName(data.companyName);
                    setApiKey(data.apiKey);
                    setSuccess('QR Code scanned successfully!');
                    stopScanning();
                    return;
                  }
                } catch (e) {
                  // Not a valid QR code format
                }
              }
            }
          }
          requestAnimationFrame(scanQRCode);
        };

        scanQRCode();
      }
    } catch (err) {
      setError('Camera access denied or unavailable');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSaveCredentials = async () => {
    if (!companyName.trim() || !apiKey.trim()) {
      setError('Please enter both company name and API key');
      return;
    }

    // Validate credentials
    try {
      const response = await fetch('/api/validate-company-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, apiKey }),
      });

      const result = (await response.json()) as { valid: boolean };

      if (!result.valid) {
        setError('Invalid company credentials');
        return;
      }

      // Save to localStorage
      localStorage.setItem('scannerCompanyName', companyName);
      localStorage.setItem('scannerApiKey', apiKey);

      setSuccess('Credentials saved! You can now use the scanner.');
      setTimeout(() => {
        router.push('/scanner/activation');
      }, 2000);
    } catch (err) {
      setError('Failed to validate credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-900">
          ⚙️ Scanner Setup
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Configure your scanner with company credentials
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Scan QR Code Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Option 1: Scan QR Code</h2>
            <button
              onClick={scanning ? stopScanning : startScanning}
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                scanning
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {scanning ? '⏹ Stop Scanning' : '📷 Start Scanning'}
            </button>

            {scanning && (
              <div className="mt-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    borderRadius: '0.5rem',
                    border: '2px solid rgb(168, 85, 247)',
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}
          </div>

          <div className="text-center text-gray-500">or</div>

          {/* Manual Entry Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Option 2: Manual Entry</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., ABC Events"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="COMP_xxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
              ✓ {success}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveCredentials}
            disabled={!companyName.trim() || !apiKey.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
          >
            Save & Continue
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Get QR code from admin (Company Management)</li>
            <li>Scan QR code to auto-fill credentials</li>
            <li>Or manually enter company name and API key</li>
            <li>Credentials stored locally on this device</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
