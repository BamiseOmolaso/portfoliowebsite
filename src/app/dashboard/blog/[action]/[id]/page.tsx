'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import Editor from '@/app/components/Editor';
import { motion } from 'framer-motion';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  meta_title: string;
  meta_description: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function BlogPostForm({ params }: { params: { action: string; id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image: '',
    meta_title: '',
    meta_description: '',
    tags: [],
    author: 'Bamise',
    status: 'draft',
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (params.action === 'edit' && params.id) {
      fetchPost();
    }

    // Test Supabase connection when component mounts
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

        const { data, error } = await supabase.from('blog_posts').select('count').limit(1);

        if (error) {
          console.error('Supabase connection error:', error);
          setError('Database connection error: ' + error.message);
          return;
        }

        console.log('Supabase connection successful!');
      } catch (err) {
        console.error('Connection test error:', err);
        setError('Connection test error: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    testConnection();
  }, []);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      setError('Failed to fetch post');
      console.error('Error fetching post:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Log the environment variables (without the key)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Environment check:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });

      // Validate required fields
      if (!post.title || !post.slug || !post.content) {
        throw new Error('Title, slug, and content are required');
      }

      const postData = {
        ...post,
        updated_at: new Date().toISOString(),
        created_at: params.action === 'new' ? new Date().toISOString() : post.created_at,
        status: post.status || 'draft',
        tags: post.tags || [],
        author: post.author || 'Bamise',
        content: post.content || '',
        excerpt: post.excerpt || '',
        cover_image: post.cover_image || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
      };

      console.log('Saving post data:', postData);

      if (params.action === 'new') {
        console.log('Creating new post...');
        const { data, error } = await supabase.from('blog_posts').insert([postData]).select();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        console.log('Created post:', data);
      } else {
        console.log('Updating post...');
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', params.id)
          .select();

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        console.log('Updated post:', data);
      }

      router.push('/dashboard/blog');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save post';
      setError(errorMessage);
      console.error('Error saving post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setPost(prev => ({ ...prev, content }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) throw error;
      router.push('/dashboard/blog');
    } catch (err) {
      setError('Failed to publish post');
      console.error('Error publishing post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {params.action === 'new' ? 'New Blog Post' : 'Edit Blog Post'}
            </h1>
            {params.action === 'edit' && (
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Publish
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={post.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={post.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="cover_image"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Cover Image URL
                </label>
                <input
                  type="text"
                  id="cover_image"
                  name="cover_image"
                  value={post.cover_image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={post.author}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={post.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="published_at"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Publish Date
                </label>
                <input
                  type="datetime-local"
                  id="published_at"
                  name="published_at"
                  value={post.published_at || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={post.excerpt}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={post.meta_title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="meta_description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={post.meta_description}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-indigo-600 hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <Editor
                  content={post.content}
                  onChange={handleContentChange}
                  onSave={() => handleSubmit}
                  onPreview={() => setIsPreview(!isPreview)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/blog')}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
