'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="md:hidden py-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-300 hover:text-white"
          >
            {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 py-6`}>
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  pathname === '/dashboard'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Contact Messages
              </Link>
              <Link
                href="/dashboard/subscribers"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  pathname === '/dashboard/subscribers'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Newsletter Subscribers
              </Link>
              <Link
                href="/dashboard/blog"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  pathname.startsWith('/dashboard/blog')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Blog Posts
              </Link>
              <Link
                href="/dashboard/projects"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  pathname.startsWith('/dashboard/projects')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Projects
              </Link>
              <Link
                href="/dashboard/newsletters"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  pathname.startsWith('/dashboard/newsletters')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Newsletters
              </Link>
              <Link
                href="/dashboard/newsletters/metrics"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  pathname.startsWith('/dashboard/newsletters/metrics')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Newsletter Metrics
              </Link>
              <Link
                href="/dashboard/performance"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  pathname.startsWith('/dashboard/performance')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Performance
              </Link>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
