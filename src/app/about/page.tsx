'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

export default function AboutPage() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const skills = [
    'Next.js',
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'AWS',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'Git',
  ];

  const experience = [
    {
      title: 'Full Stack Developer',
      company: 'Tech Corp',
      period: '2020 - Present',
      description:
        'Developed and maintained web applications using Next.js, React, and Node.js. Implemented CI/CD pipelines and managed cloud infrastructure.',
    },
    {
      title: 'Cloud Engineer',
      company: 'Cloud Solutions Inc',
      period: '2018 - 2020',
      description:
        'Managed AWS infrastructure, implemented containerization solutions, and automated deployment processes.',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-8">About Me</h1>
            <p className="text-gray-400 text-lg mb-6">
              I&apos;m a passionate Full Stack Developer and Cloud Engineer with expertise in modern web
              technologies and cloud infrastructure. I love building scalable applications and solving
              complex problems.
            </p>
            <div className="flex gap-4">
              <a
                href="/cv/Oluwabamise Omolaso_CV_2025.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
              </a>
              <a
                href="/cv/Oluwabamise Omolaso_CV_2025.pdf"
                download
                className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download CV
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-colors"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact Me
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="bg-gray-800 rounded-lg p-3 text-center text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Experience</h2>
            <div className="space-y-8">
              {experience.map((job, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                  <p className="text-purple-400">{job.company}</p>
                  <p className="text-gray-500 text-sm">{job.period}</p>
                  <p className="text-gray-400 mt-2">{job.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
