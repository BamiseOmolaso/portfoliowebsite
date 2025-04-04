'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface PerformanceMetric {
  id: string;
  page: string;
  load_time: number;
  created_at: string;
}

export default function WebsitePerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply time range filter
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
        default:
          startDate.setDate(now.getDate() - 7);
      }

      query = query.gte('created_at', startDate.toISOString());

      const { data, error } = await query;

      if (error) throw error;

      setMetrics(data || []);
    } catch (error) {
      setError('Failed to fetch performance metrics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageLoadTime = () => {
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, metric) => sum + metric.load_time, 0);
    return (total / metrics.length).toFixed(2);
  };

  const getSlowestPage = () => {
    if (metrics.length === 0) return null;
    return metrics.reduce((slowest, current) => 
      current.load_time > slowest.load_time ? current : slowest
    );
  };

  const getFastestPage = () => {
    if (metrics.length === 0) return null;
    return metrics.reduce((fastest, current) => 
      current.load_time < fastest.load_time ? current : fastest
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Website Performance</h1>
            <p className="mt-2 text-sm text-gray-400">
              Monitor your website's performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/performance"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              View Newsletter Metrics
            </Link>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-32 rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg shadow border border-gray-800 p-6"
          >
            <h3 className="text-sm font-medium text-gray-400">Average Load Time</h3>
            <p className="mt-2 text-3xl font-semibold text-white">
              {getAverageLoadTime()}ms
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-lg shadow border border-gray-800 p-6"
          >
            <h3 className="text-sm font-medium text-gray-400">Slowest Page</h3>
            <p className="mt-2 text-3xl font-semibold text-white">
              {getSlowestPage()?.load_time.toFixed(2)}ms
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {getSlowestPage()?.page}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg shadow border border-gray-800 p-6"
          >
            <h3 className="text-sm font-medium text-gray-400">Fastest Page</h3>
            <p className="mt-2 text-3xl font-semibold text-white">
              {getFastestPage()?.load_time.toFixed(2)}ms
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {getFastestPage()?.page}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900 rounded-lg shadow border border-gray-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Load Time (ms)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {metrics.map((metric) => (
                  <tr key={metric.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {metric.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {metric.load_time.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(metric.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 