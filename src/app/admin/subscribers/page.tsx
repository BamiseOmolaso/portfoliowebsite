'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  is_subscribed: boolean;
  unsubscribe_reason: string | null;
  unsubscribe_feedback: string | null;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'subscribed' && subscriber.is_subscribed) || 
      (filter === 'unsubscribed' && !subscriber.is_subscribed);
    
    const matchesSearch = 
      !searchTerm || 
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getReasonText = (reason: string | null) => {
    if (!reason) return 'N/A';
    const reasons: Record<string, string> = {
      too_many_emails: 'Too many emails',
      not_relevant: 'Content not relevant',
      not_interesting: 'Content not interesting',
      other: 'Other reason'
    };
    return reasons[reason] || reason;
  };

  const exportToCSV = () => {
    try {
      setExporting(true);
      
      // Create CSV headers
      const headers = [
        'Email',
        'Name',
        'Status',
        'Unsubscribe Reason',
        'Feedback',
        'Subscribed On'
      ];
      
      // Convert subscribers to CSV rows
      const rows = filteredSubscribers.map(subscriber => [
        subscriber.email,
        subscriber.name || 'N/A',
        subscriber.is_subscribed ? 'Subscribed' : 'Unsubscribed',
        getReasonText(subscriber.unsubscribe_reason),
        subscriber.unsubscribe_feedback || 'N/A',
        new Date(subscriber.created_at).toLocaleDateString()
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(cell => 
            // Escape quotes and wrap cells with commas in quotes
            typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
              ? `"${cell.replace(/"/g, '""')}"` 
              : cell
          ).join(',')
        )
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `subscribers-${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setExporting(false), 1000);
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
        <div className="h-12 bg-gray-800 rounded mb-6"></div>
        <div className="h-64 bg-gray-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-white mb-8">Newsletter Subscribers</h1>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All ({subscribers.length})
            </button>
            <button
              onClick={() => setFilter('subscribed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'subscribed' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Subscribed ({subscribers.filter(s => s.is_subscribed).length})
            </button>
            <button
              onClick={() => setFilter('unsubscribed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'unsubscribed' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Unsubscribed ({subscribers.filter(s => !s.is_subscribed).length})
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {filteredSubscribers.length > 0 ? (
          <>
            {/* Desktop table view - hidden on small screens */}
            <div className="hidden md:block">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden"
              >
                <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  <table className="w-full table-fixed divide-y divide-gray-800">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[25%]">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%]">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[12%]">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[18%]">Unsubscribe Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[20%]">Feedback</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">Subscribed On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-900">
                      {filteredSubscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-gray-800">
                          <td className="px-6 py-4 text-sm text-gray-200">
                            <div className="break-all">
                              {subscriber.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-200">
                            <div className="break-words">
                              {subscriber.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              subscriber.is_subscribed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                              {subscriber.is_subscribed ? 'Subscribed' : 'Unsubscribed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-200">
                            <div className="break-words">
                              {getReasonText(subscriber.unsubscribe_reason)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-200">
                            <div className="break-words">
                              {subscriber.unsubscribe_feedback || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-200">
                            {new Date(subscriber.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gray-800 px-6 py-3 flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Showing {filteredSubscribers.length} of {subscribers.length} subscribers
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={exportToCSV}
                      disabled={exporting || filteredSubscribers.length === 0}
                      className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      {exporting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 12.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Export CSV
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Mobile card view - visible only on small screens */}
            <div className="md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {filteredSubscribers.map((subscriber) => (
                  <div 
                    key={subscriber.id} 
                    className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-4 hover:bg-gray-850 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-gray-200 font-medium break-all pr-2">{subscriber.email}</div>
                      <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${
                        subscriber.is_subscribed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {subscriber.is_subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-gray-400">Name:</p>
                        <p className="text-gray-200 break-words">{subscriber.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Subscribed On:</p>
                        <p className="text-gray-200">{new Date(subscriber.created_at).toLocaleDateString()}</p>
                      </div>
                      
                      {!subscriber.is_subscribed && (
                        <>
                          <div className="col-span-2">
                            <p className="text-gray-400">Unsubscribe Reason:</p>
                            <p className="text-gray-200 break-words">{getReasonText(subscriber.unsubscribe_reason)}</p>
                          </div>
                          {subscriber.unsubscribe_feedback && (
                            <div className="col-span-2">
                              <p className="text-gray-400">Feedback:</p>
                              <p className="text-gray-200 break-words">{subscriber.unsubscribe_feedback}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="bg-gray-800 rounded-lg px-4 py-3 flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Showing {filteredSubscribers.length} of {subscribers.length}
                  </p>
                  <button 
                    onClick={exportToCSV}
                    disabled={exporting || filteredSubscribers.length === 0}
                    className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    {exporting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting...
                      </>
                    ) : "Export"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 text-center text-gray-400">
            No subscribers found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
} 