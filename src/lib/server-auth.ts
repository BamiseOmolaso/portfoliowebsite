'use server';

import { createServerClient, CookieOptions } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    supabaseUrl as string,
    supabaseKey as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  return profile;
}

export async function checkAdminAccess() {
  try {
    const session = await getSession();
    const profile = await getProfile();

    if (!session) {
      redirect('/login');
    }

    if (!profile || profile.role !== 'admin') {
      redirect('/');
    }

    return { session, profile };
  } catch (err: unknown) {
    console.error('Admin access error:', err instanceof Error ? err.message : err);
    redirect('/');
  }
} 