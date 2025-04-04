'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface NewsletterMetrics {
  id: string;
  subject: string;
  sent_at: string;
  recipients_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribes: number;
}

export default function PerformancePage() {
  const [activeView, setActiveView] = useState<'newsletters' | 'campaigns'>('newsletters');
  const [metrics, setMetrics] = useState<NewsletterMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      let query = supabase
        .from('newsletter_metrics')
        .select('*')
        .order('sent_at', { ascending: false });

      if (timeRange !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
          case '24h':
            startDate.setHours(now.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        }

        query = query.gte('sent_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setMetrics(data || []);
    } catch (error) {
      setError('Failed to fetch metrics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (field: keyof NewsletterMetrics) => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => {
      const value = metric[field];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    return (sum / metrics.length).toFixed(1);
  };

  const calculateUnsubscribeRate = () => {
    if (metrics.length === 0) return 0;
    const totalUnsubscribes = metrics.reduce((acc, metric) => acc + metric.unsubscribes, 0);
    const totalRecipients = metrics.reduce((acc, metric) => acc + metric.recipients_count, 0);
    return totalRecipients > 0 ? ((totalUnsubscribes / totalRecipients) * 100).toFixed(1) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Performance</h2>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView('newsletters')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'newsletters'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Newsletters
            </button>
            <button
              onClick={() => setActiveView('campaigns')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'campaigns'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Campaigns
            </button>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-md bg-red-500/10 border border-red-500 p-4"
        >
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-400">{error}</h3>
            </div>
          </div>
        </motion.div>
      )}

      {activeView === 'newsletters' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-300">Open Rate</h3>
              <p className="text-3xl font-bold text-white mt-2">{calculateAverage('open_rate')}%</p>
              <p className="text-sm text-gray-400 mt-2">Average open rate</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-300">Click Rate</h3>
              <p className="text-3xl font-bold text-white mt-2">{calculateAverage('click_rate')}%</p>
              <p className="text-sm text-gray-400 mt-2">Average click rate</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-300">Unsubscribe Rate</h3>
              <p className="text-3xl font-bold text-white mt-2">{calculateUnsubscribeRate()}%</p>
              <p className="text-sm text-gray-400 mt-2">Total unsubscribe rate</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Recent Newsletter Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Newsletter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Opens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Unsubscribes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {metrics.map((metric) => (
                    <tr key={metric.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{metric.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(metric.sent_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {metric.open_rate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {metric.click_rate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {metric.unsubscribes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-300">Conversion Rate</h3>
              <p className="text-3xl font-bold text-white mt-2">8.5%</p>
              <p className="text-sm text-green-400 mt-2">↑ +1.2% from last month</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-300">ROI</h3>
              <p className="text-3xl font-bold text-white mt-2">245%</p>
              <p className="text-sm text-green-400 mt-2">↑ +15% from last month</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-300">Cost per Conversion</h3>
              <p className="text-3xl font-bold text-white mt-2">$12.50</p>
              <p className="text-sm text-green-400 mt-2">↓ -$2.30 from last month</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Recent Campaign Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Spend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Conversions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ROI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Summer Sale</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">$2,500</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">245</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">280%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Product Launch</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">$5,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">420</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">210%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 