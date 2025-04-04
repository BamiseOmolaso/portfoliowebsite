'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function EditProject() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [originalProject, setOriginalProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Project not found');
        
        setProject(data);
        setOriginalProject(JSON.parse(JSON.stringify(data))); // Deep copy
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [params.id, supabase]);

  // Check for changes
  useEffect(() => {
    if (project && originalProject) {
      const currentProjectStr = JSON.stringify({
        title: project.title,
        slug: project.slug,
        excerpt: project.excerpt,
        content: project.content,
        cover_image: project.cover_image,
        technologies: project.technologies,
        github_url: project.github_url,
        live_url: project.live_url
      });
      
      const originalProjectStr = JSON.stringify({
        title: originalProject.title,
        slug: originalProject.slug,
        excerpt: originalProject.excerpt,
        content: originalProject.content,
        cover_image: originalProject.cover_image,
        technologies: originalProject.technologies,
        github_url: originalProject.github_url,
        live_url: originalProject.live_url
      });
      
      setHasChanges(currentProjectStr !== originalProjectStr);
    }
  }, [project, originalProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!project) return;
    
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleAddTechnology = () => {
    if (!techInput.trim() || !project) return;
    
    const newTech = techInput.trim();
    const technologies = [...(project.technologies || [])];
    
    if (!technologies.includes(newTech)) {
      technologies.push(newTech);
      setProject({ ...project, technologies });
    }
    
    setTechInput('');
  };

  const handleRemoveTechnology = (tech: string) => {
    if (!project) return;
    
    const technologies = (project.technologies || []).filter(t => t !== tech);
    setProject({ ...project, technologies });
  };

  const handleSave = async (shouldPublish = false) => {
    if (!project) return;
    
    try {
      shouldPublish ? setPublishing(true) : setSaving(true);
      setError(null);
      setSuccess(null);
      
      const updates = {
        ...project,
        updated_at: new Date().toISOString(),
        status: shouldPublish ? 'published' : project.status,
        published_at: shouldPublish ? new Date().toISOString() : project.published_at
      };
      
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id);
        
      if (error) throw error;
      
      // Update the original project to reflect saved changes
      setOriginalProject(JSON.parse(JSON.stringify(updates)));
      setSuccess(shouldPublish ? 'Project published successfully!' : 'Project saved successfully!');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
              </div>
              <div className="h-64 bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => router.push('/admin/projects')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Edit Project</h1>
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <div className="text-yellow-400 flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span>Unsaved changes</span>
                </div>
              )}
              <button
                onClick={() => router.push('/admin/projects')}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Projects
              </button>
            </div>
          </div>
          
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {project && (
            <div className="text-white">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Project Details</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'published' ? 'bg-green-100 text-green-800' : 
                      project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={project.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Slug</label>
                      <input
                        type="text"
                        name="slug"
                        value={project.slug}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image URL</label>
                      <input
                        type="text"
                        name="cover_image"
                        value={project.cover_image}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">GitHub URL</label>
                      <input
                        type="text"
                        name="github_url"
                        value={project.github_url || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Live URL</label>
                      <input
                        type="text"
                        name="live_url"
                        value={project.live_url || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Excerpt</label>
                      <textarea
                        name="excerpt"
                        value={project.excerpt}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Technologies</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.technologies && project.technologies.map(tech => (
                          <span 
                            key={tech} 
                            className="bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {tech}
                            <button 
                              onClick={() => handleRemoveTechnology(tech)}
                              className="ml-1.5 text-indigo-300 hover:text-white"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          placeholder="Add a technology"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTechnology();
                            }
                          }}
                        />
                        <button
                          onClick={handleAddTechnology}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                      <textarea
                        name="content"
                        value={project.content}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-800 mt-8">
                <div className="flex items-center justify-end space-x-4">
                  {project.status === 'published' && hasChanges && (
                    <div className="text-yellow-400 mr-auto">
                      <p>This project has unpublished changes.</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving || publishing || !hasChanges}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving || publishing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {publishing ? 'Publishing...' : hasChanges ? 'Save & Publish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 