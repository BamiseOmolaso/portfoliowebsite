'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/client-auth';

interface DashboardStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalNewsletters: number;
  sentNewsletters: number;
  totalProjects: number;
  activeProjects: number;
  averageOpenRate: number;
  averageClickRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const supabase = createBrowserClient();
      
      // Fetch subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*');

      if (subscribersError) throw subscribersError;

      // Fetch newsletters
      const { data: newsletters, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*');

      if (newslettersError) throw newslettersError;

      // Fetch projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) throw projectsError;

      // Calculate stats
      const totalSubscribers = subscribers.length;
      const activeSubscribers = subscribers.filter(s => s.status === 'active').length;
      const totalNewsletters = newsletters.length;
      const sentNewsletters = newsletters.filter(n => n.status === 'sent').length;
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;

      // Calculate average rates
      const sentNewslettersWithMetrics = newsletters.filter(n => n.status === 'sent');
      const averageOpenRate = sentNewslettersWithMetrics.length > 0
        ? sentNewslettersWithMetrics.reduce((acc, n) => acc + (n.open_rate || 0), 0) / sentNewslettersWithMetrics.length
        : 0;
      const averageClickRate = sentNewslettersWithMetrics.length > 0
        ? sentNewslettersWithMetrics.reduce((acc, n) => acc + (n.click_rate || 0), 0) / sentNewslettersWithMetrics.length
        : 0;

      setStats({
        totalSubscribers,
        activeSubscribers,
        totalNewsletters,
        sentNewsletters,
        totalProjects,
        activeProjects,
        averageOpenRate,
        averageClickRate,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards - Better spacing, consistent heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-5 h-full shadow-lg hover:shadow-xl transition-all hover:border-gray-700"
        >
          <h2 className="text-lg font-medium text-gray-300 mb-2">Subscribers</h2>
          <p className="text-3xl font-bold text-white">{stats?.totalSubscribers}</p>
          <p className="text-sm text-gray-400 mt-2">
            {stats?.activeSubscribers} active
          </p>
          <div className="mt-4">
            <Link
              href="/admin/subscribers"
              className="inline-block text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              View all →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-5 h-full shadow-lg hover:shadow-xl transition-all hover:border-gray-700"
        >
          <h2 className="text-lg font-medium text-gray-300 mb-2">Newsletters</h2>
          <p className="text-3xl font-bold text-white">{stats?.totalNewsletters}</p>
          <p className="text-sm text-gray-400 mt-2">
            {stats?.sentNewsletters} sent
          </p>
          <div className="mt-4">
            <Link
              href="/admin/newsletters"
              className="inline-block text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              View all →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-5 h-full shadow-lg hover:shadow-xl transition-all hover:border-gray-700"
        >
          <h2 className="text-lg font-medium text-gray-300 mb-2">Projects</h2>
          <p className="text-3xl font-bold text-white">{stats?.totalProjects}</p>
          <p className="text-sm text-gray-400 mt-2">
            {stats?.activeProjects} active
          </p>
          <div className="mt-4">
            <Link
              href="/admin/projects"
              className="inline-block text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              View all →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-5 h-full shadow-lg hover:shadow-xl transition-all hover:border-gray-700"
        >
          <h2 className="text-lg font-medium text-gray-300 mb-2">Newsletter Performance</h2>
          <p className="text-3xl font-bold text-white">
            {stats?.averageOpenRate?.toFixed(1) || "0"}%
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Average open rate
          </p>
          <div className="mt-4">
            <Link
              href="/admin/performance"
              className="inline-block text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              View metrics →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Action Cards - Better spacing */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all"
        >
          <h2 className="text-xl font-semibold text-white mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/admin/blog/new"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Create New Blog Post
            </Link>
            <Link
              href="/admin/projects/new"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Add New Project
            </Link>
            <Link
              href="/admin/newsletters/new"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Create Newsletter
            </Link>
            <Link
              href="/admin/subscribers/import"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Import Subscribers
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all"
        >
          <h2 className="text-xl font-semibold text-white mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add recent activity items here */}
            <div className="flex items-center p-3 border border-gray-800 rounded-lg bg-gray-800/50">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="text-gray-300">No recent activity</div>
            </div>
            <Link 
              href="/admin/performance" 
              className="block text-center mt-4 text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              View all activity →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 