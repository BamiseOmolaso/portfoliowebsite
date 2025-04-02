'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const projects = [
  {
    id: 1,
    title: 'Healthcare Analytics Platform',
    description: 'A comprehensive analytics platform for healthcare providers to track and analyze patient outcomes.',
    technologies: ['Python', 'TensorFlow', 'AWS', 'React'],
    category: 'Healthcare',
    imageUrl: '/images/portfolio/healthcare-analytics.jpg',
    link: '#',
  },
  {
    id: 2,
    title: 'Medical Image Analysis AI',
    description: 'AI-powered system for analyzing medical images and assisting in diagnosis.',
    technologies: ['Python', 'PyTorch', 'OpenCV', 'Docker'],
    category: 'AI & Healthcare',
    imageUrl: '/images/portfolio/medical-ai.jpg',
    link: '#',
  },
  {
    id: 3,
    title: 'Cloud-based EHR System',
    description: 'Scalable Electronic Health Record system built on cloud infrastructure.',
    technologies: ['AWS', 'Node.js', 'MongoDB', 'React'],
    category: 'Cloud Computing',
    imageUrl: '/images/portfolio/cloud-ehr.jpg',
    link: '#',
  },
  // Add more projects as needed
];

const PortfolioPage = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Portfolio</h1>
          <p className="text-gray-400 text-lg">
            Showcasing my work in healthcare data science, AI, and cloud technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: project.id * 0.1 }}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gray-800">
                <div className="absolute inset-0 bg-purple-500/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl text-purple-400 opacity-50">{project.category}</span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-white">{project.title}</h2>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-sm bg-purple-500/10 text-purple-400 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300"
                >
                  View Project
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage; 