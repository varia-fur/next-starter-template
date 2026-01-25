'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';

interface Company {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  active: boolean;
}

export default function CompanyManagement() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = (await response.json()) as Company[];
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCompanyName }),
      });

      if (!response.ok) throw new Error('Failed to create company');

      const company = (await response.json()) as Company;
      setCompanies([...companies, company]);
      setNewCompanyName('');
      setShowQRCode(company.id); // Auto-show QR code
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!window.confirm(`Delete company "${name}" and all its tickets?`)) return;

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete company');

      setCompanies(companies.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (!window.confirm('Regenerate API key? Old key will no longer work.')) return;

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate-key' }),
      });

      if (!response.ok) throw new Error('Failed to regenerate key');

      const updatedCompany = (await response.json()) as Company;
      setCompanies(companies.map((c) => (c.id === id ? updatedCompany : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate key');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    setCopying(id);
    try {
      await navigator.clipboard.writeText(text);
      setTimeout(() => setCopying(null), 2000);
    } catch (err) {
      setCopying(null);
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
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="mb-6 flex items-center text-slate-700 hover:text-slate-900 font-semibold transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold text-center mb-2 text-slate-900">
          🏢 Company Management
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create and manage API keys for scanner devices
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Create Company */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Company</h2>
          <form onSubmit={handleCreateCompany} className="flex gap-4">
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="Enter company name..."
              disabled={creating}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={creating || !newCompanyName.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
            >
              {creating ? 'Creating...' : 'Create Company'}
            </button>
          </form>
        </div>

        {/* Companies List */}
        {companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No companies created yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-600">
                        Created {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowQRCode(showQRCode === company.id ? null : company.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
                      >
                        QR Code
                      </button>
                      <button
                        onClick={() => handleRegenerateKey(company.id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded transition"
                      >
                        🔄 Regenerate Key
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id, company.name)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Key Display */}
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 mb-2">API Key:</p>
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <code className="font-mono text-sm flex-1 break-all">{company.apiKey}</code>
                    <button
                      onClick={() => copyToClipboard(company.apiKey, company.id)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded text-sm transition"
                    >
                      {copying === company.id ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* QR Code Modal */}
                {showQRCode === company.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 max-w-sm w-full">
                      <h3 className="text-xl font-bold text-center mb-4">{company.name}</h3>
                      <div className="bg-white p-4 border-2 border-gray-300 rounded flex justify-center mb-4">
                        <QRCode
                          value={JSON.stringify({
                            companyName: company.name,
                            apiKey: company.apiKey,
                          })}
                          size={256}
                          level="H"
                        />
                      </div>
                      <p className="text-xs text-center text-gray-600 mb-4">
                        Scan this QR code on the activation scanner
                      </p>
                      <button
                        onClick={() => setShowQRCode(null)}
                        className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">📋 How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Create a company - an API key is automatically generated</li>
            <li>Share the QR code with the scanner operator</li>
            <li>Scanner scans QR code to auto-fill company name and key</li>
            <li>Regenerate key anytime - old key stops working immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
