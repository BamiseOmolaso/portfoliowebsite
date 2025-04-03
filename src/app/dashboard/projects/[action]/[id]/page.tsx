'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import Editor from '@/app/components/Editor';
import { motion } from 'framer-motion';

interface Project {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  meta_title: string;
  meta_description: string;
  technologies: string[];
  github_url: string;
  live_url: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProjectForm({ params }: { params: { action: string; id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image: '',
    meta_title: '',
    meta_description: '',
    technologies: [],
    github_url: '',
    live_url: '',
    author: 'Bamise',
    status: 'draft',
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTech, setNewTech] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (params.action === 'edit' && params.id) {
      fetchProject();
    }
  }, [params.action, params.id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      setError('Failed to fetch project');
      console.error('Error fetching project:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!project.title || !project.slug || !project.content) {
        throw new Error('Title, slug, and content are required');
      }

      const projectData = {
        ...project,
        updated_at: new Date().toISOString(),
        created_at: params.action === 'new' ? new Date().toISOString() : project.created_at,
        status: project.status || 'draft',
        technologies: project.technologies || [],
        author: project.author || 'Bamise',
        content: project.content || '',
        excerpt: project.excerpt || '',
        cover_image: project.cover_image || '',
        meta_title: project.meta_title || '',
        meta_description: project.meta_description || '',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
      };

      console.log('Saving project data:', projectData);

      if (params.action === 'new') {
        const { data, error } = await supabase.from('projects').insert([projectData]).select();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        console.log('Created project:', data);
      } else {
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', params.id)
          .select();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        console.log('Updated project:', data);
      }

      router.push('/dashboard/projects');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save project';
      setError(errorMessage);
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) throw error;
      router.push('/dashboard/projects');
    } catch (err) {
      setError('Failed to publish project');
      console.error('Error publishing project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setProject(prev => ({ ...prev, content }));
  };

  const handleAddTech = () => {
    if (newTech.trim() && !project.technologies.includes(newTech.trim())) {
      setProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }));
      setNewTech('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
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
              {params.action === 'new' ? 'New Project' : 'Edit Project'}
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
                  value={project.title}
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
                  value={project.slug}
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
                  value={project.cover_image}
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
                  value={project.author}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="github_url"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="github_url"
                  name="github_url"
                  value={project.github_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="live_url" className="block text-sm font-medium text-gray-300 mb-2">
                  Live URL
                </label>
                <input
                  type="url"
                  id="live_url"
                  name="live_url"
                  value={project.live_url}
                  onChange={handleChange}
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
                  value={project.status}
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
                  value={project.published_at || ''}
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
                value={project.excerpt}
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
                value={project.meta_title}
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
                value={project.meta_description}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Technologies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
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
                  value={newTech}
                  onChange={e => setNewTech(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add a technology"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
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
                  value={project.content}
                  onChange={handleContentChange}
                  onSave={() => handleSubmit}
                  onPreview={() => setIsPreview(!isPreview)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/projects')}
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
