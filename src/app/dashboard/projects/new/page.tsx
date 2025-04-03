'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Editor from '@/app/components/Editor';

interface Project {
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
}

export default function NewProject() {
  const router = useRouter();
  const [project, setProject] = useState<Project>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    meta_title: '',
    meta_description: '',
    technologies: [],
    github_url: '',
    live_url: '',
    status: 'draft',
    author: 'Bamise Omolaso',
  });
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('projects')
        .insert([
          { 
            ...project, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: project.status === 'published' ? new Date().toISOString() : null
          }
        ]);

      if (error) throw error;
      router.push('/dashboard/projects');
    } catch (err) {
      setError('Failed to save project');
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !project.technologies.includes(techInput.trim())) {
      setProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">New Project</h1>

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
            value={project.title}
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
            value={project.slug}
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
            value={project.excerpt}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="cover_image" className="block text-sm font-medium text-gray-300 mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            id="cover_image"
            name="cover_image"
            value={project.cover_image}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="meta_description" className="block text-sm font-medium text-gray-300 mb-2">
            Meta Description
          </label>
          <textarea
            id="meta_description"
            name="meta_description"
            value={project.meta_description}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="technologies" className="block text-sm font-medium text-gray-300 mb-2">
            Technologies
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {project.technologies.map(tech => (
              <span
                key={tech}
                className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(tech)}
                  className="ml-2 text-indigo-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
              placeholder="Add a technology"
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddTechnology}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="github_url" className="block text-sm font-medium text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            id="github_url"
            name="github_url"
            value={project.github_url}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
          <div className="bg-white">
            <Editor
              content={project.content}
              onChange={newContent => setProject(prev => ({ ...prev, content: newContent }))}
              placeholder="Write your project details here..."
            />
          </div>
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
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/projects')}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
