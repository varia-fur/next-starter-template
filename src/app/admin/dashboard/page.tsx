'use client';

import React, { useState, useEffect } from 'react';

interface Stats {
  totalTickets: number;
  activatedTickets: number;
  validatedTickets: number;
  activationLogs: number;
  validationLogs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/tickets/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = (await response.json()) as Stats;
      console.log('📊 Stats:', data);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-900">
          📊 Butterfly House Admin Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Real-time ticket system monitoring
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-900">
                {stats.totalTickets}
              </div>
              <div className="text-blue-700 font-semibold">Total Tickets</div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-yellow-900">
                {stats.activatedTickets}
              </div>
              <div className="text-yellow-700 font-semibold">Activated</div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-900">
                {stats.validatedTickets}
              </div>
              <div className="text-green-700 font-semibold">Validated</div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-purple-900">
                {stats.activationLogs}
              </div>
              <div className="text-purple-700 font-semibold">Activation Logs</div>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-indigo-900">
                {stats.validationLogs}
              </div>
              <div className="text-indigo-700 font-semibold">Validation Logs</div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <a
            href="/admin/company-management"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-3xl mb-2">🏢</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Companies
            </h3>
            <p className="text-sm text-gray-600">
              Manage API keys
            </p>
          </a>

          <a
            href="/admin/create-tickets"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-3xl mb-2">🎫</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Create
            </h3>
            <p className="text-sm text-gray-600">
              Single tickets
            </p>
          </a>

          <a
            href="/admin/bulk-create"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-3xl mb-2">📦</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Bulk Create
            </h3>
            <p className="text-sm text-gray-600">
              Multiple tickets
            </p>
          </a>

          <a
            href="/scanner/activation"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-3xl mb-2">✍️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Activate
            </h3>
            <p className="text-sm text-gray-600">
              Company activation
            </p>
          </a>

          <a
            href="/scanner/validation"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-3xl mb-2">✓</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Validate
            </h3>
            <p className="text-sm text-gray-600">Check validity</p>
          </a>

          <a
            href="/admin/billing"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-3xl mb-2">💳</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Billing
            </h3>
            <p className="text-sm text-gray-600">
              By company
            </p>
          </a>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📋 System Information
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              ✓ <strong>Durable Objects Storage:</strong> All tickets and logs
              are stored in Cloudflare Durable Objects
            </li>
            <li>
              ✓ <strong>Real-time Tracking:</strong> Activation and validation
              events are logged in real-time
            </li>
            <li>
              ✓ <strong>Duplicate Prevention:</strong> Tickets can only be
              validated once
            </li>
            <li>
              ✓ <strong>Company Tracking:</strong> Activation logs record which
              company activated each ticket
            </li>
            <li>
              ✓ <strong>Location Tracking:</strong> Validation logs can record
              scanner location
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
