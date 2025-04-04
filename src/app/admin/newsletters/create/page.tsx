'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function CreateNewsletterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipients: 'all' // Default to all subscribers
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, get the list of recipients based on the selection
      let recipientsQuery = supabase
        .from('subscribers')
        .select('email');

      if (formData.recipients !== 'all') {
        recipientsQuery = recipientsQuery.eq('status', formData.recipients);
      }

      const { data: subscribers, error: subscribersError } = await recipientsQuery;

      if (subscribersError) throw subscribersError;

      // Create the newsletter
      const { data: newsletter, error: newsletterError } = await supabase
        .from('newsletters')
        .insert([
          {
            subject: formData.subject,
            content: formData.content,
            status: 'draft',
            recipients_count: subscribers?.length || 0
          }
        ])
        .select()
        .single();

      if (newsletterError) throw newsletterError;

      // Redirect to the newsletters list page
      router.push('/admin/newsletters');
    } catch (error) {
      console.error('Error creating newsletter:', error);
      setError('Failed to create newsletter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Create Newsletter</h2>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                Content
              </label>
              <textarea
                id="content"
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="recipients" className="block text-sm font-medium text-gray-300">
                Recipients
              </label>
              <select
                id="recipients"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              >
                <option value="all">All Subscribers</option>
                <option value="active">Active Subscribers</option>
                <option value="inactive">Inactive Subscribers</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/newsletters')}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Newsletter'}
          </button>
        </div>
      </form>
    </div>
  );
} 