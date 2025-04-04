'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import Link from 'next/link';

function PreferencesContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (token) {
      fetchSubscriberData();
    } else {
      setStatus('error');
      setMessage('Invalid preferences link. Please use the link from your email.');
    }
  }, [token]);

  const fetchSubscriberData = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, name, preferences')
        .eq('preferences_token', token)
        .eq('is_subscribed', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setStatus('error');
          setMessage('Subscriber not found. Please use the link from your email.');
        } else {
          throw error;
        }
        return;
      }

      if (!data) {
        setStatus('error');
        setMessage('Subscriber not found. Please use the link from your email.');
        return;
      }

      setEmail(data.email);
      setName(data.name || '');
      setFrequency(data.preferences?.frequency || 'weekly');
      setCategories(data.preferences?.categories || []);
      setStatus('ready');
    } catch (error) {
      console.error('Error fetching subscriber data:', error);
      setStatus('error');
      setMessage('Failed to load your preferences. Please try again later.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          name,
          preferences: {
            frequency,
            categories
          }
        })
        .eq('preferences_token', token)
        .eq('is_subscribed', true);

      if (error) {
        if (error.code === 'PGRST116') {
          setStatus('error');
          setMessage('Subscriber not found. Please use the link from your email.');
        } else {
          throw error;
        }
        return;
      }

      setStatus('success');
      setMessage('Your preferences have been updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      setStatus('error');
      setMessage('Failed to update your preferences. Please try again later.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Loading your preferences...</h1>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Error</h1>
          <p className="text-gray-400 mb-6">{message}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <h1 className="text-2xl font-bold text-white mb-6">Newsletter Preferences</h1>

          {status === 'success' ? (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-6">
              {message}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categories of Interest
              </label>
              <div className="space-y-2">
                {['Technology', 'Design', 'Business', 'Marketing', 'Development'].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategories([...categories, category]);
                        } else {
                          setCategories(categories.filter(c => c !== category));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={status === 'saving'}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {status === 'saving' ? 'Saving...' : 'Save Preferences'}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Loading...</h1>
        </div>
      </div>
    }>
      <PreferencesContent />
    </Suspense>
  );
} 