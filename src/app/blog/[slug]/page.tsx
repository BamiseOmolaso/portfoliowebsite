'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/client-auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  meta_title: string;
  meta_description: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'scheduled';
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      if (!data) {
        notFound();
      }

      // Sanitize content
      const sanitizedContent = DOMPurify.sanitize(data.content);
      setPost({ ...data, content: sanitizedContent });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch post';
      setError(errorMessage);
      console.error('Error fetching blog post:', err);
      notFound();
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-800 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/3 mx-auto"></div>
              <div className="h-64 bg-gray-800 rounded-lg mb-8"></div>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-800 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchPost}
              className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-lg overflow-hidden shadow-xl"
        >
          {post.cover_image && (
            <div className="relative h-64">
              {isImageLoading && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse" />
              )}
              <img
                src={post.cover_image}
                alt={post.title}
                className={`w-full h-full object-cover ${isImageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />
            </div>
          )}

          <div className="p-8">
            <div className="mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors group"
              >
                <svg
                  className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Blog
              </Link>
              <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
              <div className="flex items-center text-gray-400 text-sm mb-4">
                <span>{post.author}</span>
                <span className="mx-2">•</span>
                <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
                {post.updated_at !== post.created_at && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Updated {format(new Date(post.updated_at), 'MMMM d, yyyy')}</span>
                  </>
                )}
              </div>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
} 