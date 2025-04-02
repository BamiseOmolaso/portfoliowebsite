'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

const AboutPage = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const skills = [
    { name: 'Healthcare Data Analysis', level: 95 },
    { name: 'Machine Learning', level: 90 },
    { name: 'Cloud Architecture', level: 85 },
    { name: 'AI Applications', level: 88 },
    { name: 'Data Visualization', level: 92 },
    { name: 'Statistical Modeling', level: 87 },
    { name: 'AWS Services', level: 85 },
    { name: 'Python Development', level: 90 },
  ];

  const experience = [
    {
      title: 'Senior Data Scientist',
      organization: 'Healthcare Tech Solutions',
      period: '2020 - Present',
      description: 'Leading data science initiatives in healthcare analytics and AI applications.',
    },
    {
      title: 'Cloud Solutions Architect',
      organization: 'Digital Health Platform',
      period: '2018 - 2020',
      description: 'Designed and implemented cloud infrastructure for healthcare applications.',
    },
    {
      title: 'Research Fellow',
      organization: 'Medical Research Institute',
      period: '2016 - 2018',
      description: 'Conducted research in healthcare data science and machine learning.',
    },
  ];

  const education = [
    {
      degree: 'Ph.D. in Data Science',
      institution: 'University of Technology',
      year: '2016',
    },
    {
      degree: 'M.Sc. in Computer Science',
      institution: 'State University',
      year: '2013',
    },
    {
      degree: 'B.Sc. in Mathematics',
      institution: 'National University',
      year: '2011',
    },
  ];

  const handleDownloadResume = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/assets/docs/Oluwabamise Omolaso_CV_2025.pdf';
    link.download = 'Oluwabamise Omolaso_CV_2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  };

  const handleViewResume = () => {
    window.open('/assets/docs/Oluwabamise Omolaso_CV_2025.pdf', '_blank');
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">About Me</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            A passionate data scientist and cloud specialist focused on healthcare innovation.
          </p>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Skills & Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{skill.name}</span>
                    <span className="text-purple-400">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-purple-500 to-purple-700 h-2.5 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Background */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">My Background</h2>
            <p className="text-gray-300 mb-6">
              Dr. Oluwabamise David Omolaso is a distinguished data scientist and cloud specialist
              with a passion for healthcare innovation. With years of experience in healthcare
              data science and cloud technologies, he has developed expertise in leveraging
              artificial intelligence and machine learning to solve complex healthcare challenges.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={handleDownloadResume}
                disabled={isDownloading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {isDownloading ? 'Downloading...' : 'Download CV'}
              </button>
              <button
                onClick={handleViewResume}
                className="inline-flex items-center px-6 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View CV
              </button>
            </div>
          </motion.div>

          {/* Right Column - Experience Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6">Experience</h2>
            <div className="space-y-8">
              {experience.map((item, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-0 w-4 h-4 bg-purple-500 rounded-full"></div>
                  <div className="absolute left-0 top-4 w-0.5 h-full bg-purple-500/20"></div>
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-purple-400 mb-2">{item.organization}</p>
                    <p className="text-gray-400 text-sm mb-4">{item.period}</p>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 