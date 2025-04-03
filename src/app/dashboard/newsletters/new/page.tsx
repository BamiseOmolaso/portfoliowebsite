'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Editor from '@/app/components/Editor';
import { Calendar, Send, Tag } from 'lucide-react';

interface Newsletter {
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null;
}

interface Tag {
  id: string;
  name: string;
}

export default function NewNewsletter() {
  const router = useRouter();
  const [newsletter, setNewsletter] = useState<Newsletter>({
    subject: '',
    content: '',
    status: 'draft',
    scheduled_for: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase.from('newsletter_tags').select('*');

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tags';
      console.error('Error fetching tags:', err);
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('newsletters').insert([newsletter]);

      if (insertError) throw insertError;
      router.push('/dashboard/newsletters');
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

  const handleSendNow = async () => {
    if (!confirm('Are you sure you want to send this newsletter now?')) return;

    setLoading(true);
    setError(null);

    try {
      // First save the newsletter
      const { data, error: insertError } = await supabase
        .from('newsletters')
        .insert([{ ...newsletter, status: 'draft' }])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!data) throw new Error('Failed to save newsletter');

      // Then send it
      const response = await fetch('/api/newsletters/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId: data.id,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send newsletter');
      }

      // Update the newsletter status to sent
      const { error: updateError } = await supabase
        .from('newsletters')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', data.id);

      if (updateError) throw updateError;

      router.push('/dashboard/newsletters');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send newsletter';
      setError(errorMessage);
      console.error('Error sending newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">New Newsletter</h1>

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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Send to Subscribers with Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Tag className="w-3 h-3" />
                {tag.name}
              </button>
            ))}
          </div>
          {selectedTags.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">
              No tags selected. Newsletter will be sent to all subscribers.
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
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

          <button
            type="button"
            onClick={handleSendNow}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Now
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/newsletters')}
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
