'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError('Failed to check session: ' + error.message);
          return;
        }

        if (session) {
          // Check if user is an admin
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            setError('Failed to check user role');
            return;
          }

          if (profile && profile.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
        }
      } catch (err) {
        setError('Failed to check session');
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  useEffect(() => {
    // Reset failed attempts after 15 minutes
    if (failedAttempts > 0) {
      const timer = setTimeout(() => {
        setFailedAttempts(0);
      }, 15 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [failedAttempts]);

  useEffect(() => {
    // Handle account lockout
    if (failedAttempts >= 5) {
      setIsLocked(true);
      const lockoutEnd = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
      setLockoutTime(lockoutEnd);
      
      const timer = setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        setLockoutTime(null);
      }, 30 * 60 * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [failedAttempts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isLocked) {
      setError('Account is temporarily locked. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      // Test database connection first
      try {
        const { error: testError } = await supabase
          .from('blog_posts')
          .select('count')
          .limit(1);

        if (testError) {
          throw new Error('Database connection failed: ' + testError.message);
        }
      } catch (testErr) {
        throw new Error('Failed to connect to the database');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFailedAttempts(prev => prev + 1);
        throw error;
      }

      // Check if user is an admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to check user role');
      }

      if (!profile || profile.role !== 'admin') {
        router.replace('/');
        return;
      }

      router.replace('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {isLocked && lockoutTime && (
            <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded">
              Account locked until {lockoutTime.toLocaleTimeString()}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={isLocked}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={isLocked}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isLocked}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
