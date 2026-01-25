'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';

interface Ticket {
  id: string;
  qrCode: string;
  ticketType: string;
  purchaseDate: string;
  activated: boolean;
  activatedBy?: string;
  activatedAt?: string;
  validated: boolean;
}

interface ActivationsByCompany {
  [companyName: string]: {
    count: number;
    tickets: Ticket[];
  };
}

export default function BillingPanel() {
  const router = useRouter();
  const [data, setData] = useState<ActivationsByCompany>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingQrCode, setDeletingQrCode] = useState<string | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  useEffect(() => {
    fetchActivations();
    const interval = setInterval(fetchActivations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActivations = async () => {
    try {
      const response = await fetch('/api/tickets/activations-by-company');
      if (!response.ok) {
        console.error('Failed to fetch:', response.status, response.statusText);
        throw new Error(`Failed to fetch activations: ${response.status}`);
      }
      const activations = (await response.json()) as ActivationsByCompany;
      console.log('✓ Activations fetched:', activations);
      setData(activations);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (qrCode: string, companyName: string) => {
    if (!window.confirm(`Delete ticket ${qrCode}?`)) {
      return;
    }

    setDeletingQrCode(qrCode);
    try {
      const response = await fetch('/api/tickets/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode }),
      });

      if (!response.ok) throw new Error('Failed to delete ticket');
      
      // Remove from local state
      setData((prev) => {
        const updated = { ...prev };
        if (updated[companyName]) {
          updated[companyName].tickets = updated[companyName].tickets.filter(
            (t) => t.qrCode !== qrCode
          );
          updated[companyName].count--;
          if (updated[companyName].count === 0) {
            delete updated[companyName];
          }
        }
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
    } finally {
      setDeletingQrCode(null);
    }
  };

  const handleBulkDeleteCompany = async (companyName: string) => {
    const count = data[companyName]?.count || 0;
    if (!window.confirm(`Delete all ${count} tickets for ${companyName}? This cannot be undone!`)) {
      return;
    }

    setDeletingCompany(companyName);
    try {
      const response = await fetch('/api/tickets/delete-company-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok) throw new Error('Failed to delete company tickets');
      
      const result = await response.json();
      
      // Remove company from local state
      setData((prev) => {
        const updated = { ...prev };
        delete updated[companyName];
        return updated;
      });
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company tickets');
    } finally {
      setDeletingCompany(null);
    }
  };

  const totalActivatedTickets = Object.values(data).reduce((sum, company) => sum + company.count, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-2xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="mb-6 flex items-center text-slate-700 hover:text-slate-900 font-semibold transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold text-center mb-2 text-slate-900">
          💳 Billing Panel
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Manage activated tickets by company
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="text-3xl font-bold text-blue-900">
                {Object.keys(data).length}
              </div>
              <div className="text-blue-700 font-semibold">Companies</div>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <div className="text-3xl font-bold text-green-900">
                {totalActivatedTickets}
              </div>
              <div className="text-green-700 font-semibold">Total Activated Tickets</div>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="text-3xl font-bold text-purple-900">
                {totalActivatedTickets > 0 ? (totalActivatedTickets / Object.keys(data).length).toFixed(1) : 0}
              </div>
              <div className="text-purple-700 font-semibold">Avg per Company</div>
            </div>
          </div>
        </div>

        {/* Companies List */}
        {Object.keys(data).length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No activated tickets yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(data)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([companyName, companyData]) => (
                <div key={companyName} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Company Header */}
                  <button
                    onClick={() =>
                      setExpandedCompany(
                        expandedCompany === companyName ? null : companyName
                      )
                    }
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-bold text-indigo-900">
                        {companyData.count}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">{companyName}</div>
                        <div className="text-sm text-gray-600">
                          {companyData.tickets.filter((t) => t.validated).length} validated
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl">
                      {expandedCompany === companyName ? '▼' : '▶'}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedCompany === companyName && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="mb-4 flex gap-2">
                        <button
                          onClick={() => handleBulkDeleteCompany(companyName)}
                          disabled={deletingCompany === companyName}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded transition text-sm"
                        >
                          {deletingCompany === companyName
                            ? '...'
                            : `🗑️ Delete All (${companyData.count})`}
                        </button>
                      </div>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {companyData.tickets.map((ticket) => (
                          <div
                            key={ticket.qrCode}
                            className={`flex items-start justify-between p-3 rounded border gap-3 ${
                              ticket.validated
                                ? 'bg-green-50 border-green-200'
                                : 'bg-yellow-50 border-yellow-200'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm font-semibold truncate">
                                {ticket.id}
                              </p>
                              <p className="text-xs text-gray-600">
                                {ticket.ticketType.charAt(0).toUpperCase() +
                                  ticket.ticketType.slice(1)}{' '}
                                • {ticket.validated ? '✓ Validated' : '○ Pending'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setShowQRCode(showQRCode === ticket.qrCode ? null : ticket.qrCode)
                                }
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold transition"
                              >
                                QR
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(ticket.qrCode, companyName)}
                                disabled={deletingQrCode === ticket.qrCode}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xs rounded font-semibold transition"
                              >
                                {deletingQrCode === ticket.qrCode ? '...' : '✕'}
                              </button>
                            </div>
                            {showQRCode === ticket.qrCode && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                                  <div className="text-center">
                                    <p className="font-semibold mb-4">{ticket.id}</p>
                                    <div className="flex justify-center mb-4">
                                      <QRCode value={ticket.qrCode} size={256} level="H" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 capitalize">
                                      {ticket.ticketType}
                                    </p>
                                    <button
                                      onClick={() => setShowQRCode(null)}
                                      className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded"
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">📋 Billing Information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Tickets are grouped by activating company</li>
            <li>Click on a company to expand and see all their tickets</li>
            <li>Use the ✕ button to delete individual tickets</li>
            <li>Validated tickets show ✓, pending show ○</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
