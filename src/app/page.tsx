'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<string, boolean>>({});

  const featuredVideos = [
    {
      id: '1',
      title: 'Deploying a React App to AWS S3 and CloudFront',
      videoId: 'E23fKTyiSgM',
      views: '100+',
      date: '1 month ago'
    },
    {
      id: '2',
      title: 'AWS S3 Static Website Hosting with Custom Domain',
      videoId: 'yBJlQmUttwQ',
      views: '50+',
      date: '1 month ago'
    },
    {
      id: '3',
      title: 'AWS CloudFront Distribution Setup Guide',
      videoId: '6y595Svv5l4',
      views: '75+',
      date: '1 month ago'
    }
  ];

  const handleThumbnailError = (videoId: string) => {
    setThumbnailErrors(prev => ({ ...prev, [videoId]: true }));
  };

  const getThumbnailUrl = (videoId: string) => {
    if (thumbnailErrors[videoId]) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-gray-950 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">O.O</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Hi, I'm <span className="text-purple-400">Bamise</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-300 mb-6">
              Data Scientist & Cloud Specialist
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                Healthcare
              </span>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                Data Science
              </span>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                AI
              </span>
            </div>

            <div className="flex gap-4">
              <Link
                href="/portfolio"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                View My Work
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 border border-purple-500 rounded-lg font-medium hover:bg-purple-500/10 transition-colors"
              >
                Contact Me
              </Link>
              <Link
                href="/newsletter"
                className="px-6 py-3 bg-purple-500/10 text-purple-400 rounded-lg font-medium hover:bg-purple-500/20 transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Subscribe
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Bamise Teaches Cloud</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join me on YouTube for in-depth tutorials on AWS Cloud Services, DevOps practices, and cloud architecture for healthcare applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 rounded-lg overflow-hidden group hover:transform hover:scale-105 transition-all duration-300"
              >
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
                  className="block relative aspect-video bg-gray-900"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <svg
                      className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
          <Image
                    src={getThumbnailUrl(video.videoId)}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:opacity-80 transition-opacity"
                    onError={() => handleThumbnailError(video.videoId)}
                    priority={video.id === '1'}
                  />
                </a>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <span>{video.views} views</span>
                    <span className="mx-2">•</span>
                    <span>{video.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.youtube.com/@bamiseteachescloud/videos"
          target="_blank"
          rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Subscribe to My Channel
            </a>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest Blog Posts</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Insights and analysis on healthcare data science, AI applications, and cloud technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Blog post cards will be added here */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-700"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Sample Blog Post</h3>
                <p className="text-gray-400 text-sm mb-4">March 1, 2024</p>
                <p className="text-gray-300 mb-4">
                  Brief excerpt from the blog post goes here...
                </p>
                <Link href="/blog" className="text-purple-400 hover:text-purple-300">
                  Read More →
                </Link>
              </div>
            </div>
            {/* Add more blog post cards as needed */}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-block px-6 py-3 border border-purple-500 rounded-lg font-medium hover:bg-purple-500/10 transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A selection of my work in healthcare data science and cloud solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project cards will be added here */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-700"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Project Title</h3>
                <p className="text-gray-300 mb-4">
                  Brief description of the project and its impact...
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-sm">
                    Python
                  </span>
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-sm">
                    TensorFlow
                  </span>
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-sm">
                    AWS
                  </span>
                </div>
                <Link
                  href="/portfolio"
                  className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition-colors"
                >
                  View Project
                </Link>
              </div>
            </div>
            {/* Add more project cards as needed */}
          </div>
        </div>
      </section>
    </div>
  );
}
