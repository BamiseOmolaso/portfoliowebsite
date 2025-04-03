'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { Helmet } from 'react-helmet';
import DOMPurify from 'isomorphic-dompurify';

interface Project {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  meta_title: string;
  meta_description: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchProject();
  }, [params.slug]);

  const fetchProject = async () => {
    try {
      if (!params.slug) {
        setError('Invalid project URL');
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError(supabaseError.message);
        return;
      }

      if (!data) {
        setError('Project not found');
        return;
      }
      
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sanitizedContent = project ? DOMPurify.sanitize(project.content) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-800 rounded w-3/4"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              <div className="h-4 bg-gray-800 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">404 - Project Not Found</h1>
          <p className="text-gray-400 mb-8">The project you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {project && (
        <Helmet>
          <title>{project.meta_title || project.title}</title>
          <meta name="description" content={project.meta_description || project.excerpt} />
          <meta property="og:title" content={project.meta_title || project.title} />
          <meta property="og:description" content={project.meta_description || project.excerpt} />
          <meta property="og:image" content={project.cover_image} />
          <meta property="og:type" content="article" />
        </Helmet>
      )}
      <div className="min-h-screen bg-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-8">{project.title}</h1>

            <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={project.cover_image}
                alt={project.title}
                fill
                className="object-cover"
                loading="eager"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.svg';
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.technologies.map(tech => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>

            {(project.github_url || project.live_url) && (
              <div className="flex gap-4 mb-8">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View on GitHub
                  </a>
                )}
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Live Demo
                  </a>
                )}
              </div>
            )}

            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
} 