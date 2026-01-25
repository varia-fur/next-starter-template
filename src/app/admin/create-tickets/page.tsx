'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';

interface CreatedTicket {
  id: string;
  qrCode: string;
  ticketType: string;
  purchaseDate: string;
  activated: boolean;
  validated: boolean;
  checkInCount: number;
}

export default function CreateTickets() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ticketType: 'adult',
  });
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = (await response.json()) as CreatedTicket;
      console.log('✓ Ticket created:', data);
      setCreatedTicket(data);
      setFormData({ ticketType: 'adult' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="mb-6 flex items-center text-indigo-700 hover:text-indigo-900 font-semibold transition"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-900">
          🎫 Create Presale Tickets
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Generate QR code tickets for butterfly house presale
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">
              New Ticket
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Ticket Type
                </label>
                <select
                  value={formData.ticketType}
                  onChange={(e) =>
                    setFormData({ ...formData, ticketType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child (3-16)</option>
                  <option value="family">Family (2 adults, 3 children)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
            </form>
          </div>

          {/* QR Code Display */}
          {createdTicket && (
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-4 text-green-900">
                ✓ Ticket Created!
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <QRCode
                  value={createdTicket.qrCode}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-center mb-4 text-sm space-y-1">
                <p>
                  <strong>Type:</strong> {createdTicket.ticketType}
                </p>
                <p className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800">
                  <strong>QR Code:</strong> {createdTicket.qrCode}
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg mb-2"
              >
                Print Ticket
              </button>

              <button
                onClick={() => setCreatedTicket(null)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg"
              >
                Create Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
