'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: 'Healthcare Data Science: Trends and Insights',
    excerpt: 'Exploring the latest trends in healthcare data science and their impact on patient care.',
    date: '2024-03-15',
    category: 'Healthcare',
    imageUrl: '/images/blog/healthcare-data.jpg',
    slug: 'healthcare-data-science-trends',
  },
  {
    id: 2,
    title: 'Cloud Architecture Best Practices',
    excerpt: 'Essential best practices for designing scalable and secure cloud architectures.',
    date: '2024-03-10',
    category: 'Cloud Computing',
    imageUrl: '/images/blog/cloud-architecture.jpg',
    slug: 'cloud-architecture-best-practices',
  },
  {
    id: 3,
    title: 'AI in Medical Diagnosis',
    excerpt: 'How artificial intelligence is revolutionizing medical diagnosis and treatment planning.',
    date: '2024-03-05',
    category: 'AI & Healthcare',
    imageUrl: '/images/blog/ai-medical.jpg',
    slug: 'ai-in-medical-diagnosis',
  },
  // Add more blog posts as needed
];

const BlogPage = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-gray-400 text-lg">
            Insights and thoughts on healthcare data science, cloud technology, and AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: post.id * 0.1 }}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gray-800">
                <div className="absolute inset-0 bg-purple-500/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl text-purple-400 opacity-50">Blog</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-purple-400">{post.category}</span>
                  <span className="text-sm text-gray-400">{post.date}</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-white">{post.title}</h2>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-purple-400 hover:text-purple-300"
                >
                  Read more
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage; 