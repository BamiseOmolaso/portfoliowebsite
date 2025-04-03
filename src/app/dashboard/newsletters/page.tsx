'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (err) {
      setError('Failed to fetch newsletters');
      console.error('Error fetching newsletters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async (id: string) => {
    if (!confirm('Are you sure you want to send this newsletter now?')) return;

    try {
      const response = await fetch('/api/newsletters/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId: id,
          tags: [], // Optional: pass tags if you want to filter subscribers
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send newsletter');
      }

      // Refresh the newsletters list
      fetchNewsletters();
    } catch (err) {
      console.error('Error sending newsletter:', err);
      alert(err instanceof Error ? err.message : 'Failed to send newsletter. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Loading newsletters...</h1>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Newsletters</h1>
        <Link
          href="/dashboard/newsletters/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Create Newsletter
        </Link>
      </div>

      {newsletters.length === 0 ? (
        <div className="text-gray-400">No newsletters yet</div>
      ) : (
        <div className="space-y-4">
          {newsletters.map(newsletter => (
            <motion.div
              key={newsletter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-6 rounded-lg border border-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-white">{newsletter.subject}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created: {new Date(newsletter.created_at).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      {newsletter.status === 'sent' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Sent: {new Date(newsletter.sent_at!).toLocaleString()}
                        </>
                      ) : newsletter.status === 'scheduled' ? (
                        <>
                          <Clock className="w-4 h-4 text-yellow-500" />
                          Scheduled: {new Date(newsletter.scheduled_for!).toLocaleString()}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-gray-500" />
                          Draft
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/newsletters/edit/${newsletter.id}`}
                    className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </Link>
                  {newsletter.status === 'draft' && (
                    <button
                      onClick={() => handleSendNow(newsletter.id)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                      Send Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
