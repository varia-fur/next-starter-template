'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';

interface Ticket {
  id: string;
  qrCode: string;
  ticketType: string;
  purchaseDate: string;
}

export default function BulkCreateTickets() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(10);
  const [ticketType, setTicketType] = useState('adult');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setTickets([]);

    try {
      const newTickets: Ticket[] = [];

      for (let i = 0; i < quantity; i++) {
        const response = await fetch('/api/tickets/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketType }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create ticket ${i + 1}`);
        }

        const ticket = (await response.json()) as Ticket;
        newTickets.push(ticket);
      }

      setTickets(newTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - hidden on print */}
        <div className="print:hidden">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mb-6 flex items-center text-indigo-700 hover:text-indigo-900 font-semibold transition"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-center mb-2 text-indigo-900">
            🎫 Bulk Create Tickets
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Generate multiple tickets for printing
          </p>

          {/* Generation Controls */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Ticket Type
                </label>
                <select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child (3-16)</option>
                  <option value="family">Family (2 adults, 3 children)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
              >
                {loading ? `Generating... (${tickets.length}/${quantity})` : 'Generate Tickets'}
              </button>

              {tickets.length > 0 && (
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  🖨️ Print
                </button>
              )}
            </div>

            {tickets.length > 0 && (
              <div className="mt-6 text-center text-gray-600">
                <p className="font-semibold">✓ {tickets.length} tickets generated</p>
                <p className="text-sm">Click "Print" to print all tickets</p>
              </div>
            )}
          </div>
        </div>

        {/* Tickets Grid - Print View */}
        {tickets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:gap-2 print:grid-cols-4 p-4 print:p-2">
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-4 print:shadow-none print:border print:border-gray-300 flex flex-col items-center justify-center"
              >
                <div className="mb-3 print:mb-2">
                  <QRCode
                    value={ticket.qrCode}
                    size={150}
                    level="H"
                    includeMargin={true}
                    className="print:w-24 print:h-24"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 capitalize print:text-xs">
                    {ticket.ticketType}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 print:text-[10px] truncate">
                    {ticket.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {tickets.length === 0 && !loading && (
          <div className="print:hidden bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              Generate tickets using the controls above
            </p>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          
          * {
            box-shadow: none !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-2 {
            padding: 0.5rem;
          }
          
          .print\\:gap-2 {
            gap: 0.5rem;
          }
          
          .print\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          
          .print\\:shadow-none {
            box-shadow: none;
          }
          
          .print\\:border {
            border-width: 1px;
          }
          
          .print\\:border-gray-300 {
            border-color: rgb(209, 213, 219);
          }
          
          .print\\:text-xs {
            font-size: 0.75rem;
          }
          
          .print\\:text-\\[10px\\] {
            font-size: 10px;
          }
          
          .print\\:mb-2 {
            margin-bottom: 0.5rem;
          }
          
          .print\\:mt-1 {
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
