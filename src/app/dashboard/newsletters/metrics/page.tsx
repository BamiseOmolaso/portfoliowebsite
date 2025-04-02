'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import { BarChart, Users, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';

interface NewsletterMetrics {
  id: string;
  subject: string;
  sent_at: string;
  total_subscribers: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  open_rate: number;
}

export default function NewsletterMetrics() {
  const [metrics, setMetrics] = useState<NewsletterMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Get all sent newsletters
      const { data: newsletters, error: newslettersError } = await supabase
        .from('newsletters')
        .select('id, subject, sent_at')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false });

      if (newslettersError) throw newslettersError;

      // Get metrics for each newsletter
      const metricsData = await Promise.all(
        newsletters.map(async (newsletter) => {
          const { data: sends, error: sendsError } = await supabase
            .from('newsletter_sends')
            .select('status')
            .eq('newsletter_id', newsletter.id);

          if (sendsError) throw sendsError;

          const total = sends.length;
          const sent = sends.filter(s => s.status === 'sent').length;
          const failed = sends.filter(s => s.status === 'failed').length;

          return {
            id: newsletter.id,
            subject: newsletter.subject,
            sent_at: newsletter.sent_at,
            total_subscribers: total,
            sent_count: sent,
            delivered_count: sent,
            failed_count: failed,
            open_rate: total > 0 ? (sent / total) * 100 : 0
          };
        })
      );

      setMetrics(metricsData);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Newsletter Metrics</h1>

      {metrics.length === 0 ? (
        <div className="text-gray-400">No newsletter metrics available yet</div>
      ) : (
        <div className="space-y-6">
          {metrics.map((metric) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-6 rounded-lg border border-gray-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{metric.subject}</h2>
                  <p className="text-gray-400 mt-1">
                    Sent: {new Date(metric.sent_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>Total Subscribers</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{metric.total_subscribers}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-5 h-5" />
                    <span>Delivered</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{metric.delivered_count}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Open Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{metric.open_rate.toFixed(1)}%</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span>Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{metric.failed_count}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 