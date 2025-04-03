'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import { Tag, X, Plus, Download, Search } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  tags: Tag[];
}

interface Tag {
  id: string;
  name: string;
  description: string | null;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subscribers
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('newsletter_tags')
        .select('*');

      if (tagsError) throw tagsError;

      // Fetch subscriber tags
      const { data: subscriberTagsData, error: subscriberTagsError } = await supabase.from(
        'subscriber_tags'
      ).select(`
          subscriber_id,
          tag:newsletter_tags(*)
        `);

      if (subscriberTagsError) throw subscriberTagsError;

      // Map subscribers with their tags
      const subscribersWithTags = data.map(subscriber => ({
        ...subscriber,
        tags:
          subscriberTagsData?.filter(st => st.subscriber_id === subscriber.id).map(st => st.tag) ||
          [],
      }));

      setSubscribers(subscribersWithTags);
      setTags(tagsData || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName) return;

    try {
      setError(null);
      const { error } = await supabase.from('newsletter_tags').insert([
        {
          name: newTagName,
          description: newTagDescription,
        },
      ]);

      if (error) throw error;

      setNewTagName('');
      setNewTagDescription('');
      fetchData();
    } catch (err) {
      console.error('Error creating tag:', err);
      setError('Failed to create tag. Please try again.');
    }
  };

  const handleAddTag = async (subscriberId: string, tagId: string) => {
    try {
      setError(null);
      const { error } = await supabase.from('subscriber_tags').insert([
        {
          subscriber_id: subscriberId,
          tag_id: tagId,
        },
      ]);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error adding tag:', err);
      setError('Failed to add tag. Please try again.');
    }
  };

  const handleRemoveTag = async (subscriberId: string, tagId: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('subscriber_tags')
        .delete()
        .eq('subscriber_id', subscriberId)
        .eq('tag_id', tagId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error removing tag:', err);
      setError('Failed to remove tag. Please try again.');
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubscribers(prev => prev.filter(subscriber => subscriber.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting subscriber:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete subscriber');
    }
  };

  const handleExportSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers/export', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export subscribers');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export subscribers';
      console.error('Error exporting subscribers:', err);
      alert(errorMessage);
    }
  };

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(subscriber => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subscriber.email.toLowerCase().includes(searchLower) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(searchLower)) ||
      subscriber.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Loading subscribers...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">Subscribers</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search subscribers..."
              className="w-full px-4 py-2 pl-10 bg-gray-900 border border-gray-700 rounded-md text-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={handleExportSubscribers}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
          />
          <input
            type="text"
            value={newTagDescription}
            onChange={e => setNewTagDescription(e.target.value)}
            placeholder="Description (optional)"
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
          />
          <button
            onClick={handleCreateTag}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="ml-1">Add Tag</span>
          </button>
        </div>
      </div>

      {filteredSubscribers.length === 0 ? (
        <div className="text-gray-400">No subscribers found</div>
      ) : (
        <div className="space-y-4">
          {filteredSubscribers.map(subscriber => (
            <motion.div
              key={subscriber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-800"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="w-full">
                  <h2 className="text-xl font-semibold text-white">{subscriber.email}</h2>
                  {subscriber.name && <p className="text-gray-400">{subscriber.name}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    Subscribed: {new Date(subscriber.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {subscriber.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                        <button
                          onClick={() => handleRemoveTag(subscriber.id, tag.id)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleAddTag(subscriber.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-gray-800 text-white rounded-md w-full sm:w-auto"
                  >
                    <option value="">Add tag...</option>
                    {tags
                      .filter(tag => !subscriber.tags.some(t => t.id === tag.id))
                      .map(tag => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
