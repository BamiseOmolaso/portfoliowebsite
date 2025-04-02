'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill with no SSR
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
}

export default function BlogPostForm({
  params,
}: {
  params: { action: string; id: string };
}) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (params.action === 'edit' && params.id) {
      fetchPost();
    }
  }, [params.action, params.id]);

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
      if (params.action === 'new') {
        const { error } = await supabase
          .from('blog_posts')
          .insert([{ ...post, created_at: new Date().toISOString() }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update({ ...post, updated_at: new Date().toISOString() })
          .eq('id', params.id);

        if (error) throw error;
      }

      router.push('/dashboard/blog');
    } catch (err) {
      setError('Failed to save post');
      console.error('Error saving post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setPost((prev) => ({ ...prev, content }));
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          {params.action === 'new' ? 'New Blog Post' : 'Edit Blog Post'}
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <div className="bg-white">
              <ReactQuill
                value={post.content}
                onChange={handleContentChange}
                className="h-96 mb-12"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={post.published}
              onChange={(e) => setPost((prev) => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-300">
              Published
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/blog')}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 