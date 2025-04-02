'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Editor from '@/app/components/Editor';

interface Project {
  title: string;
  slug: string;
  description: string;
  content: string;
  image_url: string;
  github_url?: string;
  live_url?: string;
  published: boolean;
}

export default function NewProject() {
  const router = useRouter();
  const [project, setProject] = useState<Project>({
    title: '',
    slug: '',
    description: '',
    content: '',
    image_url: '',
    github_url: '',
    live_url: '',
    published: false,
  });
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
        .insert([{ ...project, created_at: new Date().toISOString() }]);

      if (error) throw error;
      router.push('/dashboard/projects');
    } catch (err) {
      setError('Failed to save project');
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={project.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={project.image_url}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content
          </label>
          <div className="bg-white">
            <Editor
              content={project.content}
              onChange={(newContent) => setProject((prev) => ({ ...prev, content: newContent }))}
              placeholder="Write your project details here..."
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={project.published}
            onChange={(e) => setProject((prev) => ({ ...prev, published: e.target.checked }))}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-300">
            Published
          </label>
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