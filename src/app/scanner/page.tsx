'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScannerHome() {
  const router = useRouter();
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const companyName = localStorage.getItem('scannerCompanyName');
    const apiKey = localStorage.getItem('scannerApiKey');
    setIsConfigured(!!(companyName && apiKey));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2 text-purple-900">
          🔍 Scanner
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Presale Ticket Scanning System
        </p>

        <div className="space-y-4">
          {/* Activation Scanner */}
          <button
            onClick={() => router.push('/scanner/activation')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-3xl mb-2">🎫</div>
            <div className="text-lg">Activation Scanner</div>
            <div className="text-sm opacity-90">Scan & activate tickets</div>
          </button>

          {/* Validation Scanner */}
          <button
            onClick={() => router.push('/scanner/validation')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="text-lg">Validation Scanner</div>
            <div className="text-sm opacity-90">Check ticket validity</div>
          </button>

          {/* Setup Scanner */}
          <button
            onClick={() => router.push('/scanner/setup')}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-lg">Setup Scanner</div>
            <div className="text-sm opacity-90">Configure credentials</div>
          </button>
        </div>

        {/* Status */}
        <div className="mt-12">
          {isConfigured ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-semibold">
                ✓ Scanner is configured
              </p>
              <p className="text-green-700 text-sm mt-1">
                Ready to scan tickets
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Scanner not configured
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Please set up your scanner first
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Quick Start:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to Setup Scanner</li>
            <li>Scan QR code from admin panel</li>
            <li>Use Activation Scanner to scan tickets</li>
            <li>Use Validation Scanner to check tickets</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
