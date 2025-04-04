'use client';

import { useState, useEffect } from 'react';

export default function EmailAuthPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDnsRecords, setShowDnsRecords] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/email-auth');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setError('Failed to fetch status');
    }
  };

  const setupAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/email-auth', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setStatus(data);
        setShowDnsRecords(true);
      } else {
        setError(data.error || 'Failed to set up authentication');
      }
    } catch (error) {
      setError('Failed to set up authentication');
    }
    setLoading(false);
  };

  const verifyAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/email-auth', {
        method: 'PUT',
      });
      const data = await response.json();
      if (response.ok) {
        await fetchStatus();
      } else {
        setError(data.error || 'Failed to verify authentication');
      }
    } catch (error) {
      setError('Failed to verify authentication');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Email Authentication
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage SPF, DKIM, and DMARC settings for your domain
          </p>
        </div>

        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {status ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
                  <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">SPF</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {status.spf ? '✅ Configured' : '❌ Not Configured'}
                      </dd>
                    </div>
                    <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">DKIM</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {status.dkim ? '✅ Configured' : '❌ Not Configured'}
                      </dd>
                    </div>
                    <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">DMARC</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {status.dmarc ? '✅ Configured' : '❌ Not Configured'}
                      </dd>
                    </div>
                    <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Overall Status</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {status.status === 'verified' ? '✅ Verified' : '⚠️ Pending'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {status.status !== 'verified' && (
                  <div className="space-y-4">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={setupAuth}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {loading ? 'Setting up...' : 'Set Up Authentication'}
                      </button>
                      <button
                        type="button"
                        onClick={verifyAuth}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {loading ? 'Verifying...' : 'Verify Authentication'}
                      </button>
                    </div>

                    {showDnsRecords && status.dnsRecords && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">DNS Records to Add</h4>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-700">SPF Record</h5>
                            <div className="mt-2 bg-white p-3 rounded border border-gray-200">
                              <code className="text-sm">{status.dnsRecords.spf}</code>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-700">DKIM Records</h5>
                            <div className="mt-2 space-y-2">
                              {status.dnsRecords.dkim.map((record: any, index: number) => (
                                <div key={index} className="bg-white p-3 rounded border border-gray-200">
                                  <code className="text-sm">{record}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-700">DMARC Record</h5>
                            <div className="mt-2 bg-white p-3 rounded border border-gray-200">
                              <code className="text-sm">{status.dnsRecords.dmarc}</code>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          <p>Add these records to your domain's DNS settings. After adding the records, click "Verify Authentication" to check if everything is working.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  onClick={setupAuth}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Setting up...' : 'Set Up Email Authentication'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 