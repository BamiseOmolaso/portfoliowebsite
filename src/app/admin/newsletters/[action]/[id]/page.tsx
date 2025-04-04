'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Editor from '@/app/components/Editor';
import { Calendar } from 'lucide-react';
import { NewsletterFormData } from '@/types/newsletter';

export default function NewsletterForm({ params }: { params: { action: string; id: string } }) {
  const router = useRouter();
  const [newsletter, setNewsletter] = useState<NewsletterFormData>({
    subject: '',
    content: '',
    status: 'draft',
    scheduled_for: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (params.action === 'edit' && params.id) {
      fetchNewsletter();
    }
  }, [params.action, params.id]);

  const fetchNewsletter = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setNewsletter(data);
      if (data.scheduled_for) {
        setShowSchedule(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch newsletter';
      setError(errorMessage);
      console.error('Error fetching newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!newsletter.subject || !newsletter.content) {
        throw new Error('Subject and content are required');
      }

      const newsletterData = {
        ...newsletter,
        updated_at: new Date().toISOString(),
        created_at: params.action === 'new' ? new Date().toISOString() : newsletter.created_at || new Date().toISOString(),
      };

      if (params.action === 'new') {
        const { error } = await supabase.from('newsletters').insert([newsletterData]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('newsletters')
          .update(newsletterData)
          .eq('id', params.id);

        if (error) throw error;
      }

      router.push('/admin/newsletters');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save newsletter';
      setError(errorMessage);
      console.error('Error saving newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleToggle = () => {
    setShowSchedule(!showSchedule);
    if (!showSchedule) {
      // Set default scheduled time to tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setNewsletter(prev => ({
        ...prev,
        status: 'scheduled',
        scheduled_for: tomorrow.toISOString(),
      }));
    } else {
      setNewsletter(prev => ({
        ...prev,
        status: 'draft',
        scheduled_for: null,
      }));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">
        {params.action === 'new' ? 'New Newsletter' : 'Edit Newsletter'}
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={newsletter.subject}
            onChange={e => setNewsletter(prev => ({ ...prev, subject: e.target.value }))}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
          <Editor
            content={newsletter.content}
            onChange={content => setNewsletter(prev => ({ ...prev, content }))}
            placeholder="Write your newsletter content here..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleScheduleToggle}
            className={`flex items-center px-4 py-2 rounded-md ${
              showSchedule ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'
            } transition-colors`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showSchedule ? 'Cancel Schedule' : 'Schedule Send'}
          </button>

          {showSchedule && (
            <input
              type="datetime-local"
              value={
                newsletter.scheduled_for
                  ? new Date(newsletter.scheduled_for).toISOString().slice(0, 16)
                  : ''
              }
              onChange={e =>
                setNewsletter(prev => ({
                  ...prev,
                  status: 'scheduled',
                  scheduled_for: new Date(e.target.value).toISOString(),
                }))
              }
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/newsletters')}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
