'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import Editor from '@/app/components/Editor';
import { createBrowserClient } from '@/lib/client-auth';
import { slugify } from '@/lib/utils';

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

interface ValidationErrors {
  title?: string;
  slug?: string;
  content?: string;
  cover_image?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
}

export default function NewBlogPost() {
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validatePost = useCallback((post: BlogPost): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!post.title.trim()) {
      errors.title = 'Title is required';
    } else if (post.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    if (!post.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(post.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    } else if (post.slug.length > 100) {
      errors.slug = 'Slug must be less than 100 characters';
    }

    if (!post.content.trim()) {
      errors.content = 'Content is required';
    } else if (post.content.length > 10000) {
      errors.content = 'Content must be less than 10000 characters';
    }

    if (post.cover_image && !/^https?:\/\/.+/.test(post.cover_image)) {
      errors.cover_image = 'Cover image must be a valid URL';
    }

    if (post.excerpt && post.excerpt.length > 200) {
      errors.excerpt = 'Excerpt must be less than 200 characters';
    }

    if (post.meta_title && post.meta_title.length > 60) {
      errors.meta_title = 'Meta title must be less than 60 characters';
    }

    if (post.meta_description && post.meta_description.length > 160) {
      errors.meta_description = 'Meta description must be less than 160 characters';
    }

    return errors;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    const errors = validatePost(post);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient();
      const postData = {
        ...post,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        published_at: post.status === 'published' ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select();

      if (error) throw error;

      router.push('/admin/blog');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save post';
      setError(errorMessage);
      console.error('Error saving post:', err);
    } finally {
      setLoading(false);
    }
  }, [post, router, validatePost]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);

    // Auto-generate slug from title
    if (name === 'title') {
      setPost(prev => ({ ...prev, slug: slugify(value) }));
    }
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setPost(prev => ({ ...prev, content }));
    setIsDirty(true);
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !post.tags.includes(trimmedTag)) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setNewTag('');
      setIsDirty(true);
    }
  }, [newTag, post.tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
    setIsDirty(true);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setPost(prev => ({
      ...prev,
      status: value as BlogPost['status'],
    }));
    setIsDirty(true);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">New Blog Post</h1>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {isPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {isPreview ? (
            <div className="prose prose-invert max-w-none">
              <h1>{post.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={post.title}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.title ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-300">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={post.slug}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.slug ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {validationErrors.slug && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.slug}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    id="excerpt"
                    rows={3}
                    value={post.excerpt}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                    Content
                  </label>
                  <Editor
                    content={post.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your blog post..."
                    onPreview={() => setIsPreview(!isPreview)}
                    className={`mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.content ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.content && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.content}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cover_image" className="block text-sm font-medium text-gray-300">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    name="cover_image"
                    id="cover_image"
                    value={post.cover_image}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.cover_image ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.cover_image && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.cover_image}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-300">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    id="meta_title"
                    value={post.meta_title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-300">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    id="meta_description"
                    rows={3}
                    value={post.meta_description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-300">
                    Tags
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
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
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={post.status}
                    onChange={handleStatusChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Post'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
} 