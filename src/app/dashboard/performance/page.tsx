'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { PerformanceMonitor } from '@/app/components/PerformanceMonitor';

interface PerformanceMetric {
  id: string;
  metrics: {
    fcp?: number;
    ttfb?: number;
    domContentLoaded?: number;
    load?: number;
  };
  url: string;
  timestamp: string;
}

interface LCPMetric {
  id: string;
  value: number;
  url: string;
  timestamp: string;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [lcpMetrics, setLcpMetrics] = useState<LCPMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: perfData, error: perfError } = await supabase
          .from('performance_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        const { data: lcpData, error: lcpError } = await supabase
          .from('lcp_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (perfError) throw perfError;
        if (lcpError) throw lcpError;

        setMetrics(perfData || []);
        setLcpMetrics(lcpData || []);
      } catch (err) {
        setError('Failed to fetch metrics');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Loading metrics...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <PerformanceMonitor />
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Performance Metrics</h1>

        {/* LCP Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Largest Contentful Paint (LCP)</h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lcpMetrics.map(metric => (
                <div key={metric.id} className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-400">URL: {metric.url}</p>
                  <p className="text-gray-400">Value: {metric.value.toFixed(2)}ms</p>
                  <p className="text-gray-400">
                    Time: {new Date(metric.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map(metric => (
                <div key={metric.id} className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-400">URL: {metric.url}</p>
                  <p className="text-gray-400">FCP: {metric.metrics.fcp?.toFixed(2) || 'N/A'}ms</p>
                  <p className="text-gray-400">
                    TTFB: {metric.metrics.ttfb?.toFixed(2) || 'N/A'}ms
                  </p>
                  <p className="text-gray-400">
                    DOM Content Loaded: {metric.metrics.domContentLoaded?.toFixed(2) || 'N/A'}ms
                  </p>
                  <p className="text-gray-400">
                    Load: {metric.metrics.load?.toFixed(2) || 'N/A'}ms
                  </p>
                  <p className="text-gray-400">
                    Time: {new Date(metric.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
