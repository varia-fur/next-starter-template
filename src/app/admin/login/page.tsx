'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Store password in cookie
      document.cookie = `admin-auth=${password}; path=/; max-age=86400`; // 24 hours

      // Verify password by fetching a protected resource
      const response = await fetch('/api/companies', {
        method: 'GET',
        headers: {
          'x-admin-password': password,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError('Invalid password');
        // Clear cookie on failed login
        document.cookie = 'admin-auth=; path=/; max-age=0';
        setLoading(false);
        return;
      }

      // Login successful
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
      document.cookie = 'admin-auth=; path=/; max-age=0';
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-indigo-900">
          🔐 Admin Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Butterfly House Ticket System
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Info:</p>
          <p>Set your admin password in the <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file:</p>
          <code className="block bg-blue-100 px-2 py-1 rounded mt-2 text-xs">
            NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
          </code>
        </div>
      </div>
    </div>
  );
}
