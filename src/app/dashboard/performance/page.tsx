'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PerformanceMetrics {
  dnsLookup: number;
  tcpConnection: number;
  serverResponse: number;
  domProcessing: number;
  pageLoad: number;
  domContentLoaded: number;
  domInteractive: number;
  loadEventEnd: number;
}

interface LCPMetrics {
  value: number;
  url: string;
  timestamp: string;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [lcpMetrics, setLcpMetrics] = useState<LCPMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMetrics() {
      try {
        const { data: performanceData, error: perfError } = await supabase
          .from('performance_metrics')
          .select('metrics, timestamp')
          .order('timestamp', { ascending: false })
          .limit(100);

        const { data: lcpData, error: lcpError } = await supabase
          .from('lcp_metrics')
          .select('value, url, timestamp')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (perfError || lcpError) {
          throw new Error(perfError?.message || lcpError?.message);
        }

        if (mounted) {
          setMetrics(performanceData.map(item => item.metrics));
          setLcpMetrics(lcpData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-4">Loading performance metrics...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Performance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Page Load Metrics</h2>
          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={index} className="border-b pb-2">
                <p>DNS Lookup: {metric.dnsLookup}ms</p>
                <p>TCP Connection: {metric.tcpConnection}ms</p>
                <p>Server Response: {metric.serverResponse}ms</p>
                <p>DOM Processing: {metric.domProcessing}ms</p>
                <p>Page Load: {metric.pageLoad}ms</p>
                <p>DOM Content Loaded: {metric.domContentLoaded}ms</p>
                <p>DOM Interactive: {metric.domInteractive}ms</p>
                <p>Load Event End: {metric.loadEventEnd}ms</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">LCP Metrics</h2>
          <div className="space-y-2">
            {lcpMetrics.map((metric, index) => (
              <div key={index} className="border-b pb-2">
                <p>URL: {metric.url}</p>
                <p>LCP: {metric.value}ms</p>
                <p>Timestamp: {new Date(metric.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 