import { createServerClient, CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Required environment variables are not set');
}

const SUPABASE_URL = supabaseUrl as string;
const SUPABASE_ANON_KEY = supabaseAnonKey as string;

export async function checkAuth() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          // 🔧 ADDED: parse JSON safely
          try {
            const cookie = cookieStore.get(name)?.value;
            return cookie ? JSON.parse(cookie) : undefined;
          } catch (err) {
            console.error('Error parsing cookie:', err);
            return undefined;
          }
        },
        set(name: string, value: any, options: CookieOptions) {
          // 🔧 CHANGED: store as JSON
          try {
            cookieStore.set({ name, value: JSON.stringify(value), ...options });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', expires: new Date(0), ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          // 🔧 ADDED: parse JSON safely
          try {
            const cookie = cookieStore.get(name)?.value;
            return cookie ? JSON.parse(cookie) : undefined;
          } catch (err) {
            console.error('Error parsing cookie:', err);
            return undefined;
          }
        },
        set(name: string, value: any, options: CookieOptions) {
          // 🔧 CHANGED: store as JSON
          try {
            cookieStore.set({ name, value: JSON.stringify(value), ...options });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', expires: new Date(0), ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}