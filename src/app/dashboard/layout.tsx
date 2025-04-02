'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 py-6">
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
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 